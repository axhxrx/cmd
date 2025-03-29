import { bold } from 'jsr:@std/internal@^1.0.5/styles';
import { AbstractCmd } from './AbstractCmd.ts';
import { CmdDefaults } from './CmdDefaults.ts';
import type { CmdDesc } from './CmdDesc.ts';
import type { CmdOpts } from './CmdOpts.ts';
import type { CmdOutput } from './CmdOutput.ts';
import type { CmdResult } from './CmdResult.ts';
import { combineChunks } from './combineChunks.ts';
import { shittyParse } from './shittyParse.ts';

/**
 Runs a command, optionally with sudo, and returns a {@link CmdResult} object. (Only POSIX-like systems are supported, e.g. Linux and macOS.)

 This is the convenience form; it's similar to `runCmd()` but you can pass a string or an array of strings instead or creating a `CmdDesc` object yourself. E.g.:

 ```ts
 // simplest, if you don't have weird args with spaces, quotes, etc.
 const res1 = await Cmd.run('ls -l /');

 // if you have weird args, or you want to pass an array of
 const res2 = await Cmd.run(['ls', '-l', '/Users/alice/Application Support']);
 const res3 = await Cmd.run({ cmd: 'ls', args: '-l /' });
 ```
 */
export function run(cmd: AbstractCmd): Promise<CmdResult>;
export function run(desc: CmdDesc): Promise<CmdResult>;
export function run(command: string | string[], options?: CmdOpts): Promise<CmdResult>;
export function run(
  commandOrDesc: string | string[] | CmdDesc | AbstractCmd,
  options: CmdOpts = {},
): Promise<CmdResult>
{
  if (commandOrDesc instanceof AbstractCmd)
  {
    return runCmd(commandOrDesc);
  }

  if (typeof commandOrDesc === 'object' && !Array.isArray(commandOrDesc))
  {
    return runCmdDesc(commandOrDesc);
  }

  if (Array.isArray(commandOrDesc))
  {
    const opts = { ...options, cmd: commandOrDesc[0], args: commandOrDesc.slice(1) };
    return runCmdDesc(opts);
  }
  else
  {
    // Hacky but worth-it-for-convenence: split string if user only gave one string for the args
    const parsed = shittyParse(commandOrDesc);
    const fullOptions = { ...options, cmd: parsed.command, args: parsed.args };
    return runCmdDesc(fullOptions);
  }
}

/**
 Runs a command, optionally with sudo, and returns a {@link CmdResult} object. (Only POSIX-like systems are supported, e.g. Linux and macOS.)
 */
export const runCmd = (cmd: AbstractCmd): Promise<CmdResult> =>
{
  return cmd.run();
};

/**
  Runs a command, optionally with sudo, and returns a {@link CmdResult} object. (Only POSIX-like systems are supported, e.g. Linux and macOS.)
 */
export const runCmdDesc = async (options: CmdDesc): Promise<CmdResult> =>
{
  const {
    cmd,
    args = [],
    sudoMode = 'none',
    cwd = Deno.cwd(),
    quiet = CmdDefaults.quiet,
  } = options;

  const parsedCommand = cmd;
  const parsedArgs = Array.isArray(args) ? args : shittyParse(args, true).args;

  let cmdArray: string[] = [];
  let stdinStrategy: 'inherit' | 'null' = 'null';

  if (sudoMode === 'interactive')
  {
    cmdArray = ['sudo', ...[cmd, ...parsedArgs]];
    stdinStrategy = 'inherit';
  }
  else if (sudoMode === 'noPrompt')
  {
    // -n should fail if password is needed
    cmdArray = ['sudo', '-n', cmd, ...parsedArgs];
  }
  else
  {
    cmdArray = [cmd, ...parsedArgs];
  }

  const start = new Date();

  const commandName = cmdArray[0];

  // Construct the command
  const command = new Deno.Command(commandName, {
    args: cmdArray.slice(1),
    stdin: stdinStrategy,
    stdout: 'piped',
    stderr: 'piped',
    cwd,
  });

  const print = !quiet;
  const prefix = '🚀 '; // customizable? maybe later

  if (!quiet)
  {
    const args = cmdArray.slice(1).join(' ');
    console.log(bold(`\n\n${prefix} ${commandName} ${args}\n`));
  }

  const child = command.spawn();

  let stdout = '';
  let stderr = '';
  const stdoutChunks: Uint8Array[] = [];
  const stderrChunks: Uint8Array[] = [];
  const outputs: CmdOutput[] = [];

  // Consume the stdout and stderr streams in real time, printing as we go if indicated by the options.
  const stdoutPromise = (async () =>
  {
    for await (const chunk of child.stdout)
    {
      stdoutChunks.push(chunk);
      const text = new TextDecoder().decode(chunk);
      stdout += text;
      if (print)
      {
        await Deno.stdout.write(chunk);
      }
    }
  })();

  const stderrPromise = (async () =>
  {
    for await (const chunk of child.stderr)
    {
      stderrChunks.push(chunk);
      const text = new TextDecoder().decode(chunk);
      stderr += text;
      if (print)
      {
        await Deno.stderr.write(chunk);
      }
    }
  })();

  let error: Error | undefined = undefined;
  let exitCode = 0;
  let success = false;

  try
  {
    // Wait for the command to finish
    const status = await child.status;
    exitCode = status.code;
    success = status.success;
  }
  catch (err)
  {
    error = err instanceof Error ? err : new Error('Unknown error during command execution');
  }

  // Wait until we finish reading stdout/stderr:
  await stdoutPromise;
  await stderrPromise;

  // Now that all chunks have been collected, create buffers:
  const stdoutBuffer = combineChunks(stdoutChunks);
  const stderrBuffer = combineChunks(stderrChunks);

  const end = new Date();

  if (stdoutBuffer.length > 0)
  {
    outputs.push({ type: 'stdout', content: stdoutBuffer });
  }
  if (stderrBuffer.length > 0)
  {
    outputs.push({ type: 'stderr', content: stderrBuffer });
  }

  return {
    args,
    parsedCommand,
    parsedArgs,
    sudoMode,
    cwd,
    quiet,
    description: cmdArray.join(' '),
    outputs,
    stdout,
    stderr,
    success,
    exitCode,
    error,
    results: [],
    start,
    end,
  };
};
