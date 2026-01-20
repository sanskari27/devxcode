/**
 * URL Encode / Decode tool
 * Encodes text for URL or decodes URL encoded text
 */
export const transform = (input: string, encode: boolean = true): string => {
  try {
    if (encode) {
      return encodeURIComponent(input);
    } else {
      return decodeURIComponent(input);
    }
  } catch (error) {
    throw new Error(
      `URL conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    // Try to decode first
    try {
      return decodeURIComponent(input);
    } catch {
      // If decode fails, encode it
      return encodeURIComponent(input);
    }
  } catch (error) {
    throw new Error(
      `URL conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // URL encoding is always valid
  return { valid: true };
};
