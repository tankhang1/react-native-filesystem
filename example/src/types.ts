export type DemoMode =
  | 'overview'
  | 'workspace'
  | 'editor'
  | 'file'
  | 'directory'
  | 'remote'
  | 'results'
  | 'preview';

export type DemoSharedProps = {
  filePath: string;
  directoryPath: string;
  contents: string;
  downloadUrl: string;
  status: string;
  existsResult: string;
  readResult: string;
  directoryEntries: string[];
  statResult: string;
  documentsDirectory: string;
  downloadsResult: string;
  downloadResult: string;
  downloadProgress: string;
  saveToFilesButtonTitle: string;
  setFilePath: (value: string) => void;
  setDirectoryPath: (value: string) => void;
  setContents: (value: string) => void;
  setDownloadUrl: (value: string) => void;
  setExistsResult: (value: string) => void;
  setReadResult: (value: string) => void;
  setDirectoryEntries: (value: string[]) => void;
  setStatResult: (value: string) => void;
  setDownloadsResult: (value: string) => void;
  setDownloadResult: (value: string) => void;
  setDownloadProgress: (value: string) => void;
  applyDocumentsDirectory: () => Promise<void>;
  applyCustomDirectory: () => void;
  runAction: (actionName: string, action: () => Promise<void>) => Promise<void>;
};

export type DemoScreenProps = DemoSharedProps & {
  mode: DemoMode;
};
