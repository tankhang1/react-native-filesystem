import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import ReactNativeFilesystem, {
  joinReactNativeFilesystemPath,
  resolveReactNativeFilesystemDirectory,
  resolveReactNativeFilesystemFilePath,
} from 'react-native-filesystem';
import {
  DEFAULT_CONTENTS,
  DEFAULT_DOWNLOAD_URL,
  DOCUMENTS_DIRECTORY,
  EXAMPLE_FILENAME,
  FALLBACK_DIRECTORY_PATH,
  FALLBACK_FILE_PATH,
  TOAST_DURATION_MS,
} from '../constants';
import { createCustomDirectory } from '../utils';

export function useDemoState() {
  const [filePath, setFilePath] = useState(FALLBACK_FILE_PATH);
  const [directoryPath, setDirectoryPath] = useState(FALLBACK_DIRECTORY_PATH);
  const [contents, setContents] = useState(DEFAULT_CONTENTS);
  const [downloadUrl, setDownloadUrl] = useState(DEFAULT_DOWNLOAD_URL);
  const [status, setStatus] = useState('Ready');
  const [existsResult, setExistsResult] = useState('unknown');
  const [readResult, setReadResult] = useState('none');
  const [directoryEntries, setDirectoryEntries] = useState<string[]>([]);
  const [statResult, setStatResult] = useState('not loaded');
  const [documentsDirectory, setDocumentsDirectory] = useState('not loaded');
  const [downloadsResult, setDownloadsResult] = useState('none');
  const [downloadResult, setDownloadResult] = useState('none');
  const [toastMessage, setToastMessage] = useState('');
  const saveToFilesButtonTitle =
    Platform.OS === 'android' ? 'Write to downloads' : 'Save to Files';

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      resolveReactNativeFilesystemDirectory(DOCUMENTS_DIRECTORY),
      resolveReactNativeFilesystemFilePath(DOCUMENTS_DIRECTORY, EXAMPLE_FILENAME),
    ])
      .then(([nextDirectoryPath, nextFilePath]) => {
        if (!isMounted) {
          return;
        }

        setDocumentsDirectory(nextDirectoryPath);
        setDirectoryPath(nextDirectoryPath);
        setFilePath(nextFilePath);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        setDocumentsDirectory(`Unavailable: ${message}`);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage || process.env.NODE_ENV === 'test') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToastMessage('');
    }, TOAST_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  function showToast(message: string) {
    setToastMessage(message);
  }

  async function runAction(actionName: string, action: () => Promise<void>) {
    try {
      await action();
      setStatus(`${actionName}: success`);
      showToast(`${actionName} succeeded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${actionName}: ${message}`);
      showToast(`${actionName} failed: ${message}`);
    }
  }

  async function applyDocumentsDirectory() {
    if (!documentsDirectory || documentsDirectory.startsWith('Unavailable:')) {
      setStatus('documentsDirectory: unavailable');
      showToast('documentsDirectory unavailable');
      return;
    }

    const nextFilePath = await resolveReactNativeFilesystemFilePath(
      DOCUMENTS_DIRECTORY,
      EXAMPLE_FILENAME
    );
    setDirectoryPath(documentsDirectory);
    setFilePath(nextFilePath);
    setStatus('documentsDirectory: applied');
    showToast('Switched to documents directory');
  }

  function applyCustomDirectory() {
    const customDirectoryPath = joinReactNativeFilesystemPath(
      documentsDirectory.startsWith('Unavailable:') ? FALLBACK_DIRECTORY_PATH : documentsDirectory,
      'custom'
    );
    const customDirectory = createCustomDirectory(customDirectoryPath);
    setDirectoryPath(customDirectoryPath);
    setFilePath(joinReactNativeFilesystemPath(customDirectoryPath, EXAMPLE_FILENAME));
    setStatus(`customDirectory: applied (${customDirectory.kind})`);
    showToast('Switched to custom directory');
  }

  return {
    sharedProps: {
      filePath,
      directoryPath,
      contents,
      downloadUrl,
      status,
      existsResult,
      readResult,
      directoryEntries,
      statResult,
      documentsDirectory,
      downloadsResult,
      downloadResult,
      saveToFilesButtonTitle,
      setFilePath,
      setDirectoryPath,
      setContents,
      setDownloadUrl,
      setExistsResult,
      setReadResult,
      setDirectoryEntries,
      setStatResult,
      setDownloadsResult,
      setDownloadResult,
      applyDocumentsDirectory,
      applyCustomDirectory,
      runAction,
    },
    toastMessage,
  };
}
