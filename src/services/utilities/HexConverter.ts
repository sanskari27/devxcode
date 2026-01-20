/**
 * Hex Encode / Decode tool
 * Encodes text to hexadecimal or decodes hexadecimal to text
 */
export const transform = (input: string, encode: boolean = true): string => {
  try {
    if (encode) {
      return Array.from(input)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    } else {
      // Remove spaces and validate hex
      const cleaned = input.replace(/\s+/g, '');
      if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
        throw new Error('Invalid hexadecimal string');
      }
      return (
        cleaned
          .match(/.{1,2}/g)
          ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
          .join('') || ''
      );
    }
  } catch (error) {
    throw new Error(
      `Hex conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    // Try to decode first
    const cleaned = input.replace(/\s+/g, '');
    if (/^[0-9a-fA-F]+$/.test(cleaned) && cleaned.length % 2 === 0) {
      return transform(input, false);
    } else {
      // If not valid hex, encode it
      return transform(input, true);
    }
  } catch (error) {
    throw new Error(
      `Hex conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // Hex validation
  const cleaned = input.replace(/\s+/g, '');
  if (/^[0-9a-fA-F]+$/.test(cleaned)) {
    return { valid: true };
  }
  // Might be plain text to encode
  return { valid: true };
};
