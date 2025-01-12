export * from './AbstractCmd.ts';
export * from './Cmd.ts';
export * from './CmdDefaults.ts';
export * from './CmdDesc.ts';
export * from './CmdOpts.ts';
export * from './CmdOutput.ts';
export * from './CmdResult.ts';
export * from './CmdSeq.ts';
export * from './runCmd.ts';

export * from './cd.ts';
export * from './readTextFile.ts';
export * from './say.ts';
export * from './writeTextFile.ts';

if (import.meta.main)
{
  console.log('Hello, this is @axhxrx/cmd');
}
