#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

// Extract all string literals (single, double, and template) from given content
export function extractStrings(content: string): string[] {
    const results: string[] = [];
    let i = 0;
    const len = content.length;

    while (i < len) {
        const ch = content[i];

        // Handle normal string literals
        if (ch === '"' || ch === "'") {
            const quote = ch;
            let value = quote;
            i++;
            let escaped = false;

            while (i < len) {
                const c = content[i];
                value += c;

                if (escaped) {
                    escaped = false;
                } else if (c === '\\') {
                    escaped = true;
                } else if (c === quote) {
                    // end of string
                    results.push(value);
                    i++;
                    break;
                }

                i++;
            }
            continue;
        }

        // Handle template literals (basic support, including simple escapes and ${} blocks)
        if (ch === '`') {
            let value = '`';
            i++;
            let escaped = false;

            while (i < len) {
                const c = content[i];
                value += c;

                if (escaped) {
                    escaped = false;
                    i++;
                    continue;
                }

                if (c === '\\') {
                    escaped = true;
                    i++;
                    continue;
                }

                if (c === '$' && i + 1 < len && content[i + 1] === '{') {
                    // enter ${ ... } expression, track nested braces
                    i += 2; // skip "${"
                    value += '{';
                    let depth = 1;
                    let innerEscaped = false;

                    while (i < len && depth > 0) {
                        const ic = content[i];
                        value += ic;

                        if (innerEscaped) {
                            innerEscaped = false;
                        } else if (ic === '\\') {
                            innerEscaped = true;
                        } else if (ic === '{') {
                            depth++;
                        } else if (ic === '}') {
                            depth--;
                        }

                        i++;
                    }
                    continue;
                }

                if (c === '`') {
                    // end of template literal
                    results.push(value);
                    i++;
                    break;
                }

                i++;
            }
            continue;
        }

        i++;
    }

    return results;
}

// Commands that can start a DQL expression directly (no leading pipe required)
const DQL_ROOT_COMMANDS = [
    // Data source commands
    'data',
    'describe',
    'fetch',
    'load',
    // Metric commands
    'timeseries',
    'metrics',
];

// Commands that must be used after a pipe (|)
const DQL_TRANSFORMATION_COMMANDS = [
    // Filter and search commands
    'dedup',
    'filter',
    'filterOut',
    'search',
    // Selection and modification commands
    'fields',
    'fieldsAdd',
    'fieldsKeep',
    'fieldsRemove',
    'fieldsRename',
    // Extraction and parsing commands
    'parse',
    // Ordering commands
    'limit',
    'sort',
    // Structuring commands
    'expand',
    'fieldsFlatten',
    // Aggregation commands
    'fieldsSummary',
    'makeTimeseries',
    'summarize',
    // Correlation and join commands
    'append',
    'join',
    'joinNested',
    'lookup',
    // Smartscape commands
    'smartscapeNodes',
    'smartscapeEdges',
    'traverse',
];

export function isDqlContent(raw: string): boolean {
    // Remove surrounding quotes/backticks if present and trim whitespace
    const first = raw[0];
    const last = raw[raw.length - 1];
    let s = raw;
    if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
        s = raw.substring(1, raw.length - 1);
    }

    s = s.trimStart();

    if (s.length === 0) {
        return false;
    }

    const hasLeadingPipe = s[0] === '|';

    if (hasLeadingPipe) {
        // We expect only pipe-only commands here
        s = s.slice(1).trimStart();
        if (s.length === 0) {
            return false;
        }

        const match = /^[A-Za-z]+/.exec(s);
        if (!match) {
            return false;
        }

        const cmd = match[0];
        return DQL_TRANSFORMATION_COMMANDS.includes(cmd);
    }

    // No leading pipe: must be one of the root commands
    const match = /^[A-Za-z]+/.exec(s);
    if (!match) {
        return false;
    }

    const cmd = match[0];
    return DQL_ROOT_COMMANDS.includes(cmd);
}

export function extractDqlCommands(content: string): string[] {
    const all = extractStrings(content);

    return all
        .filter(isDqlContent)
        .map(raw => {
            if (!raw || raw.length < 2) return raw;
            const first = raw[0];
            const last = raw[raw.length - 1];
            let s = raw;

            // Strip surrounding quotes/backticks if present
            if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
                s = raw.substring(1, raw.length - 1);
            }
            return s;
        });
}

// Function to parse the file and detect strings
function parseFile(filename: string): void {
    const filePath = path.resolve(process.cwd(), filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filename}`);
        process.exit(2);
    }

    try {
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf-8');

        const dqlCommands = extractDqlCommands(content);

        dqlCommands.forEach((command) => console.log(formatDqlCommand(command)));
    } catch (err) {
        console.error(`Error reading file ${filename}:`, err instanceof Error ? err.message : String(err));
        process.exit(3);
    }
}

function formatDqlCommand(command: string): string {
    // Placeholder for actual formatting logic
    return `dql-format: ${command}`; // TODO: implement actual formatting
}

// CLI Entry Point - only execute when run directly, not when imported as a module
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: dql-format <filename>');
        process.exit(1);
    }

    parseFile(args[0]);
}
