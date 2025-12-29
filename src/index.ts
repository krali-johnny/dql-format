#!/usr/bin/env node

import { parseFile } from './utils/parseFile.util';
import { collectTargetFiles } from './utils/collectTargetFiles.util';

// CLI Entry Point - only execute when run directly, not when imported as a module
if (require.main === module) {
  const argv = process.argv.slice(2);

  // Simple flag parsing for --ext=.ts,.tsx and positional paths
  const extensions: string[] = [];
  const paths: string[] = [];

  for (const arg of argv) {
    if (arg.startsWith('--ext=')) {
      const raw = arg.slice('--ext='.length).trim();
      if (raw.length > 0) {
        raw.split(',').forEach((ext) => {
          const normalized = ext.startsWith('.') ? ext : `.${ext}`;
          if (!extensions.includes(normalized)) {
            extensions.push(normalized);
          }
        });
      }
    } else {
      paths.push(arg);
    }
  }

  if (paths.length === 0) {
    console.error('Usage: dql-format <filename> [--ext=.ts,.tsx]');
    process.exit(1);
  }

  try {
    const files = collectTargetFiles(paths, {
      extensions: extensions.length > 0 ? extensions : undefined,
    });

    if (files.length === 0) {
      console.error('No matching files found');
      process.exit(0);
    }

    for (const file of files) {
      // collectTargetFiles returns absolute paths; parseFile can now handle them directly
      parseFile(file);
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Path not found:')) {
      console.error(err.message.replace('Path not found', 'File not found'));
      process.exit(2);
    }

    console.error(err instanceof Error ? err.message : String(err));
    process.exit(3);
  }
}
