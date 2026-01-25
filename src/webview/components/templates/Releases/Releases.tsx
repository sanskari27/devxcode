import { Checkbox, Section, SectionItem } from '@components/atoms';
import { Alert } from '@components/molecules';
import { DATE_FORMAT_DD_MM } from '@lib/constants';
import type { ReleaseProgress, ReleaseStatus } from '@services/releases';
import { format } from 'date-fns';
import { Plus, Trash } from 'lucide-react';
import React, { useMemo } from 'react';
import { useReleasesService } from '../../../hooks/useReleasesService';
import { useSettingsService } from '../../../hooks/useSettingsService';

// Default release statuses fallback (used when settings are loading)
const DEFAULT_RELEASE_STATUSES: ReleaseStatus[] = [
  'Handover Completed',
  'Support Stamping',
  'Security Stamping',
];

export const Releases: React.FC = () => {
  const {
    releases,
    createRelease,
    deleteRelease,
    addChangeToRelease,
    updateChangeInRelease,
    getChangeProgress,
    getReleaseProgressSync,
  } = useReleasesService();

  const { releaseStatuses, isLoading: isLoadingSettings } =
    useSettingsService();

  // Use settings if available, otherwise fallback to defaults
  const RELEASE_STATUSES = useMemo(() => {
    if (isLoadingSettings || releaseStatuses.length === 0) {
      return DEFAULT_RELEASE_STATUSES;
    }
    return releaseStatuses;
  }, [releaseStatuses, isLoadingSettings]);

  const handleAddRelease = () => {
    Alert.title('Add New Release')
      .description('Enter release details')
      .addInput('Enter release name', 'name')
      .addInput('Select release date', 'date', 'date')
      .addButton('primary', 'Add', values => {
        if (values.name && values.date) {
          createRelease({
            name: values.name,
            date: values.date,
            changes: [],
          });
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled adding release');
      })
      .show();
  };

  const handleAddChange = (releaseId: string) => {
    Alert.title('Add New Change')
      .description('Enter change details')
      .addInput('Enter repository name', 'repoName')
      .addInput('Enter change description', 'description')
      .addButton('primary', 'Add', async values => {
        if (values.repoName && values.description) {
          addChangeToRelease(releaseId, {
            repoName: values.repoName,
            description: values.description,
            statusChecklist: {},
          });
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled adding change');
      })
      .show();
  };

  const handleDeleteRelease = (releaseId: string) => {
    const release = releases.find(r => r.id === releaseId);
    const releaseName = release?.name || 'this release';

    Alert.title('Delete Release')
      .description(
        `Are you sure you want to delete "${releaseName}"? This action cannot be undone.`
      )
      .addButton('primary', 'Delete', async () => {
        try {
          await deleteRelease(releaseId);
        } catch (error) {
          console.error('Failed to delete release:', error);
        }
      })
      .addButton('secondary', 'Cancel', () => {
        console.log('Cancelled deleting release');
      })
      .show();
  };

  const handleStatusChange = async (
    releaseId: string,
    changeId: string,
    status: ReleaseStatus
  ) => {
    try {
      const release = releases.find(r => r.id === releaseId);
      const change = release?.changes.find(c => c.id === changeId);
      if (!change) return;

      const currentStatus = change.statusChecklist[status] || false;
      await updateChangeInRelease(releaseId, changeId, {
        statusChecklist: {
          [status]: !currentStatus,
        },
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, DATE_FORMAT_DD_MM);
    } catch {
      return dateString;
    }
  };

  // Calculate progress for each release using service method
  const releaseProgressMap = useMemo(() => {
    const progressMap = new Map<string, ReleaseProgress>();
    releases.forEach(release => {
      const progress = getReleaseProgressSync(release);
      progressMap.set(release.id, progress);
    });
    return progressMap;
  }, [releases, getReleaseProgressSync]);

  const changeProgressMap = useMemo(() => {
    const progressMap = new Map<string, { completed: number; total: number }>();
    releases.forEach(release => {
      release.changes.forEach(change => {
        const progress = getChangeProgress(change);
        progressMap.set(change.id, progress);
      });
    });
    return progressMap;
  }, [releases, getChangeProgress]);

  return (
    <Section title="Releases" action={handleAddRelease} actionIcon={Plus}>
      {releases.map(release => {
        const releaseProgress = releaseProgressMap.get(release.id) ?? {
          percentage: 0,
          totalItems: 0,
          completedItems: 0,
        };
        const changesCount = release.changes.length;
        return (
          <Section
            key={release.id}
            title={release.name}
            count={`${releaseProgress.percentage}%`}
            actionIcon={Trash}
            action={() => handleDeleteRelease(release.id)}
          >
            <SectionItem
              name={`${formatDate(release.date)} - ${release.name}`}
            />
            <Section
              title="Changes"
              count={changesCount}
              action={() => handleAddChange(release.id)}
              actionIcon={Plus}
            >
              {release.changes.map((change, index) => {
                const changeProgress = changeProgressMap.get(change.id) ?? {
                  completed: 0,
                  total: 0,
                };
                const changeProgressPercentage = Math.round(
                  (changeProgress.completed / changeProgress.total) * 100
                );
                return (
                  <Section
                    key={change.id}
                    title={`CHANGE - ${index + 1}`}
                    count={`${changeProgressPercentage}%`}
                  >
                    <SectionItem name={change.repoName} />
                    <SectionItem
                      name={change.description}
                      className="line-clamp-2"
                    />
                    <div className="px-2 py-1 space-y-1">
                      {RELEASE_STATUSES.map(status => (
                        <Checkbox
                          key={status}
                          label={status}
                          checked={change.statusChecklist[status]}
                          onClick={() =>
                            handleStatusChange(release.id, change.id, status)
                          }
                        />
                      ))}
                    </div>
                  </Section>
                );
              })}
            </Section>
          </Section>
        );
      })}
    </Section>
  );
};
