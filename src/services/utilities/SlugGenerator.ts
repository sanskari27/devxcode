/**
 * Slug generator tool
 * Generates URL-friendly slugs from text
 */
export const transform = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const reverse = (input: string): string => {
  // Slug generation is not reversible, return original
  return input;
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
