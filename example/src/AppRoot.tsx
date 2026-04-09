import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppDrawer } from './navigation/AppDrawer';
import { styles } from './styles';
import { useDemoState } from './hooks/useDemoState';

export default function AppRoot() {
  const { sharedProps, toastMessage } = useDemoState();

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <NavigationContainer>
        <AppDrawer {...sharedProps} />
      </NavigationContainer>

      {!!toastMessage && (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={styles.toast}>
            <Text style={styles.toastTitle}>Filesystem notice</Text>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}
