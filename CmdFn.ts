import type { CmdResult } from './CmdResult.ts';

/**
 The `CmdFn` class helps define a chunk of code that can be intermixed with `Cmd` commands. It lets us plug bits of custom TypeScript behavior into sequences of commands that are mainly shell commands, and use them in the same way, and get the same structured output.
 */
export abstract class CmdFn
{
  stdout = '';
  stderr = '';
  exitCode = -1;
  start?: Date;
  end?: Date;

  get success(): boolean
  {
    return this.exitCode === 0;
  }

  get result(): CmdResult
  {
    return {
      description: this.name,
      stdout: this.stdout,
      stderr: this.stderr,
      success: this.success,
      exitCode: this.exitCode,
      start: this.start ?? new Date(0),
      end: this.end ?? new Date(0),
    };
  }

  async run(): Promise<void>
  {
    this.start = new Date();
    await this._run();
    this.end = new Date();
  }

  protected abstract _run(): void | Promise<void>;

  abstract get name(): string;

  toString(): string
  {
    return this.name;
  }
}
