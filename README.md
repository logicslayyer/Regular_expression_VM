# Automata Theory Studio

🚀 **Live Demo:** [https://regular-expression-vm-s6vs.vercel.app/](https://regular-expression-vm-s6vs.vercel.app/)
## Main UI
The main interface is the React/Vite studio app in `studio/`.

## How to Run
1. Start the backend:
   ```bash
   python app.py
   ```
2. Open the latest UI at:
   ```text
   http://127.0.0.1:5000/
   ```
   or directly:
   ```text
   http://127.0.0.1:5000/latest
   ```

## Legacy UI
The older Flask UI is still available at:
```text
http://127.0.0.1:5000/legacy
```

## Studio Frontend
To run the frontend directly:
1. Open `studio/`
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open:
   ```text
   http://127.0.0.1:5173
   ```

## Notes
- `app.py` serves the latest studio build as the default UI.
- The legacy HTML/CSS/JS UI is preserved for reference and fallback.
