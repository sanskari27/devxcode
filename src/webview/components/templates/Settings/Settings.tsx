import { Section, SectionItem } from '@components/atoms';
import { Alert } from '@components/molecules';
import type { RepositoryDenormalizationStrategy } from '@services/settings';
import { Plus, Settings as SettingsIcon, Trash } from 'lucide-react';
import React from 'react';
import { useSettingsService } from '../../../hooks/useSettingsService';

export const Settings: React.FC = () => {
  const {
    releaseStatuses,
    updateReleaseStatuses,
    repositoryDenormalization,
    updateRepositoryDenormalization,
  } = useSettingsService();

  const handleAddStatus = () => {
    Alert.title('Add New Release Status')
      .description('Enter the name of the new release status')
      .addInput('Enter status name', 'statusName')
      .addButton('primary', 'Add', async values => {
        if (values.statusName && values.statusName.trim()) {
          const newStatus = values.statusName.trim();
          if (!releaseStatuses.includes(newStatus)) {
            await updateReleaseStatuses([...releaseStatuses, newStatus]);
          }
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled adding status');
      })
      .show();
  };

  const handleDeleteStatus = (status: string) => {
    Alert.title('Delete Release Status')
      .description(
        `Are you sure you want to delete "${status}"? This action cannot be undone.`
      )
      .addButton('primary', 'Delete', async () => {
        try {
          await updateReleaseStatuses(
            releaseStatuses.filter(s => s !== status)
          );
        } catch (error) {
          console.error('Failed to delete status:', error);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled deleting status');
      })
      .show();
  };

  const handleStrategyChange = async (
    strategy: RepositoryDenormalizationStrategy
  ) => {
    await updateRepositoryDenormalization({ strategy });
  };

  const handleCustomRegexChange = async (regex: string) => {
    await updateRepositoryDenormalization({ customRegex: regex });
  };

  const handleAddPattern = () => {
    Alert.title('Add Remove Pattern')
      .description('Enter a pattern to remove (e.g., TSWM, TAPP)')
      .addInput('Enter pattern', 'pattern')
      .addButton('primary', 'Add', async values => {
        if (values.pattern && values.pattern.trim()) {
          const newPattern = values.pattern.trim().toUpperCase();
          if (!repositoryDenormalization.removePatterns.includes(newPattern)) {
            await updateRepositoryDenormalization({
              removePatterns: [
                ...repositoryDenormalization.removePatterns,
                newPattern,
              ],
            });
          }
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled adding pattern');
      })
      .show();
  };

  const handleDeletePattern = (pattern: string) => {
    Alert.title('Delete Remove Pattern')
      .description(
        `Are you sure you want to delete pattern "${pattern}"? This action cannot be undone.`
      )
      .addButton('primary', 'Delete', async () => {
        try {
          await updateRepositoryDenormalization({
            removePatterns: repositoryDenormalization.removePatterns.filter(
              p => p !== pattern
            ),
          });
        } catch (error) {
          console.error('Failed to delete pattern:', error);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled deleting pattern');
      })
      .show();
  };

  const handleAddAcronym = () => {
    Alert.title('Add Remove Acronym')
      .description('Enter an acronym to remove (e.g., WPFH, GPS, FAS)')
      .addInput('Enter acronym', 'acronym')
      .addButton('primary', 'Add', async values => {
        if (values.acronym && values.acronym.trim()) {
          const newAcronym = values.acronym.trim().toUpperCase();
          if (!repositoryDenormalization.removeAcronyms.includes(newAcronym)) {
            await updateRepositoryDenormalization({
              removeAcronyms: [
                ...repositoryDenormalization.removeAcronyms,
                newAcronym,
              ],
            });
          }
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled adding acronym');
      })
      .show();
  };

  const handleDeleteAcronym = (acronym: string) => {
    Alert.title('Delete Remove Acronym')
      .description(
        `Are you sure you want to delete acronym "${acronym}"? This action cannot be undone.`
      )
      .addButton('primary', 'Delete', async () => {
        try {
          await updateRepositoryDenormalization({
            removeAcronyms: repositoryDenormalization.removeAcronyms.filter(
              a => a !== acronym
            ),
          });
        } catch (error) {
          console.error('Failed to delete acronym:', error);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled deleting acronym');
      })
      .show();
  };

  const handleEditCustomRegex = () => {
    Alert.title('Edit Custom Regex')
      .description('Enter a custom regex pattern for character replacement')
      .addInput(
        'Regex pattern',
        'regex',
      )
      .addButton('primary', 'Save', async values => {
        if (values.regex !== undefined) {
          await handleCustomRegexChange(values.regex);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled editing regex');
      })
      .show();
  };

  return (
    <Section title="Settings" actionIcon={SettingsIcon}>
      <Section
        title="Release Statuses"
        count={releaseStatuses.length}
        action={handleAddStatus}
        actionIcon={Plus}
      >
        {releaseStatuses.length === 0 ? (
          <SectionItem name="No release statuses configured" />
        ) : (
          releaseStatuses.map(status => (
            <SectionItem
              key={status}
              name={status}
              action={() => handleDeleteStatus(status)}
              actionIcon={Trash}
            />
          ))
        )}
      </Section>

      <Section title="Repository Name Denormalization">
        <div className="ml-2 space-y-4">
          {/* Strategy Selection */}
          <div className="flex flex-col gap-2">
            <select
              value={repositoryDenormalization.strategy}
              onChange={e =>
                handleStrategyChange(
                  e.target.value as RepositoryDenormalizationStrategy
                )
              }
              className="px-3 py-2 text-sm bg-[var(--vscode-dropdown-background)] text-[var(--vscode-dropdown-foreground)] border border-[var(--vscode-dropdown-border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]"
            >
              <option value="none">None - No denormalization</option>
              <option value="basic">
                Basic - Replace special characters only
              </option>
              <option value="aggressive">
                Aggressive - Full denormalization (default)
              </option>
              <option value="custom">Custom - Use custom configuration</option>
            </select>
            <p className="text-xs text-[var(--vscode-descriptionForeground)]">
              {repositoryDenormalization.strategy === 'none' &&
                'Repository names will be used as-is without any modification.'}
              {repositoryDenormalization.strategy === 'basic' &&
                'Only special characters (-, _, .) will be replaced with spaces.'}
              {repositoryDenormalization.strategy === 'aggressive' &&
                'Full denormalization with pattern and acronym removal.'}
              {repositoryDenormalization.strategy === 'custom' &&
                'Use custom regex, patterns, and acronyms configured below.'}
            </p>
          </div>

          {/* Custom Regex (shown when strategy is 'custom') */}
          {repositoryDenormalization.strategy === 'custom' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--vscode-foreground)]">
                  Custom Regex Pattern
                </label>
                <button
                  onClick={handleEditCustomRegex}
                  className="text-xs text-[var(--vscode-textLink-foreground)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="px-3 py-2 text-sm bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded">
                {repositoryDenormalization.customRegex || '[-_.]'}
              </div>
              <p className="text-xs text-[var(--vscode-descriptionForeground)]">
                Regex pattern used to replace special characters with spaces.
              </p>
            </div>
          )}

          {isCustomOrAggressiveStrategy(repositoryDenormalization.strategy) && (
            <>
              {/* Remove Patterns */}
              <Section
                title="Remove Patterns"
                count={repositoryDenormalization.removePatterns.length}
                action={handleAddPattern}
                actionIcon={Plus}
              >
                {repositoryDenormalization.removePatterns.length === 0 ? (
                  <SectionItem name="No patterns configured" />
                ) : (
                  repositoryDenormalization.removePatterns.map(pattern => (
                    <SectionItem
                      key={pattern}
                      name={pattern}
                      action={() => handleDeletePattern(pattern)}
                      actionIcon={Trash}
                    />
                  ))
                )}
              </Section>

              {/* Remove Acronyms */}
              <Section
                title="Remove Acronyms"
                count={repositoryDenormalization.removeAcronyms.length}
                action={handleAddAcronym}
                actionIcon={Plus}
              >
                {repositoryDenormalization.removeAcronyms.length === 0 ? (
                  <SectionItem name="No acronyms configured" />
                ) : (
                  repositoryDenormalization.removeAcronyms.map(acronym => (
                    <SectionItem
                      key={acronym}
                      name={acronym}
                      action={() => handleDeleteAcronym(acronym)}
                      actionIcon={Trash}
                    />
                  ))
                )}
              </Section>
            </>
          )}
        </div>
      </Section>
    </Section>
  );
};

function isCustomOrAggressiveStrategy(
  strategy: RepositoryDenormalizationStrategy
) {
  return strategy === 'custom' || strategy === 'aggressive';
}
