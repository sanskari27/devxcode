/**
 * Date format constant for date-fns
 * Format: DD/MM/YY (e.g., 25/12/24)
 */
export const DATE_FORMAT_DD_MM = 'dd/MM';

/**
 * Storage keys for VS Code extension storage
 */
export const STORAGE_KEYS = {
  RELEASES: 'devxcode.releases',
  TODOS: 'devxcode.todos',
  REPOSITORIES: 'devxcode.repositories',
} as const;

/**
 * Regex pattern for denormalizing repository names
 * Removes special characters like -, _, . to generate clean nicknames
 */
export const REPOSITORY_NAME_DENORMALIZE_REGEX = /[-_.]/g;
