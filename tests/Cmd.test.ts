// The interactive test section that only runs if ENABLE_INTERACTIVE_TESTS is set.
// For simplicity, we assume that if sudo requires a password, it won't work without one.

import { assert, assertEquals, assertNotEquals, assertStringIncludes } from '@std/assert';
import { join } from '@std/path';
import { Cmd } from '../Cmd.ts';
import { CmdDefaults } from '../CmdDefaults.ts';

const pathToTestFixtures = import.meta.resolve('./test-fixtures').substring(7);

CmdDefaults.quiet = true;

Deno.test('Run a simple command with no args, no sudo', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'echo' });
  // echo with no arguments just prints a blank line
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout, '\n'); // echo adds a newline
  assertEquals(res.stderr, '');
});

Deno.test('Run a command with args as string', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'echo', args: 'f.u. world 🖕🌏', quiet: true });
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'f.u. world 🖕🌏');
  assertEquals(res.stderr, '');
});

Deno.test('Run a command and return a fully-populated result', async () =>
{
  const before = new Date();
  const res = await Cmd.runCommand({ cmd: 'echo', args: 'f.u. world 🖕🌏' });
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'f.u. world 🖕🌏');
  assertEquals(res.stderr, '');

  // console.log(res);

  const {
    parsedCommand,
    args,
    parsedArgs,
    sudoMode,
    cwd,
    description,
    outputs,
    stdout,
    stderr,
    success,
    exitCode,
    error,
    start,
    end,
  } = res;

  assertEquals(parsedCommand, 'echo');
  assertEquals(args, 'f.u. world 🖕🌏');
  assertEquals(parsedArgs, ['f.u.', 'world', '🖕🌏']);
  assertEquals(sudoMode, 'none');
  assertEquals(cwd, Deno.cwd());
  assertEquals(description, 'echo f.u. world 🖕🌏');
  assertEquals(outputs.length, 1);
  assertEquals(outputs[0].type, 'stdout');
  assertEquals(stdout, 'f.u. world 🖕🌏\n');
  assertEquals(stderr, '');
  assertEquals(success, true);
  assertEquals(exitCode, 0);
  assertEquals(error, undefined);
  assertEquals(start instanceof Date, true);
  assertEquals(end instanceof Date, true);

  // Check that start and end are reasonable. But with millisecond precision, we can't be too strict:

  assert(start.getTime() >= before.getTime());
  assert(end.getTime() >= start.getTime());
  assert(end.getTime() <= new Date().getTime());

  const msElapsed = end.getTime() - start.getTime();
  assert(msElapsed >= 0);
  assert(msElapsed < 50); // surely, even the slowest CI...
});

Deno.test('Run a command with args as an array', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'echo', args: ['f.u.', 'world'] });
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'f.u. world');
  assertEquals(res.stderr, '');
});

Deno.test('Run a command with arg containing spaces', async () =>
{
  const path = join(pathToTestFixtures, 'subdirectory', 'sub sub directory with spaces in name');
  const res = await Cmd.runCommand({ cmd: 'ls', args: [path] });
  console.log(res);
  assertEquals(res.stderr, '');
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'words2.txt', res.stdout);
});

Deno.test('Run a command that fails and check stderr', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'ls', args: '/this/path/does/not/exist' });
  assertEquals(res.success, false);
  assertEquals(typeof res.exitCode, 'number');
  assertNotEquals(res.exitCode, 0);
  assertStringIncludes(res.stderr.toLowerCase(), 'no such file');
});

// Test sudo noPrompt mode. This will likely fail unless there's no password required.
// Most systems need a password, so this should fail and we can assert that:
Deno.test('Run a command with sudo noPrompt (should fail if password required)', async () =>
{
  // In the case where the user running the test has used sudo recently, they may still have sudo privileges. So, drop them:
  const dropResult = await Cmd.runCommand({ cmd: 'sudo', args: '-k' });
  assertEquals(dropResult.success, true);

  // First, check if sudo requires a password
  const checkSudo = await Cmd.runCommand({
    cmd: 'sudo',
    args: ['-n', 'true'], // -n means non-interactive (no password prompt)
    quiet: true,
  });

  // If checkSudo succeeds, it means sudo doesn't require a password
  if (checkSudo.success)
  {
    console.log("Skipping sudo test - sudo doesn't require a password in this environment");
    return; // Skip the rest of the test
  }

  const res = await Cmd.runCommand({ cmd: 'id', sudoMode: 'noPrompt' });
  // We expect this to fail on a system where 'sudo' requires a password.
  // If your CI environment doesn't require password for `sudo id`, then ... boom
  assertEquals(res.success, false);
  // Check stderr for something related to sudo password
  assertStringIncludes(res.stderr.toLowerCase(), 'sudo');
});

Deno.test('Run a Cmd instance (instead of string representation)', async () =>
{
  const cmd = new Cmd('echo', ['f.u.', 'world 🖕🌏']);
  // console.log(cmd);
  const res = await cmd.run();
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'f.u. world 🖕🌏');
  assertEquals(res.stderr, '');
});

// If ENABLE_INTERACTIVE_TESTS is set, run interactive test
if (Deno.env.get('ENABLE_INTERACTIVE_TESTS'))
{
  Deno.test('Interactive sudo test (requires human to enter password)', { ignore: false }, async () =>
  {
    console.log('Please enter your sudo password if prompted.');
    const res = await Cmd.runCommand({
      cmd: 'id',
      sudoMode: 'interactive',
    });

    // If password was entered correctly, it should succeed
    assertEquals(res.success, true);
    assertEquals(res.exitCode, 0);
    assertStringIncludes(res.stdout, 'uid=');
  });
}
