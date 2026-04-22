# Virtual Regular Expression Machine

## Description
This project takes a regular expression, converts it to a Non-deterministic Finite Automaton (NFA) using Thompson's Construction, and then to a Deterministic Finite Automaton (DFA) using Subset/Powerset Construction. It provides a graphical user interface (GUI) via Python's built-in Tkinter to visually display the states and transitions. Furthermore, it allows you to simulate input strings against the generated automaton to test for acceptance or rejection.

## Features
- **Regex Parsing:** Supports standard operators such as union (`|`), concatenation (implicit or explicit `.`), Kleene star (`*`), and parentheses `()`.
- **NFA & DFA Construction:** Beautifully lays out text-based visual logs of state transitions.
- **Simulation Trace:** Provides a step-by-step trace of state movements as the DFA consumes test strings.
- **Save/Load Functionality:** Allows you to save your regular expression and test strings to a JSON file for quick loading later.

## Prerequisites
- Python 3.x installed.
- Custom dependencies: **None!** Only standard Python libraries are used.

## How to Run
1. Open a terminal or command prompt in the project's root folder (`AT regular expression machine`).
2. Run the application with:
   ```bash
   python main.py
   ```
3. In the GUI:
   - Enter a valid regular expression like `(a|b)*abb`.
   - Click **Build Automaton**. The "Automata Transitions" tab will show you how the regex was parsed and the transition rules for both the NFA and DFA.
   - Enter a test string like `ababb` in the Test String field.
   - Click **Simulate String**. Review the output in the "Simulation Trace" tab to see if the string is Accepted or Rejected.

## Project Structure
- `main.py`: The entry point that defines the Tkinter GUI layout and connects the user interface to the core logic.
- `automata.py`: Contains the `State`, `NFA`, and `DFA` classes. Implements the Thompson's construction and Powerset construction algorithms.
- `regex_parser.py`: Implements parsing tasks, inserting explicit concatenation operations, and converting from infix notation to postfix using the Shunting-yard algorithm.
- `utils.py`: Contains helper functions to save and load configuration data to JSON.
