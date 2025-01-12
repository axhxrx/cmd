import { assert, assertEquals, assertStringIncludes } from '@std/assert';
import { join } from '@std/path';
import { CmdDefaults } from '../CmdDefaults.ts';
import { writeTextFile } from '../writeTextFile.ts';

const pathToTestFixtures = import.meta.resolve('./test-fixtures').substring(7);
const path1 = join(pathToTestFixtures, 'names.txt');
const path2 = join(pathToTestFixtures, 'subdirectory', 'words2.txt');
const path3 = join(pathToTestFixtures, 'subdirectory', 'sub sub directory with spaces in name', 'words2.txt');

CmdDefaults.quiet = true;

Deno.test('writeTextFile(): writing a text file should succeed', async () =>
{
  // create a test dir so we don't pollute stuff
  const testDir = './test-fixtures/write-tests';
  await Deno.mkdir(testDir, { recursive: true });

  const filePath = `${testDir}/test-write.txt`;
  const text = 'Hello from the test suite!';

  // call the function
  const result = await writeTextFile(filePath, text);

  // we expect success
  assert(result.success, 'Expected the write to succeed');
  assertEquals(result.exitCode, 0, 'Expected exitCode = 0');
  // ensure some output text
  assertStringIncludes(result.stdout ?? '', 'Wrote', 'Expected stdout to mention "Wrote"');

  // read it back
  const readContents = await Deno.readTextFile(filePath);
  assertEquals(readContents, text, 'The file contents should match the text we wrote');

  // console.log(result);

  // The result should look something like this:
  // {
  //   args: [ "./test-fixtures/write-tests/test-write.txt" ],
  //   parsedCommand: "",
  //   parsedArgs: [ "/Volumes/CODE/@axhxrx/test-fixtures/write-tests/test-write.txt" ],
  //   description: "",
  //   outputs: [
  //     {
  //       type: "info",
  //       text: "RUNNING: CmdWriteTextFile: ./test-fixtures/write-tests/test-write.txt"
  //     },
  //     {
  //       type: "info",
  //       text: "SUCCEEDED: CmdWriteTextFile: ./test-fixtures/write-tests/test-write.txt"
  //     }
  //   ],
  //   stdout: "Wrote 26 characters to /Volumes/CODE/@axhxrx/test-fixtures/write-tests/test-write.txt",
  //   stderr: "",
  //   success: true,
  //   exitCode: 0,
  //   start: 2025-01-11T06:27:44.143Z,
  //   end: 2025-01-11T06:27:44.143Z,
  //   error: undefined,
  //   sudoMode: "none",
  //   cwd: "/Volumes/CODE/@axhxrx",
  //   quiet: true
  // }
  const realPath = await Deno.realPath(filePath);

  assertEquals(result.args, [filePath]);
  assertEquals(result.parsedCommand, '');
  assertEquals(result.parsedArgs, [realPath]);
  assertEquals(result.description, `CmdWriteTextFile: ${filePath}`);
  assertEquals(result.outputs, [
    { type: 'info', text: 'RUNNING: CmdWriteTextFile: ./test-fixtures/write-tests/test-write.txt' },
    { type: 'info', text: 'SUCCEEDED: CmdWriteTextFile: ./test-fixtures/write-tests/test-write.txt' },
  ]);
  assertEquals(result.stdout, `Wrote ${text.length} characters to ${realPath}`);
  assertEquals(result.stderr, '');
});

Deno.test('writeTextFile(): attempting to write to a directory path should fail', async () =>
{
  // this directory already exists from the previous test
  const testDir = './test-fixtures/write-tests';

  // try to write text to the directory path instead of a file
  const result = await writeTextFile(testDir, 'Oh dear, that is indeed a directory!');

  // we expect failure
  assert(!result.success, 'Expected the write to fail');
  assertEquals(result.exitCode, 1, 'Expected exitCode = 1');
  assertStringIncludes(result.stderr ?? '', 'Error writing to', 'Expected stderr to mention the error');

  // console.log(result);

  // The result should look something like this:
  // {
  //   args: [ "./test-fixtures/write-tests" ],
  //   parsedCommand: "",
  //   parsedArgs: [],
  //   description: "CmdWriteTextFile: ./test-fixtures/write-tests",
  //   outputs: [
  //     {
  //       type: "info",
  //       text: "RUNNING: CmdWriteTextFile: ./test-fixtures/write-tests"
  //     },
  //     {
  //       type: "info",
  //       text: "FAILED: CmdWriteTextFile: ./test-fixtures/write-tests"
  //     }
  //   ],
  //   stdout: "",
  //   stderr: "Error writing to ./test-fixtures/write-tests: Is a directory (os error 21): writefile './test-fixtures/write-tests'",
  //   success: false,
  //   exitCode: 1,
  //   start: 2025-01-11T06:33:54.057Z,
  //   end: 2025-01-11T06:33:54.057Z,
  //   error: Error: Is a directory (os error 21): writefile './test-fixtures/write-tests'
  //     at writeFile (ext:deno_fs/30_fs.js:842:13)
  //     at Object.writeTextFile (ext:deno_fs/30_fs.js:884:12)
  //     at CmdWriteTextFile.run (file:///Volumes/CODE/@axhxrx/cmd/writeTextFile.ts:26:18)
  //     at writeTextFile (file:///Volumes/CODE/@axhxrx/cmd/writeTextFile.ts:57:17)
  //     at file:///Volumes/CODE/@axhxrx/cmd/writeTextFile.test.ts:79:24
  //     at innerWrapped (ext:cli/40_test.js:191:11)
  //     at exitSanitizer (ext:cli/40_test.js:107:33)
  //     at outerWrapped (ext:cli/40_test.js:134:20),
  //   sudoMode: "none",
  //   cwd: "/Volumes/CODE/@axhxrx",
  //   quiet: true
  // }

  assertEquals(result.args, [testDir]);
  assertEquals(result.parsedCommand, '');
  assertEquals(result.parsedArgs, []);
  assertEquals(result.description, `CmdWriteTextFile: ${testDir}`);
  assertEquals(result.outputs, [
    { type: 'info', text: 'RUNNING: CmdWriteTextFile: ./test-fixtures/write-tests' },
    { type: 'info', text: 'FAILED: CmdWriteTextFile: ./test-fixtures/write-tests' },
  ]);
  assertEquals(result.stdout, '');
  assertStringIncludes(result.stderr, 'Error writing to ./test-fixtures/write-tests: Is a directory');
});
