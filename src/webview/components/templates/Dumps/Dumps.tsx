import { Section, SectionItem } from '@components/atoms';
import { Alert } from '@components/molecules';
import { Brain, Plus, Trash } from 'lucide-react';
import React from 'react';
import { useDumpsService } from '../../../hooks/useDumpsService';

export const Dumps: React.FC = () => {
  const { dumps, createDump, deleteDump, openDumpEditor } = useDumpsService();

  const handleAddDump = () => {
    createDump({ content: '' });
  };

  const handleDeleteDump = (dumpId: string) => {
    Alert.title('Delete Dump')
      .description(
        `Are you sure you want to delete this dump? This action cannot be undone.`
      )
      .addButton('primary', 'Delete', async () => {
        try {
          await deleteDump(dumpId);
        } catch (error) {
          console.error('Failed to delete dump:', error);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled deleting dump');
      })
      .show();
  };

  const handleDumpClick = (dumpId: string) => {
    openDumpEditor(dumpId);
  };

  return (
    <Section
      title="Dumps"
      action={handleAddDump}
      actionIcon={Plus}
      contentClassName="ml-2"
    >
      {dumps.map(dump => {
        const dumpPreview = dump.content
          ? dump.content.substring(0, 100) +
          (dump.content.length > 100 ? '...' : '')
          : `New dump (${dump.id})`;
        return (
          <SectionItem
            key={dump.id}
            name={dumpPreview}
            onClick={() => handleDumpClick(dump.id)}
            className="line-clamp-2"
            icon={Brain}
            actionIcon={Trash}
            action={() => handleDeleteDump(dump.id)}
          />
        );
      })}
    </Section>
  );
};
