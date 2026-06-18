# Sticks Lite Browser IDE

A standalone web IDE for Sticks Lite. It includes a browser editor, Sticks Lite syntax highlighting, built-in command completions, block auto-indent, Tab indentation, and a live output console.

## Who this is for

- Teachers and mentors who want a simple browser IDE for supervised Sticks Lite lessons.
- Students writing and running one `main.slite` source file at a time.
- Beginner computer-science workshops that need a focused `.slite` editor.

## Install

```sh
npm install
```

## Develop

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Features

- CodeMirror editor.
- Highlighting for Sticks Lite keywords, built-ins, strings, numbers, comments, and operators.
- Completion list for core commands and built-ins.
- Auto-indent after block-opening lines ending in `:`.
- Tab indentation.
- Resizable editor/output split.
- Runs code through the published `sticks-lite` npm package.

## License

MIT. The software is provided as-is, without warranty or liability.
