import { ReactNativeFilesystemDirectoryKind, type ReactNativeFilesystemDirectoryDescriptor } from 'react-native-filesystem';
import type { DemoMode } from './types';

export function createCustomDirectory(path: string): ReactNativeFilesystemDirectoryDescriptor {
  return {
    kind: ReactNativeFilesystemDirectoryKind.Custom,
    path,
  };
}

export function getStatusTone(status: string) {
  if (status.includes(': success')) {
    return {
      backgroundColor: '#e3f7ec',
      borderColor: '#8fd3ab',
      textColor: '#155b3a',
      label: 'Healthy',
    };
  }

  if (status === 'Ready') {
    return {
      backgroundColor: '#fff7dd',
      borderColor: '#f0d27a',
      textColor: '#7a5610',
      label: 'Idle',
    };
  }

  return {
    backgroundColor: '#ffe8e2',
    borderColor: '#efb0a2',
    textColor: '#8b2f1f',
    label: 'Needs attention',
  };
}

export function createSnippet(filePath: string, downloadUrl: string) {
  return [
    "import ReactNativeFilesystem from 'react-native-filesystem';",
    '',
    'await ReactNativeFilesystem.downloadFile(',
    `  '${downloadUrl}',`,
    `  '${filePath}',`,
    ');',
  ].join('\n');
}

export function getModeMeta(mode: DemoMode) {
  switch (mode) {
    case 'workspace':
      return {
        title: 'Workspace Setup',
        description: 'Choose the folder and path you want to experiment with.',
      };
    case 'editor':
      return {
        title: 'Editor',
        description: 'Edit paths, contents, and live code snippets.',
      };
    case 'file':
      return {
        title: 'File Actions',
        description: 'Test read, write, exists, and delete in one place.',
      };
    case 'directory':
      return {
        title: 'Directory',
        description: 'Create directories and inspect folder contents.',
      };
    case 'remote':
      return {
        title: 'HTTPS Download',
        description: 'Paste a link and demo the download and export flow quickly.',
      };
    case 'results':
      return {
        title: 'Results',
        description: 'Review the latest native responses and payloads.',
      };
    case 'preview':
      return {
        title: 'Preview',
        description: 'Show the bundled native view API in the same demo app.',
      };
    default:
      return {
        title: 'Demo Lab',
        description: 'A full tour of every filesystem feature in one polished screen.',
      };
  }
}
