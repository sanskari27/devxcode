/**
 * NanoID generator tool
 * Generates NanoID
 */
const generateNanoId = (size: number = 21): string => {
  const alphabet =
    'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
};

export const transform = (input: string, size: number = 21): string => {
  const parsedSize = parseInt(input, 10);
  const actualSize = !isNaN(parsedSize) && parsedSize > 0 ? parsedSize : size;
  return generateNanoId(actualSize);
};

export const reverse = (input: string): string => {
  // NanoID generation is not reversible, generate new one
  return generateNanoId();
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
