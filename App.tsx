import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import React, { useEffect } from "react";
import { AppState, LogBox } from "react-native";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";
import theme from "./utils/theme";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ensureBadgePermission, refreshAppBadge } from "./utils/appBadge";
import { AIAssistantSheet } from "./Screens/Components/AIAssistantSheet";

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
  useEffect(() => {
    // Ask for notification permission on open so the launcher icon can show
    // the active reminder count, then post the current count.
    ensureBadgePermission().then(() => refreshAppBadge());

    // Re-sync when returning to the app (e.g. after enabling notifications in
    // Settings, or when reminders changed while the app was in background).
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshAppBadge();
    });
    return () => sub.remove();
  }, []);

  const isLoadingComplete = useCachedResources();
  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={customTheme}>
          <Navigation />
          <AIAssistantSheet />
          <Toast position="top" />
        </PaperProvider>
      </QueryClientProvider>
    );
  }
}
