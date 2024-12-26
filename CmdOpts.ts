/**
 The complete descriptor needed to run a command via {@link Cmd}. This includes the `CmdOpts`, and also the command and the arguments.
 */
export interface CmdDesc
{
  /**
   The command to run. Can be a string or an array of strings.
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
   If true, echoes stdout/stderr to console in realtime. Defaults to false, which just accumulates them in memory and returns them at the end.
   */
  echo?: boolean;

  /**
   If `true`, the command itself, and its arguments, will be printed to the console for the user's reference. If a string, that string will be used as a prefix (e.g. "🚀 " might yield "🚀 ping -c 1 axhxrx.com"). Note that the empty string is still a string, so the command itself will be printed. The command will not be printed if `print` is `false` or `undefined`.
   */
  print?: string | boolean;
}

/**
 The options for running a command via {@link CommandRunner}, but without the `cmd` field or the `args` field.
 */
export type CmdOpts = Omit<CmdDesc, 'cmd' | 'args'>;

// @masonmark 2024-12-26 in a ✈️: It seems a little weird to make related types by subtraction instead of addition, but actually... 🤔 why not? I usually do it the other way but maybe I've been mistaken all my life...
