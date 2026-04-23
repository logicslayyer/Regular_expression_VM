# Automata Theory Studio

A fully interactive, animated educational platform for Theory of Computation built with **React 18 + Vite + TypeScript**.

## 🚀 Getting Started

```bash
# Navigate to the studio folder
cd studio

# Install dependencies
npm install

# Start dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

## 📦 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | Core framework |
| @xyflow/react | Interactive graph canvas |
| D3.js | Custom animations |
| Zustand | Global state management |
| Tailwind CSS | Styling |
| KaTeX | Math rendering |
| JetBrains Mono + Syne | Typography |

## 🗂️ Features

### 5 Main Tabs
1. **Automata Studio** — RE→NFA, NFA→DFA, DFA Minimization, Arden's Theorem, String Simulation
2. **Grammar Lab** — CFG builder, CYK parsing table, CNF/GNF conversion
3. **PDA & Turing** — Pushdown automaton with stack view, Turing machine with tape
4. **Complexity** — KMP pattern matching, NP reduction chain, Pumping Lemma
5. **Learning Hub** — Topic tree + rich content for all TOC topics

### Algorithms (all client-side)
- Thompson's Construction (RE → ε-NFA)
- Subset Construction (NFA → DFA)
- DFA Minimization (Myhill-Nerode table filling)
- Arden's Theorem (DFA → RE)
- CYK Algorithm (CNF grammar parsing)
- PDA Simulation
- Turing Machine Simulation
- KMP Pattern Matching

## 📁 File Structure

```
studio/
├── src/
│   ├── engine/          # 8 algorithm implementations
│   ├── store/           # Zustand global store
│   ├── components/
│   │   ├── layout/      # TopNav, LeftSidebar, RightPanel, BottomBar
│   │   ├── canvas/      # AutomataCanvas, CustomStateNode, CustomEdge
│   │   ├── input/       # RegexCalculator, CFGBuilder
│   │   ├── tabs/        # 5 main tab views
│   │   └── special/     # StackVisualizer, TuringTape, CYKTable
│   └── styles/          # globals.css, animations.css
```

## ⚠️ Requirements

- Node.js 18+ (https://nodejs.org)
- npm 9+
