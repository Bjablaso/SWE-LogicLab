import { Stack } from "expo-router";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import { StyleSheet, Text, View } from 'react-native';

export default function RootLayout() {
  return (
      <SafeAreaProvider>
        <SafeAreaView edges={['top']}  style={styles.shell}>
          <View style={styles.content}>
            <Text style={styles.label}>Main content area</Text>
          </View>

          <View style={styles.nav}>
            <Text style={styles.label}>Navigation area</Text>
          </View>

        </SafeAreaView>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,                 // fill the whole phone
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,                 // take all space above the nav
    margin: 3,
    borderWidth: 2,
    borderStyle: 'dashed',   // dashed like the wireframe, just to see it
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    height: 64,              // fixed height
  //  marginHorizontal: 8,
    marginVertical: 3,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '700' },
})