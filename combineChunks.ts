/**
 Returns a new  Uint8Array that is the concatenation of all the input Uint8Arrays.

 @throws {Error} If the memory allocation fails, etc.
 */
export function combineChunks(chunks: Uint8Array[]): Uint8Array
{
  if (chunks.length === 0)
  {
    return new Uint8Array(0);
  }
  if (chunks.length === 1)
  {
    return chunks[0];
  }
  const totalLength = chunks.reduce((len, chunk) => len + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks)
  {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  return combined;
}
