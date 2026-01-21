import { Section, SectionItem } from '@components/atoms';
import { Alert } from '@components/molecules';
import { showNotification } from '@src/webview/utils/notifications';
import { GitBranch } from 'lucide-react';
import React from 'react';
import { useGitHubHelpersService } from '../../../hooks/useGitHubHelpersService';

export const GitHubHelpers: React.FC = () => {
  const { helpers, executeHelper, openBackmergeWebview } = useGitHubHelpersService();

  const handleHelperClick = (helperId: string) => {
    const helper = helpers.find(h => h.id === helperId);
    if (!helper) {
      showNotification('Helper not found', 'error');
      return;
    }

    // If helper opens a webview, open it directly
    if (helper.opensWebview) {
      openBackmergeWebview();
      return;
    }

    // If helper requires confirmation, show confirmation dialog first
    if (helper.requiresConfirmation) {
      Alert.title(helper.name)
        .description(
          helper.description +
          '\n\nThis action cannot be undone. Are you sure you want to continue?'
        )
        .addButton('primary', 'Execute', () => {
          // After confirmation, proceed with input or execution
          if (helper.requiresInput) {
            showInputAlert(helper);
          } else {
            executeHelper(helperId);
          }
        })
        .addButton('secondary', 'Cancel', () => {
          console.log('Cancelled helper execution');
        })
        .show();
      return;
    }

    // If helper requires input, show input dialog
    if (helper.requiresInput) {
      showInputAlert(helper);
      return;
    }

    // Otherwise, execute directly
    executeHelper(helperId);
  };

  const showInputAlert = (helper: {
    id: string;
    name: string;
    description: string;
    inputPrompt?: string;
    inputType?: 'number' | 'text';
    inputPlaceholder?: string;
  }) => {
    const prompt = helper.inputPrompt || 'Enter value';
    const placeholder = helper.inputPlaceholder || prompt;

    Alert.title(helper.name)
      .description(helper.description)
      .addInput(placeholder, 'input', helper.inputType || 'text')
      .addButton('primary', 'Execute', async values => {
        const input = values.input?.trim();
        if (!input) {
          showNotification('Input is required', 'error');
          return;
        }

        // Validate number input
        if (helper.inputType === 'number') {
          const num = parseInt(input, 10);
          if (isNaN(num) || num <= 0) {
            showNotification('Input must be a positive number', 'error');
            return;
          }
        }

        try {
          executeHelper(helper.id, input);
        } catch (error: any) {
          showNotification(
            `Failed to execute helper: ${error.message || error}`,
            'error'
          );
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled helper execution');
      })
      .show();
  };

  return (
    <Section title="Git Helpers" contentClassName="mx-2">
      {helpers.map(helper => (
        <SectionItem
          key={helper.id}
          name={helper.name}
          icon={GitBranch}
          onClick={() => handleHelperClick(helper.id)}
        />
      ))}
    </Section>
  );
};
