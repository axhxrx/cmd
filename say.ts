import { Cmd } from './Cmd.ts';

/**
 A wrapper for the `say` command on macOS.
 */
export const say = (args: string) =>
{
  const result = new Cmd({ cmd: 'say', args });
  return result.run();
};
