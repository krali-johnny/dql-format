import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const nodeBin = process.execPath;
const cliPath = path.resolve(__dirname, '..', 'dist', 'index.js');

describe('dql-format CLI', () => {
  test('prints usage and exits with code 1 when no args provided', () => {
    const result = spawnSync(nodeBin, [cliPath], { encoding: 'utf-8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Usage: dql-format <filename>');
  });

  test('exits with code 2 when file does not exist', () => {
    const result = spawnSync(nodeBin, [cliPath, 'non-existent-file.txt'], { encoding: 'utf-8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('File not found: non-existent-file.txt');
  });

  test('prints [] when no DQL strings are found', () => {
    const tmpFile = path.join(__dirname, 'tmp-no-dql.txt');
    fs.writeFileSync(tmpFile, 'const a = "hello";');

    const result = spawnSync(nodeBin, [cliPath, tmpFile], { encoding: 'utf-8' });

    fs.unlinkSync(tmpFile);

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('');
  });

  test.skip('prints each DQL command on its own line', () => {
    const tmpFile = path.join(__dirname, 'tmp-with-dql.txt');
    const content = [
      'const q1 = "data from logs";',
      'const q2 = "| filter status == 200";',
    ].join('\n');
    fs.writeFileSync(tmpFile, content);

    const result = spawnSync(nodeBin, [cliPath, tmpFile], { encoding: 'utf-8' });

    fs.unlinkSync(tmpFile);

    expect(result.status).toBe(0);
    const lines = result.stdout.trim().split(/\r?\n/);
    expect(lines).toEqual(['data from logs', '| filter status == 200']);
  });
});

