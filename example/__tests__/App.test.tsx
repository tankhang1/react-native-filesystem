import { jest } from '@jest/globals';
import React from 'react';
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockNativeModule: any = {
  getDocumentsDirectory: (jest.fn() as any).mockResolvedValue('/data/user/0/example/files'),
  exists: (jest.fn() as any).mockResolvedValue(true),
  readFile: (jest.fn() as any).mockResolvedValue('file contents from native'),
  writeFile: (jest.fn() as any).mockResolvedValue(undefined),
  writeFileToDownloads: (jest.fn() as any).mockResolvedValue(
    'content://downloads/public_downloads/1',
  ),
  deleteFile: (jest.fn() as any).mockResolvedValue(undefined),
  mkdir: (jest.fn() as any).mockResolvedValue(undefined),
  readdir: (jest.fn() as any).mockResolvedValue(['alpha.txt', 'beta.txt']),
  stat: (jest.fn() as any).mockResolvedValue({
    path: '/tmp/demo.txt',
    exists: true,
    isFile: true,
    isDirectory: false,
    size: 24,
    modificationTime: 1700000000,
  }),
  move: (jest.fn() as any).mockResolvedValue(undefined),
  copy: (jest.fn() as any).mockResolvedValue(undefined),
};

jest.mock('react-native', () => {
  const React = require('react');

  const createComponent = (name: string) => {
    return ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(name, props, children);
  };

  return {
    Button: ({ title, onPress }: { title: string; onPress: () => void }) =>
      React.createElement('Button', { title, onPress }),
    Platform: {
      OS: 'android',
    },
    processColor: (color: string) => color,
    SafeAreaView: createComponent('SafeAreaView'),
    ScrollView: createComponent('ScrollView'),
    StyleSheet: {
      create: <T,>(styles: T) => styles,
    },
    Text: createComponent('Text'),
    TextInput: createComponent('TextInput'),
    View: createComponent('View'),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');

  return {
    GestureHandlerRootView: ({ children, ...props }: Record<string, unknown>) =>
      React.createElement('GestureHandlerRootView', props, children),
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@react-navigation/drawer', () => {
  const React = require('react');

  const Screen = (props: any) => React.createElement('DrawerScreen', props);
  const Navigator = ({
    children,
    initialRouteName,
  }: {
    children: React.ReactNode;
    initialRouteName?: string;
  }) => {
    const screens = React.Children.toArray(children) as any[];
    const activeScreen =
      screens.find((screen) => screen.props.name === initialRouteName) ?? screens[0];

    if (!activeScreen) {
      return null;
    }

    if (typeof activeScreen.props.children === 'function') {
      return activeScreen.props.children({});
    }

    const Component = activeScreen.props.component;
    return Component ? React.createElement(Component) : null;
  };

  return {
    createDrawerNavigator: () => ({
      Navigator,
      Screen,
    }),
  };
});

jest.mock('react-native-filesystem', () => {
  const React = require('react');
  const DOCUMENTS_KIND = 'documents';
  const CUSTOM_KIND = 'custom';

  const joinReactNativeFilesystemPath = (...segments: string[]) =>
    segments
      .filter(Boolean)
      .map((segment, index) =>
        index === 0 ? segment.replace(/\/+$/, '') : segment.replace(/^\/+|\/+$/g, '')
      )
      .join('/');

  return {
    __esModule: true,
    default: mockNativeModule,
    ReactNativeFilesystemDirectoryKind: {
      Documents: DOCUMENTS_KIND,
      Custom: CUSTOM_KIND,
    },
    ReactNativeFilesystemView: () => React.createElement(React.Fragment, null),
    joinReactNativeFilesystemPath,
    resolveReactNativeFilesystemDirectory: async (directory: any) => {
      if (directory.kind === DOCUMENTS_KIND) {
        return mockNativeModule.getDocumentsDirectory();
      }
      return directory.path.replace(/\/+$/, '');
    },
    resolveReactNativeFilesystemFilePath: async (directory: any, filename: string) => {
      const basePath =
        directory.kind === DOCUMENTS_KIND
          ? await mockNativeModule.getDocumentsDirectory()
          : directory.path;
      return joinReactNativeFilesystemPath(basePath, filename);
    },
  };
});

import App from '../App';

function flattenText(children: React.ReactNode): string {
  if (Array.isArray(children)) {
    return children.map(flattenText).join('');
  }

  if (children === null || children === undefined || typeof children === 'boolean') {
    return '';
  }

  return String(children);
}

describe('example app mobile harness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeModule.getDocumentsDirectory.mockResolvedValue('/data/user/0/example/files');
    mockNativeModule.exists.mockResolvedValue(true);
    mockNativeModule.writeFile.mockResolvedValue(undefined);
    mockNativeModule.writeFileToDownloads.mockResolvedValue(
      'content://downloads/public_downloads/1',
    );
    mockNativeModule.readFile.mockResolvedValue('file contents from native');
    mockNativeModule.deleteFile.mockResolvedValue(undefined);
    mockNativeModule.mkdir.mockResolvedValue(undefined);
    mockNativeModule.readdir.mockResolvedValue(['alpha.txt', 'beta.txt']);
    mockNativeModule.stat.mockResolvedValue({
      path: '/tmp/demo.txt',
      exists: true,
      isFile: true,
      isDirectory: false,
      size: 24,
      modificationTime: 1700000000,
    });
  });

  it('drives filesystem actions from the UI', async () => {
    let renderer: any;

    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });

    const root = renderer!.root;
    const findByTestId = (testID: string) => root.findByProps({ testID });
    const findButton = (title: string) =>
      root.findAllByType('Button').find((button: any) => button.props.title === title);

    expect(mockNativeModule.getDocumentsDirectory).toHaveBeenCalled();
    expect(flattenText(findByTestId('documents-directory').props.children)).toContain(
      '/data/user/0/example/files',
    );

    await act(async () => {
      findButton('Use documents directory')!.props.onPress();
    });
    expect(flattenText(findByTestId('status-text').props.children)).toContain(
      'documentsDirectory: applied',
    );
    expect(findByTestId('file-path-input').props.value).toBe('/data/user/0/example/files/example.txt');
    expect(findByTestId('directory-path-input').props.value).toBe('/data/user/0/example/files');

    await act(async () => {
      findButton('Use custom directory')!.props.onPress();
    });
    expect(flattenText(findByTestId('status-text').props.children)).toContain(
      'customDirectory: applied',
    );
    expect(findByTestId('file-path-input').props.value).toBe(
      '/data/user/0/example/files/custom/example.txt',
    );
    expect(findByTestId('directory-path-input').props.value).toBe(
      '/data/user/0/example/files/custom',
    );

    await act(async () => {
      findByTestId('file-path-input').props.onChangeText('/tmp/custom.txt');
      findByTestId('directory-path-input').props.onChangeText('/tmp/custom-dir');
      findByTestId('contents-input').props.onChangeText('updated file contents');
    });

    await act(async () => {
      findButton('Exists')!.props.onPress();
    });
    expect(mockNativeModule.exists).toHaveBeenCalledWith('/tmp/custom.txt');
    expect(flattenText(findByTestId('exists-result').props.children)).toContain('true');
    expect(flattenText(findByTestId('status-text').props.children)).toContain('exists: success');

    await act(async () => {
      findButton('Write file')!.props.onPress();
    });
    expect(mockNativeModule.writeFile).toHaveBeenCalledWith(
      '/tmp/custom.txt',
      'updated file contents',
    );

    await act(async () => {
      findButton('Read file')!.props.onPress();
    });
    expect(mockNativeModule.readFile).toHaveBeenCalledWith('/tmp/custom.txt');
    expect(flattenText(findByTestId('read-result').props.children)).toContain(
      'file contents from native',
    );

    await act(async () => {
      findButton('Make directory')!.props.onPress();
    });
    expect(mockNativeModule.mkdir).toHaveBeenCalledWith('/tmp/custom-dir');

    await act(async () => {
      findButton('Read directory')!.props.onPress();
    });
    expect(mockNativeModule.readdir).toHaveBeenCalledWith('/tmp/custom-dir');
    expect(flattenText(findByTestId('readdir-result').props.children)).toContain(
      'alpha.txt, beta.txt',
    );

    await act(async () => {
      findButton('Stat path')!.props.onPress();
    });
    expect(mockNativeModule.stat).toHaveBeenCalledWith('/tmp/custom.txt');
    expect(flattenText(findByTestId('stat-result').props.children)).toContain('"exists":true');

    await act(async () => {
      findButton('Delete file')!.props.onPress();
    });
    expect(mockNativeModule.deleteFile).toHaveBeenCalledWith('/tmp/custom.txt');

    await act(async () => {
      findButton('Write to downloads')!.props.onPress();
    });
    expect(mockNativeModule.writeFileToDownloads).toHaveBeenCalledWith(
      'react-native-filesystem-example.txt',
      'updated file contents',
      'text/plain',
    );
    expect(flattenText(findByTestId('downloads-result').props.children)).toContain(
      'content://downloads/public_downloads/1',
    );
    expect(findByTestId('file-path-input').props.value).toBe(
      'content://downloads/public_downloads/1',
    );
  });
});
