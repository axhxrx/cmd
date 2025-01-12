import { assertEquals } from '@std/assert';
import { shittySplit } from '../shittySplit.ts';

Deno.test('shittySplit - basic multiline with continuations', () =>
{
  const input = `
    ls -la \\
      ~/foo \\
      ~/bar
    echo "hello world"
    cp -R src dest
  `;
  const result = shittySplit(input);
  assertEquals(result, [
    'ls -la ~/foo ~/bar',
    'echo "hello world"',
    'cp -R src dest',
  ]);
});

Deno.test('shittySplit - empty lines and whitespace', () =>
{
  const input = `

    command1

    command2  
    
    command3
  `;
  const result = shittySplit(input);
  assertEquals(result, [
    'command1',
    'command2',
    'command3',
  ]);
});

Deno.test('shittySplit - complex command with && and quotes', () =>
{
  const input = `
    cp -R \\
      foo \\
      bar && rm -rf \\
      foo
    echo "This is a \\"quoted\\" string"
  `;
  const result = shittySplit(input);
  assertEquals(result, [
    'cp -R foo bar && rm -rf foo',
    'echo "This is a \\"quoted\\" string"',
  ]);
});
