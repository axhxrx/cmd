/**
 Our own result type for command execution. Not to be confused with Deno's `CommandOutput` type.
 */
 export type CmdResult = {
  /**
   A description of the command that was run, e.g. `ls -laR hoge` for a shell command, or `CREATE FILE: hoge.txt` for a synthetic command.
   */
  description: string;

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
   When the Cmd actually started.
   */
  start: Date;

  /**
   When the Cmd actually finished.
   */
  end: Date;
};
