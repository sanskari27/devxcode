import { AlertBuilder } from './AlertBuilder';

// Export the builder as Alert for the static API
export const Alert = AlertBuilder;

// Also export types for external use
export type { AlertInput, AlertButton, InputType } from './AlertBuilder';
export type { AlertComponentProps } from './Alert';
