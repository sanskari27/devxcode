/**
 * Random color tool
 * Generates random colors (hex / rgb)
 */
const generateRandomColor = (format: 'hex' | 'rgb' = 'hex'): string => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  if (format === 'hex') {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export const transform = (
  input: string,
  format: 'hex' | 'rgb' = 'hex'
): string => {
  return generateRandomColor(format);
};

export const reverse = (input: string): string => {
  // Random color generation is not reversible, generate new one
  return generateRandomColor('hex');
};

export const validate = (input: string): { valid: boolean; error?: string } => {
  return { valid: true };
};
