import { AbstractCmd } from './AbstractCmd.ts';
import type { CmdResult } from './CmdResult.ts';

/**
 Change directory for the current process. This command just calls through to `Deno.chdir`, while maintaining the same results interface as `Cmd`.

 Upon success, it outputs the absolute normalized path of the new working directory to its `stdout`.
 */
export class CmdCd extends AbstractCmd
{
  constructor(readonly directoryPath: string)
  {
    super();
  }

  get description(): string
  {
    return `CHANGE DIRECTORY: ${this.directoryPath}`;
  }

  async run(): Promise<CmdResult>
  {
    const result = this.initResult();

    try
    {
      result.outputs.push({ type: 'info', text: `RUNNING: ${this.description}` });

      const realPath = await Deno.realPath(this.directoryPath);
      Deno.chdir(this.directoryPath);

      result.exitCode = 0;
      this.print('stdout', result, realPath);
      result.success = true;
    }
    catch (error: unknown)
    {
      result.exitCode = 1;
      this.print('stderr', result, `FAILED to CHANGE DIRECTORY: ${error}`);
    }
    return this.finalizeResult(result);
  }
}

export const cd = (directoryPath: string): Promise<CmdResult> =>
{
  const result = new CmdCd(directoryPath);
  return result.run();
};
