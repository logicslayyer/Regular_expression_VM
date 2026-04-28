from collections import deque
import re

class State:
    """Represents a state in the automaton."""
    _id_counter = 0

    @classmethod
    def reset_counter(cls):
        cls._id_counter = 0

    def __init__(self, is_end=False):
        self.id = State._id_counter
        State._id_counter += 1
        self.is_end = is_end
        self.transitions = {}         # char: set of states
        self.epsilon_transitions = set()  # set of states

    def __repr__(self):
        return f"State({self.id})"

class NFA:
    def __init__(self, start_state, end_state):
        self.start_state = start_state
        self.end_state = end_state

def create_basic_nfa(char):
    s_start = State()
    s_end = State(is_end=True)
    if char == 'ε':
        s_start.epsilon_transitions.add(s_end)
    else:
        s_start.transitions[char] = {s_end}
    return NFA(s_start, s_end)

def create_concat_nfa(nfa1, nfa2):
    nfa1.end_state.is_end = False
    nfa1.end_state.epsilon_transitions.add(nfa2.start_state)
    return NFA(nfa1.start_state, nfa2.end_state)

def create_union_nfa(nfa1, nfa2):
    s_start = State()
    s_end = State(is_end=True)

    s_start.epsilon_transitions.add(nfa1.start_state)
    s_start.epsilon_transitions.add(nfa2.start_state)

    nfa1.end_state.is_end = False
    nfa2.end_state.is_end = False
    
    nfa1.end_state.epsilon_transitions.add(s_end)
    nfa2.end_state.epsilon_transitions.add(s_end)

    return NFA(s_start, s_end)

def create_kleene_nfa(nfa):
    s_start = State()
    s_end = State(is_end=True)

    s_start.epsilon_transitions.add(nfa.start_state)
    s_start.epsilon_transitions.add(s_end)

    nfa.end_state.is_end = False
    nfa.end_state.epsilon_transitions.add(nfa.start_state)
    nfa.end_state.epsilon_transitions.add(s_end)

    return NFA(s_start, s_end)

def postfix_to_nfa(postfix):
    State.reset_counter()
    stack = []
    
    if not postfix:
        # Empty string NFA
        return create_basic_nfa('ε')

    for char in postfix:
        if char == '*':
            nfa = stack.pop()
            stack.append(create_kleene_nfa(nfa))
        elif char == '|':
            nfa2 = stack.pop()
            nfa1 = stack.pop()
            stack.append(create_union_nfa(nfa1, nfa2))
        elif char == '.':
            nfa2 = stack.pop()
            nfa1 = stack.pop()
            stack.append(create_concat_nfa(nfa1, nfa2))
        else:
            stack.append(create_basic_nfa(char))

    return stack.pop()


# --- DFA Conversion logic ---

def epsilon_closure(states):
    closure = set(states)
    stack = list(states)

    while stack:
        state = stack.pop()
        for eps_state in state.epsilon_transitions:
            if eps_state not in closure:
                closure.add(eps_state)
                stack.append(eps_state)
    
    return frozenset(closure)

def move(states, char):
    next_states = set()
    for state in states:
        if char in state.transitions:
            next_states.update(state.transitions[char])
    return frozenset(next_states)

def get_alphabet(nfa):
    alphabet = set()
    visited = set()
    q = deque([nfa.start_state])
    while q:
        curr = q.popleft()
        if curr in visited:
            continue
        visited.add(curr)
        for char, states in curr.transitions.items():
            alphabet.add(char)
            for s in states:
                if s not in visited:
                    q.append(s)
        for s in curr.epsilon_transitions:
            if s not in visited:
                q.append(s)
    return sorted(alphabet)

class DFA:
    def __init__(self, alphabet):
        self.states = [] # list of frozensets of NFA states
        self.transitions = {} # dict mapping DFA state index to {char: DFA state index}
        self.start_state = 0
        self.accept_states = set()
        self.alphabet = alphabet

def nfa_to_dfa(nfa):
    alphabet = get_alphabet(nfa)
    dfa = DFA(alphabet)
    state_index = {}
    dead_state = frozenset()

    start_closure = epsilon_closure([nfa.start_state])
    dfa.states.append(start_closure)
    state_index[start_closure] = 0

    unmarked = [start_closure]

    def add_state(subset):
        if subset not in state_index:
            state_index[subset] = len(dfa.states)
            dfa.states.append(subset)
        return state_index[subset]

    while unmarked:
        current_dfa_state = unmarked.pop(0)
        current_idx = state_index[current_dfa_state]
        dfa.transitions[current_idx] = {}

        if any(state.is_end for state in current_dfa_state):
            dfa.accept_states.add(current_idx)

        for char in alphabet:
            next_states = move(current_dfa_state, char)
            if not next_states:
                dead_idx = add_state(dead_state)
                dfa.transitions[current_idx][char] = dead_idx
                if dead_state not in unmarked and dead_idx not in dfa.transitions:
                    unmarked.append(dead_state)
                continue

            next_closure = epsilon_closure(next_states)

            if next_closure not in state_index:
                add_state(next_closure)
                unmarked.append(next_closure)

            dfa.transitions[current_idx][char] = state_index[next_closure]

    if dead_state in state_index:
        dead_idx = state_index[dead_state]
        dfa.transitions.setdefault(dead_idx, {})
        for char in alphabet:
            dfa.transitions[dead_idx][char] = dead_idx

    return dfa

# --- Simulation Logic ---

def simulate_dfa(dfa, input_string):
    """
    Simulates DFA and returns trace: list of (current_state, char, next_state)
    Also returns True/False for accepted/rejected.
    """
    trace = []
    current_state = dfa.start_state
    dead_state = None
    for idx, subset in enumerate(dfa.states):
        if not subset:
            dead_state = idx
            break

    # Initial state
    trace.append(("START", "", current_state))

    for char in input_string:
        next_state = dfa.transitions.get(current_state, {}).get(char)
        if next_state is None:
            next_state = dead_state
            trace.append((current_state, char, next_state))
            current_state = next_state if next_state is not None else current_state
            trace.append((current_state, "END", "REJECTED"))
            return False, trace
        trace.append((current_state, char, next_state))
        current_state = next_state

    is_accepted = current_state in dfa.accept_states
    trace.append((current_state, "END", "ACCEPTED" if is_accepted else "REJECTED"))
    return is_accepted, trace

def format_nfa_transitions(nfa):
    """Returns a list of strings representing NFA transitions for GUI display"""
    visited = set()
    q = deque([nfa.start_state])
    lines = []
    
    while q:
        curr = q.popleft()
        if curr in visited:
            continue
        visited.add(curr)
        
        # Determine state label
        label = f"q{curr.id}"
        if curr == nfa.start_state:
            label += " (Start)"
        if curr.is_end:
            label += " (Accept)"
            
        for char, states in curr.transitions.items():
            for s in states:
                lines.append(f"q{curr.id} --{char}--> q{s.id}")
                if s not in visited:
                    q.append(s)
        for s in curr.epsilon_transitions:
            lines.append(f"q{curr.id} --ε--> q{s.id}")
            if s not in visited:
                q.append(s)
    
    def sort_key(line):
        source = line.split('--')[0].strip()
        match = re.search(r'q(\d+)', source)
        return int(match.group(1)) if match else float('inf')

    return sorted(list(set(lines)), key=sort_key)

def _dfa_state_label(dfa, state_idx):
    label = f"d{state_idx}"
    if state_idx == dfa.start_state:
        label += " (Start)"
    if state_idx in dfa.accept_states:
        label += " (Accept)"
    if not dfa.states[state_idx]:
        label += " (Dead)"
    return label

def format_dfa_transitions(dfa):
    """Returns a list of strings representing DFA transitions for GUI display"""
    lines = []
    for state_idx, trans in dfa.transitions.items():
        label_curr = _dfa_state_label(dfa, state_idx)
            
        for char, target_idx in trans.items():
            label_tgt = _dfa_state_label(dfa, target_idx)
            lines.append(f"{label_curr} --{char}--> {label_tgt}")
            
    if not lines:
        lines.append("No transitions.")
    return sorted(list(set(lines)))

def format_nfa_cyto(nfa):
    """Returns elements list for Cytoscape.js"""
    visited = set()
    q = deque([nfa.start_state])
    nodes = []
    edges = []
    edge_id = 0

    while q:
        curr = q.popleft()
        if curr in visited:
            continue
        visited.add(curr)

        classes = "accept" if curr.is_end else ""
        if curr == nfa.start_state:
            classes += " start"
            
        nodes.append({
            "data": {"id": f"q{curr.id}", "label": f"q{curr.id}"},
            "classes": classes.strip()
        })

        for char, states in curr.transitions.items():
            for s in states:
                edges.append({
                    "data": {"id": f"e_nfa_{edge_id}", "source": f"q{curr.id}", "target": f"q{s.id}", "label": char}
                })
                edge_id += 1
                if s not in visited:
                    q.append(s)
        for s in curr.epsilon_transitions:
            edges.append({
                "data": {"id": f"e_nfa_{edge_id}", "source": f"q{curr.id}", "target": f"q{s.id}", "label": "ε"}
            })
            edge_id += 1
            if s not in visited:
                q.append(s)

    return nodes + edges

def format_dfa_cyto(dfa):
    """Returns elements list for Cytoscape.js"""
    nodes = []
    edges = []
    edge_id = 0

    for state_idx in range(len(dfa.states)):
        classes = "accept" if state_idx in dfa.accept_states else ""
        if state_idx == dfa.start_state:
            classes += " start"
        label = f"d{state_idx}" if dfa.states[state_idx] else "∅"
            
        nodes.append({
            "data": {"id": f"d{state_idx}", "label": label},
            "classes": classes.strip()
        })

    for state_idx, trans in dfa.transitions.items():
        for char, target_idx in trans.items():
            edges.append({
                "data": {"id": f"e_dfa_{edge_id}", "source": f"d{state_idx}", "target": f"d{target_idx}", "label": char}
            })
            edge_id += 1

    return nodes + edges
