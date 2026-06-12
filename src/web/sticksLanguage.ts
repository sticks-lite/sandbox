import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { StreamLanguage, indentOnInput } from "@codemirror/language";
import { EditorView, keymap } from "@codemirror/view";

const keywords = [
  "DEFINE",
  "if",
  "orif",
  "otherwise",
  "repeat",
  "times",
  "loopif",
  "foreach",
  "in",
  "break",
  "continue",
  "new",
  "return",
  "True",
  "False",
  "null",
  "and",
  "or",
  "not",
  "div",
  "attempt",
  "when",
  "error"
];

const builtins = [
  "say",
  "ask",
  "random",
  "length",
  "toNumber",
  "toText",
  "isNumber",
  "isText",
  "isList",
  "isTuple",
  "isDictionary",
  "isBoolean",
  "isNull",
  "push",
  "insert",
  "remove",
  "round",
  "floor",
  "ceiling",
  "absolute"
];

const errorNames = [
  "SyntaxError",
  "IndentationError",
  "NameError",
  "TypeError",
  "ValueError",
  "MathError",
  "ConstantError",
  "IndexError",
  "KeyError",
  "FunctionError",
  "ArgumentError",
  "RuntimeError"
];

const keywordPattern = new RegExp(`\\b(${keywords.join("|")})\\b`);
const builtinPattern = new RegExp(`\\b(${builtins.join("|")})\\b`);
const errorPattern = new RegExp(`\\b(${errorNames.join("|")})\\b`);

export const sticksLiteLanguage = StreamLanguage.define({
  name: "sticks-lite",
  startState: () => ({ inBlockComment: false }),
  token(stream, state: { inBlockComment: boolean }) {
    if (state.inBlockComment) {
      if (stream.skipTo("*/")) {
        stream.next();
        stream.next();
        state.inBlockComment = false;
      } else {
        stream.skipToEnd();
      }
      return "comment";
    }

    if (stream.eatSpace()) return null;
    if (stream.match("#")) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.match("/*")) {
      state.inBlockComment = true;
      return "comment";
    }
    if (stream.match(/"(?:[^"\\]|\\.)*"/) || stream.match(/'(?:[^'\\]|\\.)*'/)) return "string";
    if (stream.match(/\d+(?:\.\d+)?/)) return "number";
    if (stream.match(keywordPattern)) return "keyword";
    if (stream.match(builtinPattern)) return "builtin";
    if (stream.match(errorPattern)) return "typeName";
    if (stream.match(/[+\-*/%=!<>]+/)) return "operator";
    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: "#", block: { open: "/*", close: "*/" } }
  }
});

const completions = [...keywords, ...builtins, ...errorNames].map((label) => ({
  label,
  type: builtins.includes(label) ? "function" : errorNames.includes(label) ? "type" : "keyword"
}));

function sticksCompletions(context: CompletionContext) {
  const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return { from: word.from, options: completions };
}

const smartEnter = keymap.of([
  {
    key: "Enter",
    run(view) {
      const { state } = view;
      const line = state.doc.lineAt(state.selection.main.head);
      const indent = line.text.match(/^\s*/)?.[0] ?? "";
      const extra = line.text.trimEnd().endsWith(":") ? "    " : "";
      view.dispatch(state.replaceSelection(`\n${indent}${extra}`));
      return true;
    }
  },
  indentWithTab
]);

export const sticksLiteExtensions = [
  sticksLiteLanguage,
  smartEnter,
  indentOnInput(),
  autocompletion({ override: [sticksCompletions] }),
  EditorView.theme({
    "&": {
      height: "100%"
    },
    ".cm-content": {
      fontFamily: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace",
      fontSize: "14px"
    },
    ".cm-scroller": {
      fontFamily: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace"
    },
    ".cm-keyword": { color: "#83d475", fontWeight: "700" },
    ".cm-builtin": { color: "#8cc8ff", fontWeight: "700" },
    ".cm-typeName": { color: "#ffd166" },
    ".cm-string": { color: "#f2b880" },
    ".cm-number": { color: "#b8e986" },
    ".cm-comment": { color: "#7a8b7a", fontStyle: "italic" },
    ".cm-operator": { color: "#f6f7f8" }
  })
];
