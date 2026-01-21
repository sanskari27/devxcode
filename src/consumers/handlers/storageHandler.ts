import { StorageService } from '../../services/storage';

export function handleStorageMessage(
  message: Record<string, unknown>,
  storage: StorageService,
  postMessage: (message: unknown) => void
) {
  switch (message.command) {
    case 'getStorage':
      storage.getValue(message.key as string).then(value => {
        postMessage({
          command: 'storageValue',
          key: message.key,
          value: value,
        });
      });

      return;
    case 'setStorage':
      storage
        .setValue(message.key as string, message.value as unknown)
        .then(() => {
          postMessage({
            command: 'storageUpdated',
            key: message.key,
          });
        });
      return;
  }
}
