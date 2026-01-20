/**
 * Base64 Encode / Decode tool
 * Encodes text to Base64 or decodes Base64 to text
 */
export const transform = (input: string, encode: boolean = true): string => {
  try {
    if (encode) {
      return btoa(unescape(encodeURIComponent(input)));
    } else {
      return decodeURIComponent(escape(atob(input)));
    }
  } catch (error) {
    throw new Error(
      `Base64 conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const reverse = (input: string): string => {
  try {
    // Try to decode first
    try {
      return decodeURIComponent(escape(atob(input)));
    } catch {
      // If decode fails, encode it
      return btoa(unescape(encodeURIComponent(input)));
    }
  } catch (error) {
    throw new Error(
      `Base64 conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  // Base64 validation is complex, so we'll just try to decode
  try {
    atob(input);
    return { valid: true };
  } catch {
    // Not valid base64, but might be plain text to encode
    return { valid: true };
  }
};
