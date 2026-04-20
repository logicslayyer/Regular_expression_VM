import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from regex_parser import insert_explicit_concat, infix_to_postfix
from automata import postfix_to_nfa, nfa_to_dfa, simulate_dfa, format_nfa_transitions, format_dfa_transitions
from utils import save_project_data, load_project_data

class RegexMachineApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Virtual Regular Expression Machine")
        self.root.geometry("800x600")

        self.nfa = None
        self.dfa = None

        self._build_ui()

    def _build_ui(self):
        # Top Frame for Inputs and Controls
        top_frame = ttk.Frame(self.root, padding=10)
        top_frame.pack(fill=tk.X)

        ttk.Label(top_frame, text="Regular Expression:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.regex_entry = ttk.Entry(top_frame, width=40)
        self.regex_entry.grid(row=0, column=1, padx=5, pady=5)

        ttk.Label(top_frame, text="Test String:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.test_entry = ttk.Entry(top_frame, width=40)
        self.test_entry.grid(row=1, column=1, padx=5, pady=5)

        # Buttons
        btn_frame = ttk.Frame(top_frame)
        btn_frame.grid(row=0, column=2, rowspan=2, padx=20)
        
        ttk.Button(btn_frame, text="Build Automaton", command=self.build_automaton).grid(row=0, column=0, pady=2, sticky=tk.EW)
        ttk.Button(btn_frame, text="Simulate String", command=self.simulate_string).grid(row=1, column=0, pady=2, sticky=tk.EW)

        menu_frame = ttk.Frame(top_frame)
        menu_frame.grid(row=0, column=3, rowspan=2, padx=10)
        ttk.Button(menu_frame, text="Save Data", command=self.save_data).grid(row=0, column=0, pady=2, sticky=tk.EW)
        ttk.Button(menu_frame, text="Load Data", command=self.load_data).grid(row=1, column=0, pady=2, sticky=tk.EW)

        # Output Tabs
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Tab 1: Transitions
        self.trans_tab = ttk.Frame(notebook)
        notebook.add(self.trans_tab, text="Automata Transitions")
        self.trans_text = tk.Text(self.trans_tab, wrap=tk.WORD, state=tk.DISABLED, font=("Consolas", 10))
        self.trans_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Tab 2: Simulation
        self.sim_tab = ttk.Frame(notebook)
        notebook.add(self.sim_tab, text="Simulation Trace")
        self.sim_text = tk.Text(self.sim_tab, wrap=tk.WORD, state=tk.DISABLED, font=("Consolas", 10))
        self.sim_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    def write_output(self, text_widget, content, clear=False):
        text_widget.config(state=tk.NORMAL)
        if clear:
            text_widget.delete("1.0", tk.END)
        text_widget.insert(tk.END, content + "\n")
        text_widget.config(state=tk.DISABLED)

    def build_automaton(self):
        regex = self.regex_entry.get().strip()
        if not regex:
            messagebox.showwarning("Input Error", "Please enter a regular expression.")
            return

        try:
            self.write_output(self.trans_text, "--- Parsing Regex ---", clear=True)
            with_concat = insert_explicit_concat(regex)
            self.write_output(self.trans_text, f"With explicit concatenation: {with_concat}")
            
            postfix = infix_to_postfix(with_concat)
            self.write_output(self.trans_text, f"Postfix expression: {postfix}\n")

            self.write_output(self.trans_text, "--- Building NFA ---")
            self.nfa = postfix_to_nfa(postfix)
            nfa_trans = format_nfa_transitions(self.nfa)
            for line in nfa_trans:
                self.write_output(self.trans_text, line)

            self.write_output(self.trans_text, "\n--- Converting NFA to DFA ---")
            self.dfa = nfa_to_dfa(self.nfa)
            dfa_trans = format_dfa_transitions(self.dfa)
            for line in dfa_trans:
                self.write_output(self.trans_text, line)

            self.write_output(self.sim_text, "Automaton built successfully. Ready for simulation.", clear=True)
            messagebox.showinfo("Success", "Automaton built successfully!")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to build automaton: {e}")
            self.nfa = None
            self.dfa = None

    def simulate_string(self):
        if not self.dfa:
            messagebox.showwarning("Simulation Error", "Please build the automaton first.")
            return

        test_str = self.test_entry.get()
        self.write_output(self.sim_text, f"\n--- Simulating string: '{test_str}' ---", clear=True)

        is_accepted, trace = simulate_dfa(self.dfa, test_str)
        
        for step in trace:
            if len(step) == 3:
                curr_state, char, next_state = step
                self.write_output(self.sim_text, f"State d{curr_state} --[{char}]--> {f'State d{next_state}' if next_state is not None else 'REJECTED'}")
        
        result_str = "ACCEPTED" if is_accepted else "REJECTED"
        self.write_output(self.sim_text, f"\nFINAL RESULT: {result_str}")

        if is_accepted:
            messagebox.showinfo("Result", f"The string '{test_str}' is ACCEPTED.")
        else:
            messagebox.showinfo("Result", f"The string '{test_str}' is REJECTED.")

    def save_data(self):
        regex = self.regex_entry.get().strip()
        test_str = self.test_entry.get().strip()
        
        filepath = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON Files", "*.json")])
        if filepath:
            success, msg = save_project_data(filepath, regex, [test_str])
            if success:
                messagebox.showinfo("Saved", msg)
            else:
                messagebox.showerror("Save Error", msg)

    def load_data(self):
        filepath = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
        if filepath:
            success, msg, regex, test_cases = load_project_data(filepath)
            if success:
                self.regex_entry.delete(0, tk.END)
                self.regex_entry.insert(0, regex)

                self.test_entry.delete(0, tk.END)
                if test_cases:
                    self.test_entry.insert(0, test_cases[0])

                messagebox.showinfo("Loaded", msg)
            else:
                messagebox.showerror("Load Error", msg)

if __name__ == "__main__":
    root = tk.Tk()
    app = RegexMachineApp(root)
    root.mainloop()
