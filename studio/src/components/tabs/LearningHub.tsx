import React, { useState } from 'react';

const TOPICS = [
  {
    group: 'Regular Languages',
    items: [
      { id: 'regexp', label: 'Regular Expressions', icon: '🔤' },
      { id: 'nfa', label: 'NFAs & DFAs', icon: '🔄' },
      { id: 'thompson', label: "Thompson's Construction", icon: '⚡' },
      { id: 'subset', label: 'Subset Construction', icon: '📦' },
      { id: 'pumping', label: 'Pumping Lemma', icon: '🔁' },
    ]
  },
  {
    group: 'Context-Free Grammars',
    items: [
      { id: 'cfg', label: 'CFGs & Parse Trees', icon: '🌲' },
      { id: 'cnf', label: 'Chomsky Normal Form', icon: '📐' },
      { id: 'cyk', label: 'CYK Algorithm', icon: '🗃️' },
      { id: 'pda-theory', label: 'Pushdown Automata', icon: '📚' },
    ]
  },
  {
    group: 'Turing Machines',
    items: [
      { id: 'tm-intro', label: 'Turing Machine Model', icon: '💾' },
      { id: 'decidability', label: 'Decidability', icon: '❓' },
      { id: 'halting', label: 'Halting Problem', icon: '♾️' },
      { id: 'reductions', label: 'Mapping Reductions', icon: '↔️' },
    ]
  },
  {
    group: 'Complexity Theory',
    items: [
      { id: 'p-np', label: 'P vs NP', icon: '⚖️' },
      { id: 'np-complete', label: 'NP-Completeness', icon: '🔒' },
      { id: 'sat', label: 'SAT & Reductions', icon: '⚙️' },
    ]
  },
  {
    group: 'Resources',
    items: [
      { id: 'video-lectures', label: 'Prof. Anuja Zade Lectures', icon: '▶️' },
    ]
  },
];

const CONTENT: Record<string, { title: string; content: string }> = {
  regexp: {
    title: 'Regular Expressions',
    content: `## Regular Expressions

A **regular expression** (RE) is a formal notation for describing a set of strings (a **regular language**).

### Basic Operations

| Notation | Meaning |
|---|---|
| \`a\` | Matches literal character 'a' |
| \`ε\` | Matches the empty string |
| \`R₁ ∣ R₂\` | Union: matches R₁ or R₂ |
| \`R₁R₂\` | Concatenation: R₁ followed by R₂ |
| \`R*\` | Kleene star: zero or more R |
| \`R+\` | Plus: one or more R |
| \`R?\` | Optional: zero or one R |

### Examples

- \`(a|b)*\` — all strings over {a, b}
- \`a(a|b)*b\` — strings starting with 'a' and ending with 'b'
- \`(ab)+\` — one or more repetitions of 'ab'

### Kleene's Theorem

Every regular language can be described by a regular expression, and every regular expression describes a regular language. The regular languages are exactly the languages accepted by DFAs (and NFAs).`
  },
  nfa: {
    title: 'NFAs & DFAs',
    content: `## Nondeterministic & Deterministic Finite Automata

### DFA (Deterministic Finite Automaton)
A DFA is a 5-tuple **(Q, Σ, δ, q₀, F)** where:
- **Q** — finite set of states
- **Σ** — finite input alphabet
- **δ: Q × Σ → Q** — transition function
- **q₀ ∈ Q** — start state
- **F ⊆ Q** — set of accepting states

At each step, there is **exactly one** next state.

### NFA (Nondeterministic Finite Automaton)
Same structure, but:
- **δ: Q × Σ_ε → P(Q)** — transition function returns a *set* of states
- Can have ε-transitions (move without consuming input)
- Multiple active states simultaneously

### Key Theorems
- Every NFA has an equivalent DFA (Subset Construction)
- Every DFA is a special case of NFA
- Both recognize exactly the **regular languages**`
  },
  thompson: {
    title: "Thompson's Construction",
    content: `## Thompson's Construction

Thompson's Construction converts a regular expression into an **ε-NFA** systematically.

### Base Cases
- **ε**: Two states with ε-transition
- **Literal a**: Two states with a-transition

### Inductive Cases

**Union (R₁ | R₂):**
- New start state → ε to both sub-NFAs
- Both sub-NFAs → ε to new accept state

**Concatenation (R₁R₂):**
- Connect accept of R₁ to start of R₂ via ε

**Kleene Star (R*):**
- New start → ε to inner, and → ε to new accept
- Inner accept → ε back to inner start
- Inner accept → ε to new accept

### Property
For a regex of length **n**, Thompson's NFA has at most **2n** states.`
  },
  subset: {
    title: 'Subset Construction',
    content: `## Subset Construction (NFA → DFA)

The subset construction algorithm converts an NFA into an equivalent DFA.

### ε-Closure
For a set of states S, the **ε-closure** is the set of all states reachable from S via ε-transitions only.

\`\`\`
ε-closure(S) = S ∪ {q : ∃ ε-path from some s ∈ S to q}
\`\`\`

### Algorithm
1. Start: DFA start state = ε-closure({NFA start state})
2. For each DFA state (set of NFA states) and each symbol a:
   - Compute **move(S, a)** = {q : ∃ s ∈ S with s --a--> q}
   - Compute **ε-closure(move(S, a))**
   - This becomes a new DFA state
3. A DFA state is accepting if it contains any NFA accepting state

### Complexity
NFA with n states → DFA with at most **2ⁿ** states (worst case)`
  },
  'p-np': {
    title: 'P vs NP',
    content: `## P vs NP

This is one of the greatest unsolved problems in computer science.

### Class P
Problems solvable in **polynomial time** by a deterministic TM.
- Sorting, shortest paths, matrix multiplication

### Class NP
Problems where solutions can be **verified** in polynomial time.
- Boolean satisfiability (SAT)
- Graph coloring, traveling salesman, vertex cover

### The Question
**Is P = NP?**

If P = NP, then every problem whose solution can be quickly verified can also be quickly solved. Most experts believe P ≠ NP.

### NP-Completeness
A problem X is NP-complete if:
1. X ∈ NP
2. Every NP problem reduces to X in polynomial time

**Cook-Levin Theorem**: SAT is NP-complete.`
  },
  pumping: {
    title: 'Pumping Lemma',
    content: `## The Pumping Lemma for Regular Languages

The Pumping Lemma is a mathematical contradiction tool used to prove that a specific language is **not** regular.

### The Lemma
If a language **L** is regular, then there exists a pumping length **p** such that any string **s** in L where |s| ≥ p can be divided into three pieces, **s = xyz**, satisfying the following conditions:
1. **xyⁱz ∈ L** for every i ≥ 0
2. **|y| > 0**
3. **|xy| ≤ p**

### How it works
Any sufficiently long string in a regular language must walk through a cycle in its DFA. The substring **y** corresponds to the cyclic path, which implies it can be "pumped" (repeated) any number of times (**i**) while still ending up in an accepting state.

### Common Usage
Used in proof by contradiction to show languages like L = { aⁿbⁿ | n ≥ 0 } are irregular.`
  },
  cfg: {
    title: 'Context-Free Grammars',
    content: `## Context-Free Grammars (CFG)

A CFG is a formal grammar that describes a **context-free language**, which is strictly more powerful than regular languages.

### Formal Definition
A CFG is a 4-tuple **(V, Σ, R, S)**:
- **V** — finite set of variables (non-terminals)
- **Σ** — finite set of terminals
- **R** — finite set of production rules of the form A → α, where A ∈ V and α ∈ (V ∪ Σ)*
- **S** — the start variable

### Why use CFGs?
CFGs can count and nest, making them essential for parsing programming languages (handling nested parentheses \`(())\`, block scopes \`{ ... }\`, etc).`
  },
  cyk: {
    title: 'CYK Algorithm',
    content: `## Cocke-Younger-Kasami (CYK) Algorithm

CYK is a dynamic programming algorithm used for parsing context-free grammars. It determines whether a string **w** can be generated by a given CFG.

### Requirements
The CFG must be in **Chomsky Normal Form (CNF)**, where every rule is either:
- A → BC (two non-terminals)
- A → a (one terminal)

### Logic
For a string of length **n**, it builds an n × n triangular table. Each cell (i, j) computes all non-terminals that can generate the substring of length j starting at index i. It works iteratively from length 1 up to n.

### Complexity
- **Time Constraint:** O(n³ * |G|), making it one of the most efficient generalized CFG parsers.
- **Used In:** Natural language processing, compiler theory.`
  },
  'tm-intro': {
    title: 'Turing Machine Model',
    content: `## Turing Machines

A Turing Machine (TM) is a mathematical model of computation that defines an abstract computational device. It is considered universally capable of any calculation that a modern computer can perform.

### Components
- **Infinite Tape:** An arbitrarily long strip of memory cells.
- **Read/Write Head:** A cursor that can read data, write symbols, and move Left/Right.
- **State Register:** The current "mode" of the machine.
- **Transition Function:** The logic: Given (Current State, Tape Symbol) → (New State, Write Symbol, Move L/R).

### Church-Turing Thesis
"Everything computable is computable by a Turing Machine." If an algorithm exists, a Turing Machine can execute it.`
  },
  halting: {
    title: 'The Halting Problem',
    content: `## The Halting Problem

Proved by Alan Turing in 1936, the Halting Problem is the fundamental proof that **some problems are unsolvable** by computers.

### The Statement
It is **impossible** to write a general computer program that can determine, for every possible program-input pair, whether that program will eventually stop (halt) or run forever in an infinite loop.

### The Proof (Contradiction)
Assume such a Halting checker **H(P, i)** exists.
Now build a tricky program **D(P)**:
- D uses H to ask if P halts on P.
- If H says "Yes, P halts", D enters an infinite loop.
- If H says "No, P loops", D halts.

Now, feed D to itself: **D(D)**!
If D halts, D loops. If D loops, D halts. A paradox! Thus, H cannot exist.`
  },
  'np-complete': {
    title: 'NP-Completeness',
    content: `## NP-Complete

A problem is NP-Complete if it is the "hardest" problem in the NP class. If you can find a fast (polynomial time) algorithm to solve any NP-Complete problem, you immediately prove **P = NP**.

### Requirements
For problem X to be NP-complete:
1. X must be in **NP** (a given solution can be verified quickly).
2. X is **NP-hard** (every problem in NP can be translated/reduced to X in polynomial time).

### Famous Examples
- **Boolean SAT:** Is there an assignment of True/False to a boolean formula that makes it True?
- **Traveling Salesman (Decision):** Is there a route visiting all cities under distance D?
- **Graph Coloring:** Can a map be colored with K colors without adjacent regions matching?`
  },
  cnf: {
    title: 'Chomsky Normal Form',
    content: `## Chomsky Normal Form (CNF)

A Context-Free Grammar is in Chomsky Normal Form if every rule is of the form:
- **A → BC** (a variable generates two variables)
- **A → a** (a variable generates one terminal)
- **S → ε** (start variable generates empty string, if ε is in the language)

### Why CNF?
- It standardizes CFGs, making them easier to parse.
- Any CFG can be converted into an equivalent CFG in CNF.
- If a grammar is in CNF, any derivation of a string of length **n** requires exactly **2n - 1** steps.
- Required for algorithms like the **CYK Algorithm**.`
  },
  'pda-theory': {
    title: 'Pushdown Automata',
    content: `## Pushdown Automata (PDA)

A Pushdown Automaton is essentially a Finite Automaton equipped with a **Stack** (LIFO memory). It is the computational model equivalent to Context-Free Grammars.

### Components
- Finite control (states and transitions)
- Input tape (read-only, left-to-right)
- **Stack** (infinite capacity, but can only access the top element)

### Transitions
A transition depends on:
1. Current State
2. Current Input Symbol (or ε)
3. Top Symbol of the Stack

In a single step, the PDA can change state and **push** or **pop** symbols from the stack.

### Power
Because of the stack, PDAs can recognize languages like \`L = {aⁿbⁿ | n ≥ 0}\`, which are not regular. However, they cannot recognize \`L = {aⁿbⁿcⁿ | n ≥ 0}\` (which requires a Turing Machine).`
  },
  decidability: {
    title: 'Decidability',
    content: `## Decidability

In computability theory, a language is **decidable** (or recursive) if there exists a Turing Machine that always halts and correctly accepts or rejects every input string.

### Decidable vs Recognizable
- **Turing-Decidable**: TM always halts (accepts or rejects).
- **Turing-Recognizable**: TM accepts valid strings, but might loop forever on invalid ones.

### Key Results
- Every decidable language is recognizable.
- Not every recognizable language is decidable (e.g., the Halting Problem).
- A language is decidable if and only if both it and its complement are Turing-recognizable.`
  },
  reductions: {
    title: 'Mapping Reductions',
    content: `## Mapping Reductions

A reduction is a way of converting one problem into another in such a way that a solution to the second problem can be used to solve the first.

### Definition
Language A is **mapping reducible** to Language B (denoted A ≤_m B) if there is a computable function **f** such that for every input **w**:
- **w ∈ A** if and only if **f(w) ∈ B**.

### Implications
- If A ≤_m B and B is decidable, then A is decidable.
- If A ≤_m B and A is undecidable, then B is undecidable.

Reductions are the primary tool used to prove that a problem is undecidable (by reducing the Halting Problem to it) or NP-Complete.`
  },
  sat: {
    title: 'SAT & Reductions',
    content: `## Boolean Satisfiability (SAT)

The Boolean Satisfiability Problem (SAT) asks whether there exists an assignment of truth values (True/False) to a set of boolean variables that makes the entire boolean formula evaluate to True.

### 3-SAT
A special case of SAT where the formula is in Conjunctive Normal Form (CNF), and each clause has exactly 3 literals. (e.g., \`(x₁ ∨ ¬x₂ ∨ x₃) ∧ (¬x₁ ∨ x₄ ∨ x₂)\`).

### Importance in Complexity
- **Cook-Levin Theorem**: SAT is the first known **NP-Complete** problem.
- **Reductions**: To prove a new problem X is NP-Complete, we often show that 3-SAT ≤_p X (3-SAT polynomial-time reduces to X).
- Practically, efficient SAT solvers are used extensively in hardware verification, AI, and constraint solving.`
  },
  'video-lectures': {
    title: 'Video Lectures',
    content: `## Automata Theory Concepts Video Lectures

A highly recommended full video lecture series spanning Automata Theory concepts. Topics covered include Regular expressions, FSMs, Push-down Automata, Turing machines, and Computability theory.

### Recommended Channel
**Mrs. Anuja Zade** (Professor at Vishwakarma Institute of Technology)

![Prof. Anuja Zade](/prof_anuja.png)

[👉 **Watch the YouTube Lectures Here**](https://www.youtube.com/channel/UCN3H1rkluxinMGwR0ByXedw)

*(Tip: These lectures pair perfectly with Automata Theory Studio for practicing exactly the concepts taught!)*`
  },
};

export const LearningHub: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('regexp');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Regular Languages']));

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const topic = CONTENT[selectedTopic] || { title: 'Topic', content: 'Content coming soon...' };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Topic Tree Sidebar */}
      <div style={{
        width: '220px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        overflowY: 'auto', flexShrink: 0,
      }}>
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
          <div className="panel-section-title" style={{ marginBottom: 0 }}>Topics</div>
        </div>
        {TOPICS.map(group => (
          <div key={group.group}>
            <button
              onClick={() => toggleGroup(group.group)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              <span>{group.group}</span>
              <span style={{ fontSize: '10px' }}>{expandedGroups.has(group.group) ? '▼' : '▶'}</span>
            </button>
            {expandedGroups.has(group.group) && group.items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedTopic(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 12px 7px 20px', background: selectedTopic === item.id ? 'rgba(0,245,212,0.08)' : 'none',
                  border: 'none', borderLeft: selectedTopic === item.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  color: selectedTopic === item.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800,
          marginBottom: '20px', color: 'var(--text-primary)',
          background: 'linear-gradient(135deg, var(--text-primary), var(--accent-cyan))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {topic.title}
        </h1>
        <div style={{
          color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '14px',
        }}>
          <MarkdownContent content={topic.content} />
        </div>
      </div>
    </div>
  );
};

// Simple markdown renderer (no external dep needed for basic content)
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginTop: '16px', marginBottom: '8px', color: 'var(--accent-cyan)' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(<ul key={`ul-${i}`} style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>{items.map((item, j) => <li key={j} style={{ color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-cyan)">$1</strong>').replace(/`(.*?)`/g, '<code style="font-family:var(--font-mono);color:var(--text-code);background:var(--bg-elevated);padding:2px 5px;border-radius:3px">$1</code>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--accent-cyan);text-decoration:underline">$1</a>') }} />)}</ul>);
      continue;
    } else if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(<pre key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-code)', overflowX: 'auto', margin: '12px 0' }}>{codeLines.join('\n')}</pre>);
    } else if (line.startsWith('![')) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        elements.push(<img key={i} src={match[2]} alt={match[1]} style={{ maxWidth: '200px', borderRadius: '50%', border: '2px solid var(--border)', margin: '16px 0', display: 'block', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }} />);
      }
    } else if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].includes('---')) rows.push(lines[i].split('|').filter(c => c.trim()).map(c => c.trim()));
        i++;
      }
      elements.push(
        <table key={`table-${i}`} style={{ borderCollapse: 'collapse', width: '100%', margin: '12px 0', fontSize: '13px' }}>
          <thead>
            <tr>{rows[0]?.map((h, j) => <th key={j} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--accent-cyan)', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} dangerouslySetInnerHTML={{ __html: cell.replace(/`(.*?)`/g, '<code style="color:var(--text-code)">$1</code>') }} />)}</tr>)}
          </tbody>
        </table>
      );
      continue;
    } else if (line.trim()) {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
        .replace(/`(.*?)`/g, '<code style="font-family:var(--font-mono);color:var(--text-code);background:var(--bg-elevated);padding:2px 5px;border-radius:3px">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--accent-cyan);text-decoration:underline">$1</a>');
      elements.push(<p key={i} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: html }} />);
    }

    i++;
  }

  return <>{elements}</>;
}
