import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppThemeProvider } from "@/constants/app-theme-provider";
import { Navbar } from "@/component/Navbar";
import { EventContextProvider } from "@/context/EventContextProvider";
import { useTheme } from "@/hooks/use-theme";

import "../global.css";

export const unstable_settings = {
  anchor: "Discover",
};

function ThemedTabs() {
  const { colors } = useTheme();

  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
      tabBar={() => <Navbar />}
    >
      <Tabs.Screen name="Discover" />
      <Tabs.Screen name="Saved" />
      <Tabs.Screen name="Attending" />
      <Tabs.Screen name="Account" />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <EventContextProvider>
          <ThemedTabs />
        </EventContextProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
