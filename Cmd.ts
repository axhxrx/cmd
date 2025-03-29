import { AbstractCmd } from './AbstractCmd.ts';
import { CmdCd } from './cd.ts';
import type { CmdDesc } from './CmdDesc.ts';
import type { CmdResult } from './CmdResult.ts';
import { CmdSeq } from './CmdSeq.ts';
import { CmdReadTextFile } from './readTextFile.ts';
import { run, runCmdDesc } from './runCmd.ts';
import { shittyParse } from './shittyParse.ts';
import { shittySplit } from './shittySplit.ts';
import { CmdWriteTextFile } from './writeTextFile.ts';

/**
 A class for running commands, optionally with sudo, with a single result type that is easy for both humans and automatons to understand. Only Linux or POSIX-like systems are supported.

 Commands are conceptually similar to shell commands, but there's generally no shell actually involved; either the command is run via direct invocation (like `'ls -la /'`), or it is a TypeScript function that executes within the context of the runtime (currently, only Deno is supported). But either way, it's intended to "feel like" a shell command.

 The only reason this exists is to formalize the result type, to enable uniformly-structured logs of command sequences, and to add a degree of convenience.

 The name `Cmd` was chosen for that last reason.
 */
export class Cmd extends AbstractCmd implements Required<CmdDesc>
{
  override description: string;

  /**
   You can create a command by passing a `CmdDesc` object, or a command string and (optional) arguments.
   */
  constructor(desc: CmdDesc);
  constructor(cmd: string, args?: string[] | string);
  constructor(descOrCmd: CmdDesc | string, args?: string[] | string)
  {
    super();
    this.description = 'FIXME: description to be implemented';
    {
      if (typeof descOrCmd === 'string')
      {
        this.cmd = descOrCmd;
        this.args = typeof args === 'string'
          ? shittyParse(args, true).args
          : args ?? [];
      }
      else
      {
        const desc = descOrCmd;
        this.cmd = desc.cmd;

        this.args = typeof desc.args === 'string'
          ? shittyParse(desc.args, true).args
          : desc.args ?? [];

        this.sudoMode = desc.sudoMode ?? this.sudoMode;

        if (desc.cwd)
        {
          this.cwd = desc.cwd;
        }

        this.quiet = desc.quiet ?? this.quiet;
      }
    }
  }

  run(): Promise<CmdResult>
  {
    return Cmd.runCommand(this);
  }

  static run = run;

  static runCommand = runCmdDesc;

  /**
   Creates and returns a new `CmdSeq` command sequence object, from a multiline string. Note that each line is trimmed, and each line is treated as a separate command that is executed sequentially. Execution stops if any command fails. Example:
   ```ts
   const sequence = Cmd.seq`
     echo THIS SHOULD PRINT
     ls -la ${pathToTestFixtures}
     ls -la /nonexistent-77C6B8F6-ADA9-4EC7-AC69-E5D35EE602B2
     echo THIS SHOULD NOT PRINT
   `;
   ```
   */
  static seq(strings: TemplateStringsArray, ...values: unknown[]): CmdSeq
  {
    // Combine the strings and values alternately
    const command = strings.reduce(
      (result, str, i) => result + str + (values[i] || ''),
      '',
    );

    const lines = shittySplit(command);

    const commands: string[] = [];

    for (const line of lines)
    {
      commands.push(line.trim());
    }

    return new CmdSeq({ commands });
  }

  /**
   Returns a new `Cmd` object that changes the current working directory for the current process when run.
   */
  static cd(path: string): CmdCd
  {
    return new CmdCd(path);
  }

  /**
   Returns a new `Cmd` object that reads the content of a text file when run.
   */
  static readTextFile(filePath: string): CmdReadTextFile
  {
    return new CmdReadTextFile(filePath);
  }

  /**
   Returns a new `Cmd` object that writes the content of a text file when run.
   */
  static writeTextFile(filePath: string, text: string): CmdWriteTextFile
  {
    return new CmdWriteTextFile(filePath, text);
  }
}
