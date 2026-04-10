import { ReactNativeFilesystemDirectoryKind, type ReactNativeFilesystemDirectoryDescriptor } from 'react-native-simple-fs';

export const FALLBACK_FILE_PATH = '/tmp/react-native-filesystem/example.txt';
export const FALLBACK_DIRECTORY_PATH = '/tmp/react-native-filesystem';
export const DEFAULT_CONTENTS = 'Hello from React Native Filesystem';
export const EXAMPLE_FILENAME = 'example.txt';
export const DEFAULT_DOWNLOAD_URL = 'https://www.w3.org/TR/PNG/iso_8859-1.txt';
export const TOAST_DURATION_MS = 2400;

export const DOCUMENTS_DIRECTORY: ReactNativeFilesystemDirectoryDescriptor = {
  kind: ReactNativeFilesystemDirectoryKind.Documents,
};
