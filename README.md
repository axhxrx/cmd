# @axhxrx/cmd

_a convenience library for running shell commands, and possibly interleaving them with TypeScript code_

This lib is for conveniently running (Unix-ish) shell commands, or alternatively snippets of TypeScript code, optionally with sudo, and with a consistent result format.

In most cases, using `Deno.Command` directly is the more appropriate choice.

But, if you happen to want to run Unix-ish shell commands, and perhaps arbitrarily mix in TypeScript code steps, too, and also wanta structured result output for each step — one that is easily analyzed by both humans and automatons – then your use case may align with the purpose of this library.

Otherwise, this may not be useful.

## Examples

### Deno REPL

```text
➜  cmd git:(main) ✗ deno
Deno 2.1.5
exit using ctrl+d, ctrl+c, or close()
REPL is running with all permissions allowed.
To specify permissions, run `deno repl` with allow flags.
> import { Cmd } from './mod.ts';
undefined
```

Run a shell command (`ping` in this example). Note that by default, running a command prints a banner, and then all stdout and stderr output from the underlying command will also be printed. (It's configurable.)

```text
> const res = await Cmd.run('ping -c 1 axhxrx.net')


🚀  ping -c 1 axhxrx.net

PING axhxrx.net (104.21.51.157): 56 data bytes
64 bytes from 104.21.51.157: icmp_seq=0 ttl=54 time=1.441 ms

--- axhxrx.net ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 1.441/1.441/1.441/0.000 ms
undefined
```

Inspect the result:

```text
> res
{
  args: [ "-c", "1", "axhxrx.net" ],
  parsedCommand: "ping",
  parsedArgs: [ "-c", "1", "axhxrx.net" ],
  sudoMode: "none",
  cwd: "/Volumes/CODE/@axhxrx/cmd",
  quiet: false,
  description: "ping -c 1 axhxrx.net",
  outputs: [ /* removed for brevity */],
  stdout: "PING axhxrx.net (104.21.51.157): 56 data bytes\n" +
    "64 bytes from 104.21.51.157: icmp_seq=0 ttl=54 time=1.441 ms\n" +
    "\n" +
    "--- axhxrx.net ping statistics ---\n" +
    "1 packets transmitted, 1 packets received, 0.0% packet loss\n" +
    "round-trip min/avg/max/stddev = 1.441/1.441/1.441/0.000 ms\n",
  stderr: "",
  success: true,
  exitCode: 0,
  error: undefined,
  results: [],
  start: 2025-01-11T10:32:45.100Z,
  end: 2025-01-11T10:32:45.123Z
}
>
```

### In code

```ts
import { Cmd } from "@axhxrx/cmd";

const tankStatus = await Cmd.run("zpool status tank");

if (!tankStatus.success) {
  sendAlert(`ZFS subsystem not working!`);
} else if (!tankStatus.stdout.includes("state: ONLINE")) {
  sendAlert(`ZFS pool is not in ONLINE state!`);
}
```

With `sudo`:

```ts
import { Cmd, CmdDesc } from "@axhxrx/cmd";

/**
 Create symlink to something in /usr/local/bin — uses `sudo` in interactive mode so user will be prompted for password if needed.
 */
async function symlinkToUsrLocalBin(pathToExecutable: string) {
  const cmd: CmdDesc = {
    cmd: "ln",
    sudoMode: "interactive",
    args: ["-s", pathToExecutable],
    cwd: "/usr/local/bin",
  };
  const res = await Cmd.run(cmd);
  return res;
}
```

## History

👹 2025-03-29: release 0.1.5 — a series of snafubes

👹 2025-03-29: release 0.1.2 — initial public release

🎅 2024-12-17: bring chaos to order

🤖 2024-12-17: repo initialized by Bottie McBotface bot@axhxrx.com
