/**
 The complete descriptor needed to run a command via {@link Cmd}. This includes the `CmdOpts`, and also the command and the arguments.
 */
export interface CmdDesc
{
  /**
   The command to run. This should be a string that resolves to an executable command, such as 'ls' or '/bin/ls'.
   */
  cmd: string;

  /**
   The arguments to pass to the command. Can be a string or an array of strings.
   */
  args?: string[] | string;

  /**
   The sudo mode to use. Defaults to "none". ("none" = no sudo, "interactive" = run with sudo and allow user to type password, "noPrompt" = run with sudo and fail if password needed)
   */
  sudoMode?: 'none' | 'interactive' | 'noPrompt';

  /**
   The working directory to use when executing the command. Defaults to the working directory of the app running the command.
   */
  cwd?: string;

  /**
   By default, a textual summary of the command itself, and its arguments, will be printed to stdout, and then all stdout and stderr output from the underlying command will also be printed. Set `quiet` to `true` to prevent this.
   */
  quiet?: boolean;
}
