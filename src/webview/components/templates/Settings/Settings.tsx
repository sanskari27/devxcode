import { Section, SectionItem } from '@components/atoms';
import { Alert } from '@components/molecules';
import { Settings as SettingsIcon, Plus, Trash } from 'lucide-react';
import React from 'react';
import { useSettingsService } from '../../../hooks/useSettingsService';

export const Settings: React.FC = () => {
  const { releaseStatuses, updateReleaseStatuses } = useSettingsService();

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
    </Section>
  );
};
