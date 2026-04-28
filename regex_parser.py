_BINARY_OPERATORS = {'|', '.'}
_UNARY_OPERATORS = {'*'}
_UNSUPPORTED_SYNTAX_CHARS = {'[', ']', '{', '}'}

def _is_operand_char(ch):
    return ch not in {'(', ')', '|', '.', '*', '+', '?'}

def _find_matching_paren(regex, open_index):
    depth = 0
    for i in range(open_index, len(regex)):
        if regex[i] == '(':
            depth += 1
        elif regex[i] == ')':
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("Unbalanced parentheses in regular expression.")

def _desugar_unary_ops(regex):
    """
    Expands postfix unary operators before the main parser sees the regex.
    - a+  -> aa*
    - a?  -> (a|ε)
    Parenthesized groups are handled recursively.
    """
    result = []
    i = 0

    while i < len(regex):
        ch = regex[i]

        if ch in {'+', '?'}:
            raise ValueError(f"Unexpected unary operator '{ch}' in regular expression.")

        if ch == '(':
            end = _find_matching_paren(regex, i)
            atom = f"({_desugar_unary_ops(regex[i + 1:end])})"
            i = end + 1
        else:
            atom = ch
            i += 1

        # Keep the existing core operators intact.
        if atom in {'|', '.', '*'}:
            result.append(atom)
            continue

        while i < len(regex) and regex[i] in {'+', '?'}:
            if regex[i] == '+':
                atom = f"{atom}{atom}*"
            else:
                atom = f"({atom}|ε)"
            i += 1

        result.append(atom)

    return "".join(result)

def _reject_unsupported_syntax(regex):
    for ch in regex:
        if ch in _UNSUPPORTED_SYNTAX_CHARS:
            raise ValueError(
                "Unsupported regular expression syntax detected. "
                "Character classes [] and counted repetitions {} are not supported."
            )

def _validate_normalized_regex(regex):
    """
    Validates a regex after unary desugaring and explicit concatenation insertion.
    """
    if not regex:
        return

    paren_stack = []
    prev_kind = None

    for i, ch in enumerate(regex):
        if ch == '(':
            if prev_kind in {'operand', 'rparen', 'star'}:
                raise ValueError("Missing concatenation operator before '('.")
            paren_stack.append(i)
            prev_kind = 'lparen'
        elif ch == ')':
            if not paren_stack:
                raise ValueError("Unbalanced parentheses in regular expression.")
            if prev_kind in {None, 'binary', 'lparen'}:
                raise ValueError("Empty parentheses or missing expression before ')'.")
            paren_stack.pop()
            prev_kind = 'rparen'
        elif ch == '*':
            if prev_kind not in {'operand', 'rparen'}:
                raise ValueError("Kleene star must follow an expression.")
            prev_kind = 'star'
        elif ch in _BINARY_OPERATORS:
            if prev_kind not in {'operand', 'rparen', 'star'}:
                raise ValueError(f"Operator '{ch}' cannot appear here.")
            prev_kind = 'binary'
        elif _is_operand_char(ch):
            if prev_kind in {'operand', 'rparen', 'star'}:
                raise ValueError("Missing concatenation operator between expressions.")
            prev_kind = 'operand'
        else:
            # Any other character is treated as a literal operand.
            if prev_kind in {'operand', 'rparen', 'star'}:
                raise ValueError("Missing concatenation operator between expressions.")
            prev_kind = 'operand'

    if paren_stack:
        raise ValueError("Unbalanced parentheses in regular expression.")
    if prev_kind == 'binary':
        raise ValueError("Regular expression cannot end with a binary operator.")
    if prev_kind == 'lparen':
        raise ValueError("Unbalanced parentheses in regular expression.")

def insert_explicit_concat(regex):
    """
    Inserts a specific concatenation operator '.' into the regex where applicable.
    Example: 'ab(c|d)*' -> 'a.b.(c|d)*'
    """
    if not regex:
        return ""

    _reject_unsupported_syntax(regex)
    regex = _desugar_unary_ops(regex)
    res = ""
    
    for i in range(len(regex)):
        current = regex[i]
        if i > 0:
            prev = regex[i-1]
            
            # Explicitly preserve concatenation after Kleene star before a group.
            if prev == '*' and current == '(':
                res += '.'
            elif (_is_operand_char(prev) or prev == ')' or prev == '*') and \
                 (_is_operand_char(current) or current == '('):
                res += '.'
                
        res += current
        
    return res

def infix_to_postfix(regex):
    """
    Converts infix regular expression to postfix notation using Shunting-yard algorithm.
    Precedence: '*' > '.' > '|'
    """
    _reject_unsupported_syntax(regex)
    _validate_normalized_regex(regex)

    precedence = {'*': 3, '.': 2, '|': 1, '(': 0}
    output = []
    stack = []
    
    for char in regex:
        if char.isalnum() or char not in precedence and char != ')':
            # It's an operand (literal character) or an unescaped specific char
            output.append(char)
        elif char == '(':
            stack.append(char)
        elif char == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            if stack:
                stack.pop() # Remove '('
        else:
            # It's an operator
            while stack and precedence.get(stack[-1], 0) >= precedence.get(char, 0):
                output.append(stack.pop())
            stack.append(char)
            
    while stack:
        output.append(stack.pop())
        
    return "".join(output)

if __name__ == "__main__":
    # Test cases
    test_regex = "a(a|b)*b"
    with_concat = insert_explicit_concat(test_regex)
    print(f"Original: {test_regex}")
    print(f"With concat: {with_concat}")
    postfix = infix_to_postfix(with_concat)
    print(f"Postfix: {postfix}")
