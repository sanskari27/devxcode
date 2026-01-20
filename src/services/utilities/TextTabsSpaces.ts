/**
 * Convert tabs ↔ spaces tool
 * Converts between tabs and spaces
 */
export const transform = (
  input: string,
  toSpaces: boolean = true,
  spacesPerTab: number = 2
): string => {
  if (toSpaces) {
    return input.replace(/\t/g, ' '.repeat(spacesPerTab));
  } else {
    return input.replace(new RegExp(' '.repeat(spacesPerTab), 'g'), '\t');
  }
};

export const reverse = (input: string): string => {
  // Detect if input has tabs or spaces
  const hasTabs = input.includes('\t');
  if (hasTabs) {
    // Convert tabs to spaces
    return input.replace(/\t/g, '  ');
  } else {
    // Try to convert spaces to tabs (assuming 2 spaces per tab)
    return input.replace(/ {2}/g, '\t');
  }
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
