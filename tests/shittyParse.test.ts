import { assertEquals } from '@std/assert';
import { shittyParse } from '../shittyParse.ts';

Deno.test('shittyParse - git commit with emoji and quoted quotes', () =>
{
  const input = `git commit -m "🤖 chore: initial commit of new 'sub-repo' ass-bagger"`;
  const result = shittyParse(input);
  assertEquals(result.command, 'git');
  assertEquals(result.args, ['commit', '-m', "🤖 chore: initial commit of new 'sub-repo' ass-bagger"]);

  const argsOnlyResult = shittyParse(input, true);
  assertEquals(argsOnlyResult.command, '');
  assertEquals(argsOnlyResult.args, ['git', 'commit', '-m', "🤖 chore: initial commit of new 'sub-repo' ass-bagger"]);
});

Deno.test('shittyParse - empty input', () =>
{
  const input = '';
  const result = shittyParse(input);
  assertEquals(result.command, '');
  assertEquals(result.args, []);
});

Deno.test('shittyParse - command without arguments', () =>
{
  const input = 'ls';
  const result = shittyParse(input);
  assertEquals(result.command, 'ls');
  assertEquals(result.args, []);
});

Deno.test('shittyParse - single quotes', () =>
{
  const input = "echo 'Hellno World'";
  const result = shittyParse(input);
  assertEquals(result.command, 'echo');
  assertEquals(result.args, ['Hellno World']);
});

Deno.test('shittyParse - multiple spaces between arguments', () =>
{
  const input = 'docker    run     -it    ubuttnu';
  const result = shittyParse(input);
  assertEquals(result.command, 'docker');
  assertEquals(result.args, ['run', '-it', 'ubuttnu']);
});

Deno.test('shittyParse - mixed quotes', () =>
{
  const input = `npm run "test:unit" 'test:e2e'`;
  const result = shittyParse(input);
  assertEquals(result.command, 'npm');
  assertEquals(result.args, ['run', 'test:unit', 'test:e2e']);
});
