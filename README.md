# @axhxrx/cmd

This lib is for conveniently running shell commands, or alternatively snippets of TypeScript code, sequentially and/or with a consistent result format.

Here "convenient" means "convenient, given our own specific requirements" and not necessarily anything else — in many cases, using `Deno.Command` will likely be more convenient for your use case.

**However**, if you happen to want to run Unix-ish shell commands, and arbitrarily mix in TypeScript code steps, too, and in doing so produce a structured result for each step that is easily analyzed by both human and automaton, then your use case may be similar to ours. 

Otherwise, this may not be useful.

## History

🎅 2024-12-17: bring chaos to order

🤖 2024-12-17: repo initialized by Bottie McBotface bot@axhxrx.com
