import { AbstractCmd } from './AbstractCmd.ts';
import type { CmdDesc } from './CmdDesc.ts';
import type { CmdResult } from './CmdResult.ts';
import { run } from './runCmd.ts';

export type AbstractCmdOptions = {
  commands: Array<string | CmdDesc | CmdSeq>;
  description?: string;
};

/**
 A sequence of commands, which will be executed in order, and maintains the same interface and results format as `Cmd`.
 */
export class CmdSeq extends AbstractCmd implements Required<CmdDesc>
{
  private readonly _commands: Array<string | CmdDesc>;

  _description: string;

  get description(): string
  {
    return this._description ?? 'SEQUENCE';
  }

  constructor(options: AbstractCmdOptions)
  {
    super();
    this._commands = [...options.commands];
    this._description = options.description ?? 'SEQUENCE';
  }

  /**
   The notable difference between this `CmdSeq' class's `run()` method and the `Cmd` class's `run()` method is that `CmdSeq` will populate the `results` property of the returned `CmdResult` object with the results of each command in sequence. E.g.:

   ```ts
   const sequence = new CmdSeq({
     commands: ['echo uno', 'echo dos', 'echo tres'],
   });

   const result = await sequence.run();
   console.log(result);
   console.log(result.results);
   // result.results[0].stdout === 'uno\n'
   // result.results[1].stdout === 'dos\n'
   // result.results[2].stdout === 'tres\n'
   ```
   */
  async run(): Promise<CmdResult>
  {
    const result = this.initResult();

    result.outputs.push({ type: 'info', text: `RUNNING: ${this.description}` });

    for (const command of this._commands)
    {
      // This looks dumb but avoids TS gets confused and throws error:
      const res = typeof command === 'string'
        ? await run(command)
        : await run(command);

      result.results.push(res);

      result.outputs.push(...res.outputs);
      result.stderr += res.stderr;
      result.stdout += res.stdout;

      if (!res.success)
      {
        break;
      }
    }

    result.end = new Date();
    result.success = result.results.every((result) => result.success);
    result.exitCode = result.success ? 0 : 1;

    return this.finalizeResult(result);
  }
}
