import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID using timestamp and random string
 * Format: {timestamp}-{randomStr}
 */
export function generateId(prefix: string = ''): string {
  const _prefix = prefix ? `${prefix}-` : '';
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${_prefix}${randomStr}`;
}
