export function shittySplit(input: string): string[]
{
  const rawLines = input.split('\n');
  const result: string[] = [];
  let currentLine = '';

  for (const line of rawLines)
  {
    const trimmedLine = line.trim();
    if (!trimmedLine)
    {
      if (currentLine)
      {
        result.push(currentLine.trim().replace(/\s+/g, ' '));
        currentLine = '';
      }
      continue;
    }

    if (trimmedLine.endsWith('\\'))
    {
      currentLine += trimmedLine.slice(0, -1).trim() + ' ';
    }
    else
    {
      currentLine += trimmedLine;
      result.push(currentLine.trim().replace(/\s+/g, ' '));
      currentLine = '';
    }
  }

  if (currentLine)
  {
    result.push(currentLine.trim().replace(/\s+/g, ' '));
  }

  return result.filter(Boolean);
}
