import useCachedResources from "./hooks/useCachedResources";
import Navigation from "./navigation";
import React from "react";
import { LogBox } from "react-native";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";
import theme from "./utils/theme";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
