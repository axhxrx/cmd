import type { CmdDesc } from './CmdDesc.ts';
import type { CmdOutput } from './CmdOutput.ts';

/**
 The mutable result type is intended for use within the `Cmd` class itself, or alternative implementations that need to progressively build a result before returning it.
 */
export interface MutableCmdResult extends Readonly<Omit<CmdDesc, 'cmd'>>
{
  /**
   The command that was run, as a string. This property only exists because there are convenience forms that let you pass the command and args as a single string; this property indicates how the command was parsed internally, regardless of how the command was constructed.
   */
  parsedCommand: string;

  /**
   The args passed to the command, as an array of strings. This property only exists because the `args` property is allowed to be an array or a string. This property is always an array, and reflects how the `args` property was parsed internally, if it was originally a string. (If `args` was originally an array, this property is the same as `args`.)
   */
  parsedArgs: string[];

  /**
   A description of the command that was run, e.g. `ls -laR hoge` for a shell command, or `CREATE FILE: hoge.txt` for a synthetic command.
   */
  description: string;

  /**
   The ordered sequence of outputs from the command. This includes stdout, stderr, and any info messages emitted by the command itself.
   */
  outputs: CmdOutput[];

  /**
   The output of the command as a (UTF-8) string.
   */
  stdout: string;

  /**
   The error output of the command as a (UTF-8) string.
   */
  stderr: string;

  /**
   Whether the command succeeded. Normally this is `true` if the exit code is 0, but this field is the canonical source of truth.
   */
  success: boolean;

  /**
   The exit code of the command.
   */
  exitCode: number;

  /**
   A TypeScript `Error` object, if the command failed, otherwise `undefined`. The `error` field may or may not provide better information than the `stderr` field.
   */
  error?: Error;

  /**
   The results of any subcommands that were run as part of this command. This only applies to command sequences. Contains the ordered list of results of the subcommands run by the sequence. If the sequence is aborted, e.g. due to unexpected failure of a step in the sequence, this list will only contain results for the commands that were attempted to be run.
   */
  results: CmdResult[];

  /**
   When the Cmd actually started.
   */
  start: Date;

  /**
   When the Cmd actually finished.
   */
  end: Date;
}

/**
 The immutable result of a `Cmd` execution. A `Cmd` is mutable config for a command to be run; a `CmdResult` is the immutable result of a single attempt to run such a command. It shares properties with `CmdDesc` and `MutableCmdResult`, but most optional properties are required in a `CmdResult`, for clarity.
 */
export type CmdResult =
  & Readonly<MutableCmdResult>
  & { error: Error | undefined }
  & { sudoMode: 'none' | 'interactive' | 'noPrompt' }
  & { cwd: string }
  & { quiet: boolean }
  & { results: CmdResult[] };
