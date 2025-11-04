import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";
import theme from "./utils/theme";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import notifee, { AuthorizationStatus } from "@notifee/react-native";

registerTranslation("en", en);
LogBox.ignoreAllLogs();

export const queryClient = new QueryClient();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    accent: theme.colors.greyText,
    primaryContainer: theme.colors.primaryLight,
    secondaryContainer: theme.colors.secondary,
  },
};

export default function App() {
  async function checkAndRequestPermissions() {
    const settings = await notifee.getNotificationSettings();

    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.log("Permission denied previously — requesting again...");
      const newSettings = await notifee.requestPermission();
      if (newSettings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log("Notification permissions granted.");
      } else {
        console.log("Notification permissions not granted.");
      }
    } else if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.log(
        "Notification permission already granted — skipping request."
      );
    } else {
      // First-time ask
      const newSettings = await notifee.requestPermission();
      if (newSettings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log("Notification permissions granted.");
      } else {
        console.log("Notification permissions not granted.");
      }
    }
  }

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const isLoadingComplete = useCachedResources();
  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={customTheme}>
          <Navigation />
          <Toast position="top" />
        </PaperProvider>
      </QueryClientProvider>
    );
  }
}
