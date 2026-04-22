def insert_explicit_concat(regex):
    """
    Inserts a specific concatenation operator '.' into the regex where applicable.
    Example: 'ab(c|d)*' -> 'a.b.(c|d)*'
    """
    if not regex:
        return ""
    
    res = ""
    # We implicitly add '.' when:
    # 1. current char is alphanumeric or '(' or '*'
    # 2. AND previous char is alphanumeric or ')' or '*'
    special_chars = {'(', ')', '*', '|'}
    
    for i in range(len(regex)):
        current = regex[i]
        if i > 0:
            prev = regex[i-1]
            
            # Conditions to add a concatenation '.'
            if (prev.isalnum() or prev == ')' or prev == '*') and \
               (current.isalnum() or current == '('):
                res += '.'
                
        res += current
        
    return res

def infix_to_postfix(regex):
    """
    Converts infix regular expression to postfix notation using Shunting-yard algorithm.
    Precedence: '*' > '.' > '|'
    """
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
