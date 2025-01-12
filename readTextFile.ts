import { AbstractCmd } from './AbstractCmd.ts';

/**
 Reads UTF-8 text from a file.
 */
export class CmdReadTextFile extends AbstractCmd
{
  constructor(public filePath: string)
  {
    super();
    this.args = [filePath];
  }

  get description()
  {
    return `CmdReadTextFile: ${this.filePath}`;
  }

  async run()
  {
    const result = this.initResult();
    result.outputs.push({ type: 'info', text: `RUNNING: ${this.description}` });

    try
    {
      const text = await Deno.readTextFile(this.filePath);

      const realPath = await Deno.realPath(this.filePath);
      result.parsedArgs = [realPath];

      this.print('stdout', result, text);

      result.outputs.push({ type: 'info', text: `SUCCEEDED: ${this.description}` });
      result.exitCode = 0;
      result.success = true;
    }
    catch (error: unknown)
    {
      result.exitCode = 1;
      result.error = error instanceof Error ? error : new Error('Unknown error');
      result.outputs.push({ type: 'info', text: `FAILED: ${this.description}` });
      const output = `Error reading from ${this.filePath}: ${result.error.message}`;
      this.print('stderr', result, output);
    }
    return this.finalizeResult(result);
  }
}

/**
 Reads UTF-8 text from a file. Returns a `CmdResult` object that indicates success or failure.
 */
export const readTextFile = (filePath: string) =>
{
  const result = new CmdReadTextFile(filePath);
  return result.run();
};
