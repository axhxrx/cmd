import { CmdDefaults } from './CmdDefaults.ts';
import type { CmdResult, MutableCmdResult } from './CmdResult.ts';

/**
 Abstract base class for things that can be asynchronously run with `run()`, and produce a `CmdResult`.

 Subclass this if you need to implement an 'internal' command (whose implementation is TypeScript code), or a complicated shell command invocation. For most 'external' commands (i.e. real shell commands), though, there's no need to subclass this. Using `Cmd` with a string or `CmdDesc` is generally sufficient.
 */
export abstract class AbstractCmd
{
  abstract description: string;

  /**
   The fundamental method for running a command. All subclasses must implement this.
   */
  abstract run(): Promise<CmdResult>;
  
  /**
   The command to be run. This should be a string that resolves to an executable command, such as `'ls'` or `'/bin/ls'`. For 'internal' commands, this is the empty string.
   */
  cmd = '';

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

   - `none`: Don't run the command with sudo (the default).
   - `interactive`: Run the command with sudo, and prompt the user for their password.
   - `noPrompt`: Run the command with sudo, but don't prompt the user for their password; if sudo requires a password, then the command will fail. This is mainly useful when the password has already been entered by the user within the timeout period, or when the user is able to run sudo without a password.
   */
  sudoMode: 'none' | 'interactive' | 'noPrompt' = 'none';

  /**
   By default, a textual summary of the command itself, and its arguments, will be printed to stdout, and then all stdout and stderr output from the underlying command will also be printed. Set `quiet` to `true` to prevent this. You can alternatively leave this undefined, and set `CmdDefaults.quiet` to change the default behavior.
   */
  get quiet()
  {
    return typeof this._quiet === 'boolean' ? this._quiet : CmdDefaults.quiet;
  }

  set quiet(quiet: boolean)
  {
    this._quiet = quiet;
  }

  /**
   Defaults to the process working directory at the time the command is actually executed with `run()`, if not specified.
   */
  get cwd(): string
  {
    return this._cwd ?? Deno.cwd();
  }

  set cwd(cwd: string)
  {
    this._cwd = cwd;
  }

  private _cwd?: string;

  private _quiet?: boolean;

  /**
   A convenience utility function for initializing a `MutableCmdResult` object. This is for subclasses, who will then presumably modify the result object as they run.
   */
  protected initResult(): MutableCmdResult
  {
    return {
      args: this.args,
      parsedCommand: '',
      parsedArgs: [],
      description: this.description,
      outputs: [],
      stdout: '',
      stderr: '',
      success: false,
      exitCode: -1,
      start: new Date(),
      end: new Date(),
      error: undefined,
      results: [],
    };
  }

  /**
   Finalizes a `MutableCmdResult` object into a `CmdResult` object. This is for subclasses, who will then presumably return the result object from their `run()` method.
   */
  protected finalizeResult(result: MutableCmdResult): CmdResult
  {
    result.end = new Date();
    const finalized: CmdResult = {
      ...result,
      error: result.error ?? undefined,
      sudoMode: result.sudoMode ?? 'none',
      cwd: result.cwd ?? Deno.cwd(),
      quiet: result.quiet ?? CmdDefaults.quiet,
      results: result.results ?? [],
    };
    return finalized;
  }

  /**
   Utility function to help 'internal' commands print text in a way similar to an actual 'external' shell command. If `quiet` is `false`, print the given text to stdout or stderr. Regardless, append the text to the `stdout` or `stderr` properties of the `result` object.
   */
  print(where: 'stdout' | 'stderr', result: MutableCmdResult, text: string)
  {
    if (where === 'stdout')
    {
      result.stdout += text;
      if (!this.quiet)
      {
        console.log(text);
      }
    }
    else
    {
      result.stderr += text;
      if (!this.quiet)
      {
        console.error(text);
      }
    }
  }
}
