import type { Release } from '../services/releases';

/**
 * Mock releases data for testing and development
 */
export const mockReleases: Release[] = [
  {
    id: 'release-1',
    name: 'Release 1.0.0',
    date: '2024-12-15T10:00:00Z',
    changes: [
      {
        id: 'change-1-1',
        repoName: 'frontend-app',
        description:
          'Added new user authentication flow with OAuth2 integration and improved security measures',
        statusChecklist: {
          'Handover Completed': true,
          'Support Stamping': true,
          'Security Stamping': false,
        },
      },
      {
        id: 'change-1-2',
        repoName: 'backend-api',
        description:
          'Implemented new REST API endpoints for user management and profile updates',
        statusChecklist: {
          'Handover Completed': true,
          'Support Stamping': false,
          'Security Stamping': true,
        },
      },
      {
        id: 'change-1-3',
        repoName: 'mobile-app',
        description:
          'Fixed critical bug in payment processing and added new payment methods support',
        statusChecklist: {
          'Handover Completed': false,
          'Support Stamping': true,
          'Security Stamping': true,
        },
      },
    ],
  },
  {
    id: 'release-2',
    name: 'Release 1.1.0',
    date: '2024-12-20T14:30:00Z',
    changes: [
      {
        id: 'change-2-1',
        repoName: 'analytics-service',
        description:
          'Enhanced analytics dashboard with real-time data visualization and custom report generation',
        statusChecklist: {
          'Handover Completed': true,
          'Support Stamping': true,
          'Security Stamping': false,
        },
      },
      {
        id: 'change-2-2',
        repoName: 'notification-service',
        description:
          'Added push notification support for mobile devices and email notification templates',
        statusChecklist: {
          'Handover Completed': false,
          'Support Stamping': true,
          'Security Stamping': true,
        },
      },
      {
        id: 'change-2-3',
        repoName: 'database-migration',
        description:
          'Performed database schema migration to support new features and improved performance optimization',
        statusChecklist: {
          'Handover Completed': true,
          'Support Stamping': false,
          'Security Stamping': true,
        },
      },
      {
        id: 'change-2-4',
        repoName: 'api-gateway',
        description:
          'Updated API gateway configuration with new routing rules and rate limiting policies',
        statusChecklist: {
          'Handover Completed': true,
          'Support Stamping': true,
          'Security Stamping': false,
        },
      },
    ],
  },
];
