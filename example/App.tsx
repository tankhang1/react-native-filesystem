import { useEvent } from 'expo';
import { useState } from 'react';
import ReactNativeFilesystem, { ReactNativeFilesystemView } from 'react-native-filesystem';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const DEFAULT_FILE_PATH = '/tmp/react-native-filesystem/example.txt';
const DEFAULT_DIRECTORY_PATH = '/tmp/react-native-filesystem';
const DEFAULT_CONTENTS = 'Hello from React Native Filesystem';

export default function App() {
  const onChangePayload = useEvent(ReactNativeFilesystem, 'onChange');
  const [filePath, setFilePath] = useState(DEFAULT_FILE_PATH);
  const [directoryPath, setDirectoryPath] = useState(DEFAULT_DIRECTORY_PATH);
  const [contents, setContents] = useState(DEFAULT_CONTENTS);
  const [status, setStatus] = useState('Ready');
  const [existsResult, setExistsResult] = useState('unknown');
  const [readResult, setReadResult] = useState('none');
  const [directoryEntries, setDirectoryEntries] = useState<string[]>([]);
  const [statResult, setStatResult] = useState('not loaded');

  async function runAction(
    actionName: string,
    action: () => Promise<void>,
  ) {
    try {
      await action();
      setStatus(`${actionName}: success`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`${actionName}: ${message}`);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <Group name="Constants">
          <Text>{ReactNativeFilesystem.PI}</Text>
        </Group>
        <Group name="Functions">
          <Text>{ReactNativeFilesystem.hello()}</Text>
        </Group>
        <Group name="Async functions">
          <Button
            title="Set value"
            onPress={async () => {
              await ReactNativeFilesystem.setValueAsync('Hello from JS!');
            }}
          />
        </Group>
        <Group name="Events">
          <Text testID="event-value">{onChangePayload?.value ?? 'none'}</Text>
        </Group>
        <Group name="Filesystem Harness">
          <Text style={styles.label}>File path</Text>
          <TextInput
            testID="file-path-input"
            value={filePath}
            onChangeText={setFilePath}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>Directory path</Text>
          <TextInput
            testID="directory-path-input"
            value={directoryPath}
            onChangeText={setDirectoryPath}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>Contents</Text>
          <TextInput
            testID="contents-input"
            multiline
            value={contents}
            onChangeText={setContents}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, styles.multilineInput]}
          />

          <View style={styles.buttonGroup}>
            <Button
              title="Exists"
              onPress={() =>
                runAction('exists', async () => {
                  const exists = await ReactNativeFilesystem.exists(filePath);
                  setExistsResult(String(exists));
                })
              }
            />
            <Button
              title="Write file"
              onPress={() =>
                runAction('writeFile', async () => {
                  await ReactNativeFilesystem.writeFile(filePath, contents);
                })
              }
            />
            <Button
              title="Read file"
              onPress={() =>
                runAction('readFile', async () => {
                  const nextContents = await ReactNativeFilesystem.readFile(filePath);
                  setReadResult(nextContents);
                })
              }
            />
            <Button
              title="Delete file"
              onPress={() =>
                runAction('deleteFile', async () => {
                  await ReactNativeFilesystem.deleteFile(filePath);
                })
              }
            />
            <Button
              title="Make directory"
              onPress={() =>
                runAction('mkdir', async () => {
                  await ReactNativeFilesystem.mkdir(directoryPath);
                })
              }
            />
            <Button
              title="Read directory"
              onPress={() =>
                runAction('readdir', async () => {
                  const entries = await ReactNativeFilesystem.readdir(directoryPath);
                  setDirectoryEntries(entries);
                })
              }
            />
            <Button
              title="Stat path"
              onPress={() =>
                runAction('stat', async () => {
                  const details = await ReactNativeFilesystem.stat(filePath);
                  setStatResult(JSON.stringify(details));
                })
              }
            />
          </View>

          <Text testID="status-text">Status: {status}</Text>
          <Text testID="exists-result">Exists: {existsResult}</Text>
          <Text testID="read-result">Read result: {readResult}</Text>
          <Text testID="readdir-result">
            Directory entries: {directoryEntries.join(', ') || 'none'}
          </Text>
          <Text testID="stat-result">Stat: {statResult}</Text>
        </Group>
        <Group name="Views">
          <ReactNativeFilesystemView
            url="https://www.example.com"
            onLoad={({ nativeEvent: { url } }: { nativeEvent: { url: string } }) =>
              console.log(`Loaded: ${url}`)
            }
            style={styles.view}
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderColor: '#c7d0db',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    gap: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
});
