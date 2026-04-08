import { jest } from '@jest/globals';
import React from 'react';
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockUseEvent: any = jest.fn(() => ({ value: 'Hello from native event' }));

const mockNativeModule: any = {
  PI: Math.PI,
  hello: jest.fn(() => 'Hello world! 👋'),
  setValueAsync: (jest.fn() as any).mockResolvedValue(undefined),
  exists: (jest.fn() as any).mockResolvedValue(true),
  readFile: (jest.fn() as any).mockResolvedValue('file contents from native'),
  writeFile: (jest.fn() as any).mockResolvedValue(undefined),
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

jest.mock('expo', () => ({
  useEvent: (...args: any[]) => mockUseEvent(...args),
}));

jest.mock('react-native', () => {
  const React = require('react');

  const createComponent = (name: string) => {
    return ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(name, props, children);
  };

  return {
    Button: ({ title, onPress }: { title: string; onPress: () => void }) =>
      React.createElement('Button', { title, onPress }),
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

jest.mock('react-native-filesystem', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: mockNativeModule,
    ReactNativeFilesystemView: () => React.createElement(React.Fragment, null),
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
    mockUseEvent.mockReturnValue({ value: 'Hello from native event' });
    mockNativeModule.hello.mockReturnValue('Hello world! 👋');
    mockNativeModule.setValueAsync.mockResolvedValue(undefined);
    mockNativeModule.exists.mockResolvedValue(true);
    mockNativeModule.writeFile.mockResolvedValue(undefined);
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

  it('renders native values and drives filesystem actions from the UI', async () => {
    let renderer: any;

    await act(async () => {
      renderer = TestRenderer.create(<App />);
    });

    const root = renderer!.root;
    const findByTestId = (testID: string) => root.findByProps({ testID });
    const findButton = (title: string) =>
      root.findAllByType('Button').find((button: any) => button.props.title === title);

    const allText = root
      .findAllByType('Text')
      .map((node: any) => flattenText(node.props.children))
      .join('\n');

    expect(allText).toContain(String(Math.PI));
    expect(allText).toContain('Hello world! 👋');
    expect(flattenText(findByTestId('event-value').props.children)).toBe('Hello from native event');

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
  });
});
