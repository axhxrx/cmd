/**
 The `shittyParse` function takes a string and splits it into a command and an array of arguments, attempting to do something like what most shells would do to parse user input on the command line. 
 
 As hopefully conveyed by the name, it's shitty and just exists as a hack to cover the common convenience cases. But that's 100% of our cases.

 @param input The input string to parse.
 @param argsOnly If `true` then `shittyParse` will treat the entire string as the arguments, assuming that the command is not contained in the string. (So like, when you are just trying to parse a string containing maybe-quoted arguments, and you are going to provid them to a command later.)
 */
export function shittyParse(input: string, argsOnly = false): { command: string; args: string[] }
{
  const result: string[] = [];
  let current = '';
  let inQuotes: boolean = false;
  let quoteChar: string | null = null;

  for (let i = 0; i < input.length; i++)
  {
    const char = input[i];

    if (inQuotes)
    {
      if (char === quoteChar)
      {
        // Close the quotes
        inQuotes = false;
        quoteChar = null;
      }
      else
      {
        // Inside quotes, just add char
        current += char;
      }
    }
    else
    {
      if (char === '"' || char === "'")
      {
        // Start quoting
        inQuotes = true;
        quoteChar = char;
      }
      else if (/\s/.test(char))
      {
        // Whitespace outside quotes: split if we have something accumulated
        if (current.length > 0)
        {
          result.push(current);
          current = '';
        }
        // If not, ignore extra whitespace
      }
      else
      {
        current += char;
      }
    }
  }

  // Push the last argument if there is any
  if (current.length > 0)
  {
    result.push(current);
  }

  if (result.length === 0)
  {
    return { command: '', args: [] };
  }

  if (argsOnly)
  {
    return { command: '', args: result };
  }
  else
  {
    const [command, ...args] = result;
    return { command, args };
  }
}
