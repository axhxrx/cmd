import { assert, assertEquals, assertStringIncludes } from '@std/assert';
import { join } from '@std/path';
import { CmdCd } from '../cd.ts';
import { Cmd } from '../Cmd.ts';
import { CmdDefaults } from '../CmdDefaults.ts';
import { CmdSeq } from '../CmdSeq.ts';

const pathToTestFixtures = import.meta.resolve('./test-fixtures').substring(7);
const pathToSubdirectory = join(pathToTestFixtures, 'subdirectory');

CmdDefaults.quiet = true;

Deno.test('Run a simple sequence', async () =>
{
  const sequence = Cmd.seq`
  ls -la ${pathToTestFixtures}
  echo HI FROM ${Deno.cwd()}

  `;

  const result = await sequence.run();
  console.log(result);
  console.log(result.results);

  const subresult = result.results[0];
  const subresult2 = result.results[1];

  assertStringIncludes(result.stdout, `HI FROM ${Deno.cwd()}\n`);
  assertStringIncludes(result.stdout, `names.txt`);

  assertEquals(result.success, true);
  assertEquals(result.exitCode, 0);

  assertStringIncludes(subresult.stdout, 'names.txt');
  assertEquals(subresult.stderr, '');
  assertEquals(subresult.success, true);
  assertEquals(subresult.exitCode, 0);

  assertEquals(subresult2.stdout, `HI FROM ${Deno.cwd()}\n`);
  assertEquals(subresult2.stderr, '');
  assertEquals(subresult2.success, true);
  assertEquals(subresult2.exitCode, 0);
});

Deno.test('Abort a sequence as soon as one command fails', async () =>
{
  const sequence = Cmd.seq`
  echo THIS SHOULD PRINT
  ls -la ${pathToTestFixtures}
  ls -la /nonexistent-77C6B8F6-ADA9-4EC7-AC69-E5D35EE602B2
  echo THIS SHOULD NOT PRINT
  `;

  const result = await sequence.run();
  console.log(result);
  console.log(result.results);

  const subresult = result.results[1];
  const subresult2 = result.results[2];

  // Slight differences in output depending on OS, so fuzz the matching:
  assertStringIncludes(result.stderr, 'ls:');
  assertStringIncludes(result.stderr, '/nonexistent-77C6B8F6-ADA9-4EC7-AC69-E5D35EE602B2');
  assertStringIncludes(result.stderr, 'o such file or directory');

  assertEquals(result.success, false);
  assertEquals(result.exitCode, 1);

  assertStringIncludes(subresult.stdout, 'names.txt');
  assertEquals(subresult.stderr, '');
  assertEquals(subresult.success, true);
  assertEquals(subresult.exitCode, 0);

  assertStringIncludes(subresult2.stdout, '');

  assertStringIncludes(result.stderr, 'ls:');
  assertStringIncludes(result.stderr, '/nonexistent-77C6B8F6-ADA9-4EC7-AC69-E5D35EE602B2');
  assertStringIncludes(result.stderr, 'o such file or directory');

  assertEquals(subresult2.success, false);
  assertEquals(subresult2.exitCode, 1);

  assert(result.results.length === 3);
  assertStringIncludes(result.stdout, 'THIS SHOULD PRINT');
  assert(!result.stdout.includes('THIS SHOULD NOT PRINT'));
});

Deno.test('Run a sequence of sequences', async () =>
{
  const ichi = Cmd.seq`
    echo UNO ${Deno.cwd()}
    echo DOS ${Deno.cwd()}
  `;

  const ni = new CmdCd(pathToTestFixtures);

  const san = Cmd.seq`
    echo TRES ${Deno.cwd()}
    echo CUATRO ${Deno.cwd()}
  `;

  const sequence = new CmdSeq({
    commands: [ichi, ni, san],
  });
  const result = await sequence.run();
  const results = result.results;

  const ichiResult = results[0];
  const niResult = results[1];
  const sanResult = results[2];

  assert(ichiResult.success);
  assert(niResult.success);
  assert(sanResult.success);

  assert(ichiResult.results.length === 2);
  assert(niResult.results.length === 0);
  assert(sanResult.results.length === 2);

  assert(ichiResult.results[0].stdout.startsWith('UNO'));
  assert(ichiResult.results[1].stdout.startsWith('DOS'));

  assertStringIncludes(niResult.stdout, pathToTestFixtures);

  assert(sanResult.results[0].stdout.startsWith('TRES'));
  assert(sanResult.results[1].stdout.startsWith('CUATRO'));
});

Deno.test('Run a sequence based on an array of commands', async () =>
{
  const initialPath = Deno.cwd();

  const commands = [
    new CmdCd(pathToTestFixtures),
    'echo uno',
    'pwd',
    new CmdCd(pathToSubdirectory),
    'echo dos',
    'pwd',
    'ls',
    new CmdCd(initialPath),
    'echo tres',
    'pwd',
  ];

  const sequence = new CmdSeq({
    commands,
  });

  const result = await sequence.run();
  const results = result.results;

  assert(result.success);
  assert(result.exitCode === 0);
  assert(results.length === 10);

  assertStringIncludes(results[1].stdout, 'uno');
  assertStringIncludes(results[2].stdout, 'test-fixtures');
  assertStringIncludes(results[3].stdout, 'subdirectory');
  assertStringIncludes(results[4].stdout, 'dos');
  assertStringIncludes(results[5].stdout, 'subdirectory');
  assertStringIncludes(results[6].stdout, 'words.txt');
  assertStringIncludes(results[7].stdout, initialPath);
  assertStringIncludes(results[8].stdout, 'tres');
  assertStringIncludes(results[9].stdout, initialPath);

  console.log(result);
});
