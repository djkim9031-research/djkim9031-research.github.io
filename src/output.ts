// Output model shared by the terminal renderer and every command.
// A command produces an OutputBlock: a list of lines, each a list of spans.
// A span is a chunk of text with a tone (which maps to a CSS class) and an
// optional href to render it as a link.

export type Tone = "default" | "green" | "dim" | "error" | "agent" | "head";

export interface Span {
  text: string;
  tone?: Tone;
  href?: string;
}

export type OutputLine = Span[];
export type OutputBlock = OutputLine[];

export const span = (text: string, tone: Tone = "default", href?: string): Span => ({
  text,
  tone,
  href,
});

// Line builders for terse command code.
export const line = (...spans: Span[]): OutputLine => spans;
export const text = (s: string): OutputLine => [span(s)];
export const blank = (): OutputLine => [span("")];

// Common span shorthands.
export const g = (s: string) => span(s, "green");
export const dim = (s: string) => span(s, "dim");
export const head = (s: string) => span(s, "head");
export const link = (s: string, href: string) => span(s, "green", href);
