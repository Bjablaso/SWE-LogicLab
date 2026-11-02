import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppThemeProvider } from "@/constants/app-theme-provider";
import { Navbar } from "@/component/Navbar";
import { EventContextProvider } from "@/context/EventContextProvider";
import { useTheme } from "@/hooks/use-theme";

import "../global.css";

export const unstable_settings = {
  initialRouteName: "index",
};

function ThemedTabs() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
      tabBar={() => <Navbar />}
    >
      <Tabs.Screen name="index" options={{ title: "Events" }} />
      <Tabs.Screen name="Discover" />
      <Tabs.Screen name="Saved" />
      <Tabs.Screen name="Attending" />
      <Tabs.Screen name="Account" />
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
