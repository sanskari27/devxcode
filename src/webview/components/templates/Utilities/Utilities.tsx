import { Section, SectionItem } from '@components/atoms';
import { TOOL_ICONS } from '@services/utilities';
import React from 'react';
import { useUtilitiesService } from '../../../hooks/useUtilitiesService';

export const Utilities: React.FC = () => {
  const { toolGroups, openToolEditor } = useUtilitiesService();

  const handleToolClick = (toolId: string) => {
    openToolEditor(toolId);
  };

  return (
    <Section title="Utilities" contentClassName="mx-2">
      {toolGroups.map(group => {
        return (
          <Section
            key={group.id}
            title={group.name}
            contentClassName="mx-2"
            defaultExpanded={false}
          >
            {group.tools.map(tool => {
              const ToolIcon = TOOL_ICONS[tool.icon] || TOOL_ICONS.code;

              return (
                <SectionItem
                  key={tool.id}
                  name={tool.name}
                  icon={ToolIcon}
                  onClick={() => handleToolClick(tool.id)}
                />
              );
            })}
          </Section>
        );
      })}
    </Section>
  );
};
