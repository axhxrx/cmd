/**
 The outputs of a `Cmd` include the stdout and stderr of its underlying external or internal command, and also `'info'` messages that are emitted by the `Cmd` itself.

 The reason to keep those all separate is to make it easy to differentiate the underlying command's outputs with the "out of band" messages that are emitted by the `Cmd` itself.
 */
export type CmdOutputInfo = {
  type: 'info';
  text: string;
};

export type CmdOutputStdErr = {
  type: 'stderr';
  content: Uint8Array;
};

export type CmdOutputStdOut = {
  type: 'stdout';
  content: Uint8Array;
};

export type CmdOutput = CmdOutputInfo | CmdOutputStdErr | CmdOutputStdOut;
