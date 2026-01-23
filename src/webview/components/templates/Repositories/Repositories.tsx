import { SearchBar, Section, SectionItem } from '@components/atoms';
import React, { useMemo, useState } from 'react';
import { useRepositoriesService } from '../../../hooks/useRepositoriesService';
import { FolderCode, Pin, PinOff } from 'lucide-react';

export const Repositories: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const { repositories, openRepository, togglePinRepository } =
    useRepositoriesService();

  const filteredRepositories = useMemo(() => {
    return repositories.filter(repository => {
      return (
        repository.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        repository.nickname.toLowerCase().includes(searchValue.toLowerCase()) ||
        repository.path.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  }, [repositories, searchValue]);

  const handleOpenRepository = async (path: string) => {
    try {
      await openRepository(path);
    } catch (error: any) {
      console.error('Failed to open repository:', error);
    }
  };

  // Sort repositories: pinned first, then by lastOpened (most recent first)
  const sortedRepositories = useMemo(() => {
    return [...filteredRepositories].sort((a, b) => {
      // Pinned repositories come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // If both have same pin status, sort by lastOpened
      const dateA = new Date(a.lastOpened).getTime();
      const dateB = new Date(b.lastOpened).getTime();
      return dateB - dateA;
    });
  }, [filteredRepositories]);

  const handleTogglePin = async (path: string) => {
    try {
      await togglePinRepository(path);
    } catch (error: any) {
      console.error('Failed to toggle pin:', error);
    }
  };

  return (
    <Section
      title="Repositories"
      count={filteredRepositories.length}
      defaultExpanded
      contentClassName="ml-2"
    >
      <SearchBar
        placeholder="Search repositories"
        size="sm"
        value={searchValue}
        onValueChange={setSearchValue}
      />
      {sortedRepositories.map(repository => (
        <SectionItem
          key={repository.path}
          name={repository.nickname || repository.name}
          onClick={() => handleOpenRepository(repository.path)}
          icon={FolderCode}
          action={() => handleTogglePin(repository.path)}
          actionIcon={repository.pinned ? Pin : PinOff}
        />
      ))}
    </Section>
  );
};
