import { assert, assertEquals, assertStringIncludes } from '@std/assert';
import { join } from '@std/path';
import { CmdDefaults } from '../CmdDefaults.ts';
import { readTextFile } from '../readTextFile.ts';
import { FileContents } from './test-fixtures/FileContents.ts';

CmdDefaults.quiet = true;

const pathToTestFixtures = import.meta.resolve('./test-fixtures').substring(7);
const path1 = join(pathToTestFixtures, 'names.txt');
const path2 = join(pathToTestFixtures, 'subdirectory', 'words.txt');
const path3 = join(pathToTestFixtures, 'subdirectory', 'sub sub directory with spaces in name', 'words2.txt');

Deno.test('readTextFile(): reading a text file should succeed', async () =>
{
  const result1 = await readTextFile(path1);
  console.log(result1);
  const result2 = await readTextFile(path2);
  console.log(result2);
  const result3 = await readTextFile(path3);
  const result4 = await readTextFile(path1 + '.nonexistent');

  assert(result1.success);
  assert(result2.success);
  assert(result3.success);

  assertEquals(result1.stdout, FileContents.names);
  assertEquals(result2.stdout, FileContents.words);
  assertEquals(result3.stdout, FileContents.words2);

  assert(!result4.success);
  assertStringIncludes(result4.stderr, `o such file or directory`);
  assert(result4.error instanceof Error);
});
