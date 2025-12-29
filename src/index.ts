#!/usr/bin/env node

import {parseFile} from "./utils/parseFile.util";

// CLI Entry Point - only execute when run directly, not when imported as a module
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: dql-format <filename>');
        process.exit(1);
    }

    parseFile(args[0]);
}
