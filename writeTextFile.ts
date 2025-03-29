import { AbstractCmd } from './AbstractCmd.ts';
import { CmdResult } from './CmdResult.ts';

/**
 Writes UTF-8 text to a file.
 */
export class CmdWriteTextFile extends AbstractCmd
{
  constructor(public filePath: string, public text: string)
  {
    super();
    this.args = [filePath];
  }

  get description(): string
  {
    return `CmdWriteTextFile: ${this.filePath}`;
  }

  async run(): Promise<CmdResult>
  {
    const result = this.initResult();
    result.outputs.push({ type: 'info', text: `RUNNING: ${this.description}` });

    try
    {
      await Deno.writeTextFile(this.filePath, this.text);

      const realPath = await Deno.realPath(this.filePath);
      result.parsedArgs = [realPath];

      result.outputs.push({ type: 'info', text: `SUCCEEDED: ${this.description}` });

      const output = `Wrote ${this.text.length} characters to ${realPath}`;
      this.print('stdout', result, output);

      result.exitCode = 0;
      result.success = true;
    }
    catch (error: unknown)
    {
      result.exitCode = 1;
      result.error = error instanceof Error ? error : new Error('Unknown error');
      result.outputs.push({ type: 'info', text: `FAILED: ${this.description}` });
      const output = `Error writing to ${this.filePath}: ${result.error.message}`;
      this.print('stderr', result, output);
    }
    return this.finalizeResult(result);
  }
}

/**
 Writes UTF-8 text to a file. Returns a `CmdResult` object that indicates success or failure.
 */
export const writeTextFile = (filePath: string, text: string): Promise<CmdResult> =>
{
  const result = new CmdWriteTextFile(filePath, text);
  return result.run();
};
