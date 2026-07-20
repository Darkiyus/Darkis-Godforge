const tokenPattern = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g;
const allowedDice = /^\d+d\d+(?:[+\-]\d+)?$/;
const functions = new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);

export interface FormulaFacts { actor: { level: number; hpPercent?: number }; target: { hpPercent?: number }; }
type Token = string;

function tokenize(formula: string): Token[] { const compact = formula.replace(/\s/g, ""); const tokens = compact.match(tokenPattern); if (!tokens || tokens.join("") !== compact) throw new Error("Formula contains an unsupported term."); return tokens; }
export function validateFormula(formula: string): boolean { const compact = formula.replace(/\s/g, ""); if (allowedDice.test(compact)) return true; try { new Parser(tokenize(compact), { actor: { level: 0 }, target: {} }).parse(); return true; } catch { return false; } }
export function evaluateFormula(formula: string, facts: FormulaFacts): number { const compact = formula.replace(/\s/g, ""); if (!validateFormula(compact)) throw new Error("Formula contains an unsupported term."); if (allowedDice.test(compact)) throw new Error("Dice formulas require Foundry Roll at runtime."); return new Parser(tokenize(compact), facts).parse(); }

class Parser {
  private position = 0;
  constructor(private readonly tokens: Token[], private readonly facts: FormulaFacts) {}
  parse(): number { const value = this.expression(); if (this.position !== this.tokens.length) throw new Error("Unexpected formula token."); if (!Number.isFinite(value)) throw new Error("Formula could not be evaluated."); return value; }
  private expression(): number { let value = this.term(); while (this.peek("+") || this.peek("-")) { const operator = this.take(); const right = this.term(); value = operator === "+" ? value + right : value - right; } return value; }
  private term(): number { let value = this.unary(); while (this.peek("*") || this.peek("/")) { const operator = this.take(); const right = this.unary(); value = operator === "*" ? value * right : value / right; } return value; }
  private unary(): number { if (this.peek("+")) { this.take(); return this.unary(); } if (this.peek("-")) { this.take(); return -this.unary(); } return this.primary(); }
  private primary(): number { const token = this.take(); if (token === "(") { const value = this.expression(); this.expect(")"); return value; } if (/^\d/.test(token)) return Number(token); if (token === "@actor.level") return this.facts.actor.level; if (token === "@actor.hpPercent") return this.facts.actor.hpPercent ?? 0; if (token === "@target.hpPercent") return this.facts.target.hpPercent ?? 0; if (functions.has(token)) return this.call(token); throw new Error("Unknown formula identifier."); }
  private call(name: string): number { this.expect("("); const args: number[] = [this.expression()]; while (this.peek(",")) { this.take(); args.push(this.expression()); } this.expect(")"); if (name === "min" && args.length >= 1) return Math.min(...args); if (name === "max" && args.length >= 1) return Math.max(...args); if (name === "round" && args.length === 1) return Math.round(args[0]!); if (name === "floor" && args.length === 1) return Math.floor(args[0]!); if (name === "ceil" && args.length === 1) return Math.ceil(args[0]!); if (name === "abs" && args.length === 1) return Math.abs(args[0]!); if (name === "clamp" && args.length === 3) return Math.min(Math.max(args[0]!, args[1]!), args[2]!); if (name === "if" && args.length === 3) return args[0] !== 0 ? args[1]! : args[2]!; throw new Error("Invalid formula function arguments."); }
  private peek(token: string): boolean { return this.tokens[this.position] === token; }
  private take(): string { const token = this.tokens[this.position]; if (!token) throw new Error("Unexpected end of formula."); this.position += 1; return token; }
  private expect(token: string): void { if (!this.peek(token)) throw new Error(`Expected ${token}.`); this.position += 1; }
}
