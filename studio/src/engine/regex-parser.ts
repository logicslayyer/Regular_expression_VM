// ============================================================
// REGEX PARSER — Recursive Descent Parser
// Produces a parse tree from a regular expression string
// Supported: literals, ε, |, concat (implicit), *, +, ?, ()
// ============================================================

export type NodeType = 'LITERAL' | 'EPSILON' | 'UNION' | 'CONCAT' | 'STAR' | 'PLUS' | 'QUESTION';

export interface ParseNode {
  type: NodeType;
  value?: string;
  left?: ParseNode;
  right?: ParseNode;
  child?: ParseNode;
}

export class RegexParser {
  private input: string = '';
  private pos: number = 0;

  parse(regex: string): ParseNode {
    this.input = regex.trim();
    this.pos = 0;
    if (!this.input || this.input === 'ε') return { type: 'EPSILON' };
    const tree = this.parseUnion();
    if (this.pos < this.input.length) {
      throw new Error(`Unexpected character '${this.input[this.pos]}' at position ${this.pos}`);
    }
    return tree;
  }

  // E → T ('|' T)*
  private parseUnion(): ParseNode {
    let left = this.parseConcat();
    while (this.pos < this.input.length && this.input[this.pos] === '|') {
      this.pos++;
      const right = this.parseConcat();
      left = { type: 'UNION', left, right };
    }
    return left;
  }

  // T → F+
  private parseConcat(): ParseNode {
    let left = this.parseUnary();
    while (this.pos < this.input.length &&
      this.input[this.pos] !== ')' &&
      this.input[this.pos] !== '|') {
      const right = this.parseUnary();
      left = { type: 'CONCAT', left, right };
    }
    return left;
  }

  // F → atom ('*' | '+' | '?')*
  private parseUnary(): ParseNode {
    let node = this.parseAtom();
    while (this.pos < this.input.length &&
      ['*', '+', '?'].includes(this.input[this.pos])) {
      const op = this.input[this.pos++];
      if (op === '*') node = { type: 'STAR', child: node };
      else if (op === '+') node = { type: 'PLUS', child: node };
      else node = { type: 'QUESTION', child: node };
    }
    return node;
  }

  // atom → '(' E ')' | literal | ε
  private parseAtom(): ParseNode {
    if (this.pos >= this.input.length) return { type: 'EPSILON' };
    const ch = this.input[this.pos];

    if (ch === '(') {
      this.pos++;
      const inner = this.parseUnion();
      if (this.pos >= this.input.length || this.input[this.pos] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.pos++;
      return inner;
    }

    if (ch === 'ε' || ch === 'e') {
      this.pos++;
      return { type: 'EPSILON' };
    }

    // Escape sequences
    if (ch === '\\' && this.pos + 1 < this.input.length) {
      this.pos += 2;
      return { type: 'LITERAL', value: this.input[this.pos - 1] };
    }

    this.pos++;
    return { type: 'LITERAL', value: ch };
  }

  validate(regex: string): { valid: boolean; error?: string } {
    try {
      this.parse(regex);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }
}

export const regexParser = new RegexParser();
