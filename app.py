from pathlib import Path

from flask import Flask, render_template, request, jsonify, send_from_directory, abort, Response
from regex_parser import insert_explicit_concat, infix_to_postfix
from automata import postfix_to_nfa, nfa_to_dfa, simulate_dfa, format_nfa_cyto, format_dfa_cyto

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
STUDIO_DIST = BASE_DIR / "studio" / "dist"
STUDIO_ASSETS = STUDIO_DIST / "assets"

# In-memory storage for prototype
current_dfa = None

@app.route('/')
def index():
    return latest_index()

@app.route('/legacy')
def legacy_index():
    return render_template('legacy.html')

@app.route('/latest')
@app.route('/latest/<path:subpath>')
def latest_index(subpath: str = ''):
    index_file = STUDIO_DIST / "index.html"
    if not index_file.exists():
        abort(404, description="Latest UI build not found. Run `npm run build` in `studio/` first.")

    if subpath:
      candidate = STUDIO_DIST / subpath
      if candidate.exists() and candidate.is_file():
          return send_from_directory(STUDIO_DIST, subpath)

    return send_from_directory(STUDIO_DIST, "index.html")

@app.route('/assets/<path:filename>')
def latest_assets(filename):
    asset_file = STUDIO_ASSETS / filename
    if not asset_file.exists():
        abort(404)
    return send_from_directory(STUDIO_ASSETS, filename)

@app.route('/prof_anuja.png')
def studio_portrait():
    portrait = STUDIO_DIST / "prof_anuja.png"
    if not portrait.exists():
        abort(404)
    return send_from_directory(STUDIO_DIST, "prof_anuja.png")

@app.route('/vite.svg')
def vite_icon():
    return Response(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <path d="M12 2L3 19.5L12 22L21 19.5L12 2Z" fill="#0ea5e9"/>
  <path d="M12 6.2L16.9 18.1L12 19.5L7.1 18.1L12 6.2Z" fill="#22c55e"/>
</svg>""",
        mimetype="image/svg+xml",
    )

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
