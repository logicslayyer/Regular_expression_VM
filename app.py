from flask import Flask, render_template, request, jsonify
from regex_parser import insert_explicit_concat, infix_to_postfix
from automata import postfix_to_nfa, nfa_to_dfa, simulate_dfa, format_nfa_cyto, format_dfa_cyto

app = Flask(__name__)

# In-memory storage for prototype
current_dfa = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/build', methods=['POST'])
def build_automata():
    global current_dfa
    data = request.json
    regex = data.get('regex', '').strip()
    if not regex:
        return jsonify({'error': 'Empty regex provided.'}), 400

    try:
        with_concat = insert_explicit_concat(regex)
        postfix = infix_to_postfix(with_concat)

        nfa = postfix_to_nfa(postfix)
        nfa_cyto = format_nfa_cyto(nfa)

        dfa = nfa_to_dfa(nfa)
        dfa_cyto = format_dfa_cyto(dfa)

        current_dfa = dfa

        return jsonify({
            'success': True,
            'with_concat': with_concat,
            'postfix': postfix,
            'nfa_elements': nfa_cyto,
            'dfa_elements': dfa_cyto
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/simulate', methods=['POST'])
def simulate():
    global current_dfa
    data = request.json
    test_str = data.get('test_string', '')
    
    if not current_dfa:
        return jsonify({'error': 'No DFA built yet.'}), 400

    try:
        is_accepted, trace = simulate_dfa(current_dfa, test_str)
        return jsonify({
            'success': True,
            'is_accepted': is_accepted,
            'trace': trace
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
