import { Cmd } from './Cmd.ts';
import type { CmdResult } from './CmdResult.ts';

/**
 A wrapper for the `say` command on macOS.
 */
export const say = (args: string): Promise<CmdResult> =>
{
  const result = new Cmd({ cmd: 'say', args });
  return result.run();
};
