import type { CmdDesc } from './CmdDesc.ts';

/**
 The options for running a command via {@link Cmd} — the same as `CmdDesc` but without the `cmd` field or the `args` field.
 */
export type CmdOpts = Omit<CmdDesc, 'cmd' | 'args'>;

// @masonmark 2024-12-26 in a ✈️: It seems a little weird to make related types by subtraction instead of addition, but actually... 🤔 why not? I usually do it the other way but maybe I've been mistaken all my life...
