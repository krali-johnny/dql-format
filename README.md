# dql-format

A CLI tool to parse files and search for DQL commands to pass them to the DQL formatter.

## Usage

Build the project first so the CLI entrypoint is available in `dist`:

```bash
npm run build
```

Then run the CLI with Node:

```bash
node dist/index.js <path...> [--ext=.ts,.tsx]
```

Where `<path...>` can be one or more:

- Individual files
- Directories (they will be scanned recursively)

By default, `dql-format` looks for DQL strings inside files with the following extensions:

- `.txt`
- `.dql`
- `.js`
- `.jsx`
- `.ts`
- `.tsx`

You can override the extensions to scan using the optional `--ext` flag. Pass a comma-separated
list of extensions (with or without the leading dot). Examples:

- `--ext=.ts` – only `.ts` files
- `--ext=.ts,.tsx` – `.ts` and `.tsx` files
- `--ext=ts,tsx` – same as above; dots are added automatically

For every matching file, the tool:

1. Reads the file contents.
2. Extracts strings that contain DQL queries.
3. Formats each DQL command and prints it to `stdout`, one per line.

### Examples

Parse a single file:

```bash
node dist/index.js examples/sample.ts
```

Parse multiple files:

```bash
node dist/index.js src/file1.ts src/file2.ts tests/sample.txt
```

Parse an entire directory (recursively):

```bash
node dist/index.js src
```

Mix files and directories:

```bash
node dist/index.js src tests some-other-file.dql
```

Restrict to specific extensions:

```bash
node dist/index.js src --ext=.ts,.tsx
```

### Exit codes

The CLI uses the following exit codes:

- `0` – Success
  - At least one path was provided and processed.
  - If no matching files are found under the given paths, it prints `No matching files found` and still exits with `0`.
- `1` – Incorrect usage
  - No positional paths were provided.
- `2` – File or path not found
  - At least one of the provided paths does not exist.
- `3` – Error reading a file
  - An unexpected I/O error occurred while reading a file.

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```
