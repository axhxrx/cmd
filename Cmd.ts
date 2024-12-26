import { bold, green, red } from 'jsr:@std/internal@^1.0.5/styles';
import { CmdFn } from './CmdFn.ts';
import type { CmdDesc, CmdOpts } from './CmdOpts.ts';
import type { CmdResult } from './CmdResult.ts';
import { shittyParse } from './shittyParse.ts';

/**
 The options for running a command via {@link Cmd}. Can be used to override any of the options in {@link CmdRunOpts}.
 */
export type CmdRunOpts = {
  args?: string[];

  sudoMode?: 'none' | 'interactive' | 'noPrompt';

  print?: 'output' | 'all' | 'none';

  formatting?: {
    prefix?: string;
    bold?: boolean;
  };
};

/**
 A class for running commands, optionally with sudo, with a single result type that is easy for both humans and automatons to understand. Only Linux or POSIX-like systems are supported.

 Commands are conceptually similar to shell commands, but there's generally no shell actually involved; either the command is run via direct invocation (like `'ls -la /'`), or it is a TypeScript function that executes within the context of the runtime (currently, only Deno is supported). But either way, it's intended to "feel like" a shell command.

 The only reason this exists is to formalize the result type, to enable uniformly-structured logs of command sequences, and to add a degree of convenience.

 The name `Cmd` was chosen for that last reason.
 */
export class Cmd
{
  /**
   The type of command. An "external" command is a command that is run similarly to a shell command, and may be conveniently defined with a string like `'ls -la /'`.

   An "internal" command is a command that is run within the context of the runtime, either as a subclass of `Cmd` or defined with a TypeScript function.

   Either way, the result type is the same.
   */
  type: 'internal' | 'external' = 'internal';

  /**
   The arguments to run the command with. For solidarity with shell commands, this is an array of strings, even though for `internal` commands it could be anything.
   */
  args: string[] = [];

  /**
   Whether to run the command with sudo. This is currently only applicable to `external` commands, since `internal` commands are run in the context of the runtime. If you need internal commands to have root privileges, you'll have to run the program with root privileges.
   */
  sudoMode: 'none' | 'interactive' | 'noPrompt' = 'none';

  /**
   The `print` option controls what is printed to stdout when running the command. By default,  command description, stdout, and stderr are printed. If `print` is `false`, nothing is printed.
   */
  print: 'output' | 'all' | 'none' = 'all';

  /**
   The `formatting` option controls how the command description is printed. By default, the description is printed in bold, with a prefix of `🔧 `.
   */
  formatting = {
    prefix: '🔧 ',
    bold: true,
  };

  async run(): Promise<CmdResult>
  {
    return await Cmd.runCommand({
      cmd: this.args[0],
      args: this.args.slice(1),
      sudoMode: this.sudoMode,
    });
  }

  /**
   A convenience wrapper for {@link Cmd.runCommand}. This is a shortcut for running a single command, like this:
   ```ts
   const result = await Cmd.run('ls -l /');
   console.log(result);
   ```
   */
  static async run(command: string | string[], options: CmdOpts = {}): Promise<CmdResult>
  {
    if (Array.isArray(command))
    {
      const opts = { ...options, cmd: command[0], args: command.slice(1) };
      return await this.runCommand(opts);
    }
    else
    {
      const parsed = shittyParse(command);
      const fullOptions = { ...options, cmd: parsed.command, args: parsed.args };
      return await this.runCommand(fullOptions);
    }
  }

  /**
   Run a command on Linux or POSIX-like systems. This is a convenience wrapper for Deno.Command, that assumes UTF-8 encoding and has option `sudo` and output-echoing features. No Windows support.

   #### LLM-provided summary:

   This shit defines a `CommandRunner` class that can run commands using Deno's new `Deno.Command` API.
   It takes care of a few things:

   1. If args is a string, we split it into an array. If it's already an array, we just use it as is.

   2. If sudo is requested interactively, we prepend "sudo" and let stdin be inherited from the parent process, the user can type their password. If we need a noPrompt sudo mode, we do `sudo -n ...` so it fails if password needed. If none, we just run the command directly.

   3. We capture stdout and stderr by reading from their streams. If echo is true, we write them out in real time the console. Otherwise, we just accumulate them in memory.

   4. At the end, we return an object with stdout, stderr, success, code, and possible error.

   5. We track start and end times, and put them in the returned object.
   */
  static async runCommand(options: CmdDesc): Promise<CmdResult>
  {
    const {
      cmd,
      args = [],
      sudoMode = 'none',
      echo = false,
    } = options;

    // Hacky but worth-it-for-convenence: split string if user only gave one string for the args
    const finalArgs = typeof args === 'string'
      ? shittyParse(args, true).args
      : args;

    // handle sudo modes
    // "interactive": just run `sudo ...`. If password needed, user must type it (stdin: "inherit")
    // "noPrompt": run with `sudo -n ...` which should fail if password is needed
    // "none": just run the cmd
    let cmdArray: string[] = [];
    let stdinStrategy: 'inherit' | 'null' = 'null';
    if (sudoMode === 'interactive')
    {
      cmdArray = ['sudo', ...[cmd, ...finalArgs]];
      stdinStrategy = 'inherit';
    }
    else if (sudoMode === 'noPrompt')
    {
      cmdArray = ['sudo', '-n', cmd, ...finalArgs];
    }
    else
    {
      cmdArray = [cmd, ...finalArgs];
    }

    const start = new Date();

    const commandName = cmdArray[0];

    // Construct the command
    const command = new Deno.Command(commandName, {
      args: cmdArray.slice(1),
      stdin: stdinStrategy,
      stdout: 'piped',
      stderr: 'piped',
    });

    if (options.print === true || typeof options.print === 'string')
    {
      const prefix = options.print === true ? '' : `${options.print}`;
      const args = cmdArray.slice(1).join(' ');
      console.log(bold(`${prefix} ${commandName} ${args}`));
    }

    // Spawn the process
    const child = command.spawn();

    let stdout = '';
    let stderr = '';

    // We’re going to consume the stdout and stderr streams in real time.
    // If echo is true, we print them as they come. Otherwise we just accumulate.
    const stdoutPromise = (async () =>
    {
      for await (const chunk of child.stdout)
      {
        const text = new TextDecoder().decode(chunk);
        stdout += text;
        if (echo)
        {
          await Deno.stdout.write(chunk);
        }
      }
    })();

    const stderrPromise = (async () =>
    {
      for await (const chunk of child.stderr)
      {
        const text = new TextDecoder().decode(chunk);
        stderr += text;
        if (echo)
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

    // Wait until we finish reading stdout/stderr
    await stdoutPromise;
    await stderrPromise;

    const end = new Date(); // tracking but we’re not returning this.
    // If you want, just store or log it.

    return {
      description: cmdArray.join(' '),
      stdout,
      stderr,
      success,
      exitCode,
      error,
      start,
      end,
    };
  }

  static async runSequence(commands: Array<string | CmdFn | CmdDesc>): Promise<CmdResult[]>
  {
    // FIXME: OPTIONS ARE A MESS
    const opts: CmdOpts = { print: '🔧 ', echo: true };

    const results: CmdResult[] = [];

    for (const command of commands)
    {
      if (command instanceof CmdFn)
      {
        console.log(bold(`${opts.print} ${command.name}`));
        await command.run();
        const result = command.result;
        results.push(result);
        if (result.success)
        {
          console.log(green(`${command.stdout}`));
        }
        else
        {
          console.error(red(`${command.stderr}`));
          console.log(bold(`🚫 ${command.name} FAILED. Aborting.`));
          break;
        }
      }
      else if (typeof command === 'string')
      {
        const result = await this.run(command, opts);
        results.push(result);
        if (!result.success)
        {
          console.log(bold(`🚫 ${command} FAILED. Aborting.`));
          break;
        }
      }
      else
      {
        const result = await this.runCommand({ ...command, ...opts });
        results.push(result);
        if (!result.success)
        {
          console.log(bold(`🚫 ${command} FAILED. Aborting.`));
          break;
        }
      }
    }
    return results;
  }
}
