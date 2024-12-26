// Sr. Engineer No. 0021, here's a test file for CommandRunner.
// We'll cover some straightforward tests that can run in CI without needing a password.
// We'll also add an interactive test section that only runs if ENABLE_INTERACTIVE_TESTS is set.
// For simplicity, we assume that if sudo requires a password, it won't work without one.
// Obviously, these tests depend on your environment. Adjust as needed.

import { assertEquals, assertStringIncludes } from '@std/assert';
import { Cmd } from './Cmd.ts';

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
  const res = await Cmd.runCommand({ cmd: 'echo', args: 'hello world' });
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'hello world');
  assertEquals(res.stderr, '');
});

Deno.test('Run a command with args as an array', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'echo', args: ['hello', 'world'] });
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertEquals(res.stdout.trim(), 'hello world');
  assertEquals(res.stderr, '');
});

Deno.test('Run a command that fails and check stderr', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'ls', args: '/this/path/does/not/exist' });
  assertEquals(res.success, false);
  // The exit code is likely non-zero
  assertEquals(typeof res.exitCode, 'number');
  // stderr should have some error message
  assertStringIncludes(res.stderr.toLowerCase(), 'no such file');
});

// Test sudo noPrompt mode. This will likely fail unless there's no password required.
// Most systems need a password, so this should fail and we can assert that:
Deno.test('Run a command with sudo noPrompt (should fail if password required)', async () =>
{
  const res = await Cmd.runCommand({ cmd: 'id', sudoMode: 'noPrompt' });
  // We expect this to fail on a system where 'sudo' requires a password.
  // If your CI environment doesn't require password for `sudo id`, then this test may pass.
  // Adjust as needed.
  assertEquals(res.success, false);
  // Check stderr for something related to sudo password
  assertStringIncludes(res.stderr.toLowerCase(), 'sudo');
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

// Another idea: we can test the echo option by just running a command.
// Hard to automatically test the "echo" functionality since it writes directly to stdout/stderr of the process running these tests.
// We just trust that if "echo" is true, it won't break execution.
// We'll just run a command with echo = true to ensure it doesn't crash.
// You would visually confirm that output appears in test logs.
Deno.test('Run command with echo enabled (visual check in logs)', async () =>
{
  const res = await Cmd.runCommand({
    cmd: 'echo',
    args: 'this should appear in test logs',
    echo: true,
  });
  assertEquals(res.success, true);
  assertEquals(res.exitCode, 0);
  assertStringIncludes(res.stdout, 'this should appear in test logs');
});
