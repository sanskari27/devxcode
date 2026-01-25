import { SearchBar, Section, SectionItem } from '@components/atoms';
import { FolderCode, GitGraph } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useRepositoriesService } from '../../../hooks/useRepositoriesService';

export const Repositories: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const { repositories, openRepository, openGitHubRepository } =
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

  // Sort repositories by lastOpened (most recent first)
  const sortedRepositories = useMemo(() => {
    return [...filteredRepositories].sort((a, b) => {
      const dateA = new Date(a.lastOpened).getTime();
      const dateB = new Date(b.lastOpened).getTime();
      return dateB - dateA;
    });
  }, [filteredRepositories]);

  const handleOpenGitHub = (path: string) => {
    openGitHubRepository(path);
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
          action={() => handleOpenGitHub(repository.path)}
          actionIcon={GitGraph}
        />
      ))}
    </Section>
  );
};
