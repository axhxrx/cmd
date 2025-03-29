import { assert } from '@std/assert';
import { Cmd } from '../Cmd.ts';
import { CmdDefaults } from '../CmdDefaults.ts';

// Set quiet mode to true to avoid cluttering the test output
CmdDefaults.quiet = true;

// Test to verify the race condition bug in runCmd.ts
Deno.test('Verify the race condition bug in runCmd.ts (regression test)', async () =>
{
  // Create a script that outputs data with delays
  const scriptContent = `
    #!/bin/sh
    for i in $(seq 1 10); do
      echo "Line $i of 10"
      sleep 0.05
    done
  `;

  const scriptPath = './test-race-condition.sh';
  await Deno.writeTextFile(scriptPath, scriptContent);
  await Deno.chmod(scriptPath, 0o755);

  try
  {
    const result = await Cmd.run(scriptPath);

    // Check if stdout has content (it should)
    const stdoutLines = result.stdout.trim().split('\n');
    // console.log(`Stdout has ${stdoutLines.length} lines`);
    assert(stdoutLines.length === 10, 'Stdout should have 10 lines');

    // Check if outputs array has entries (it should, but might not due to the bug)
    // console.log(`Outputs array has ${result.outputs.length} items`);

    // The key test - the bug causes outputs array to be empty or incomplete
    if (result.outputs.length === 0)
    {
      // console.log('BUG CONFIRMED: outputs array is empty!');

      // This assertion will fail, highlighting the bug
      assert(result.outputs.length > 0, 'Due to race condition bug, outputs array is empty');
    }
    else
    {
      // This bug didn't consistently manifest, so sometimes we'd get here even before the fix
    }
  }
  finally
  {
    try
    {
      await Deno.remove(scriptPath);
    }
    catch (_)
    {
      // Ignore cleanup errors
    }
  }
});
