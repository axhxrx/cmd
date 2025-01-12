import { assert, assertEquals } from '@std/assert';
import { join } from '@std/path';
import { cd } from '../cd.ts';
import { CmdDefaults } from '../CmdDefaults.ts';

CmdDefaults.quiet = true;

const path1 = import.meta.resolve('./test-fixtures').substring(7);

Deno.test('cd(): changing directory should work', async () =>
{
  const cwd1 = Deno.cwd();
  // console.log(cwd1);

  const result0 = await cd(path1);
  // console.log(result0);
  assert(result0.success);
  assertEquals(result0.stdout, path1);

  const result1 = await cd('subdirectory');
  // console.log(result1);
  const expected = join(path1, 'subdirectory');

  assert(result1.success);
  assertEquals(result1.stdout, expected);
  assertEquals(Deno.cwd(), expected);

  const result2 = await cd('sub sub directory with spaces in name');
  // console.log(result2);
  const expected2 = join(path1, 'subdirectory', 'sub sub directory with spaces in name');

  assert(result2.success);
  assertEquals(result2.stdout, expected2);
  assertEquals(Deno.cwd(), expected2);

  await cd(cwd1);
});
