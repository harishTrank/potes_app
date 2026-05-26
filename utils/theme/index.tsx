import { Platform } from "react-native";

const theme = {
  colors: {
    primary: "#3d8b6e",
    primaryLight: "#e8f5f0",
    secondary: "#1a3a2e",
    secondaryLight: "#727272",
    red: "#C70039",
    text: "#10181E",
    greyText: "#888C94",
    white: "#fff",
    lightBackground: "#f5f7f5",
    lightCard: "#f0f5f2",
    black: "#000",
    grey: "#bdbdbd",
    searchPlaceholder: "#A0A0A0",
    searchText: "#333333",
    reminderMessageText: "#555555",
    categoryCountBadgeBackground: "#e0ede8",
    border: "#e0e8e4",
    tabBar: "#ffffff",
    tabBarActive: "#3d8b6e",
    tabBarInactive: "#9aada7",
    sectionHeader: "#1a3a2e",
    cardBorder: "#dce8e2",
    avatarBg: "#3d8b6e",
  },
  font: {
    fontBold: {
      fontFamily: "Poppins-Bold",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontSemiBold: {
      fontFamily: "Poppins-SemiBold",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontRegular: {
      fontFamily: "Poppins-Regular",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontMedium: {
      fontFamily: "Poppins-Medium",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontLight: {
      fontFamily: "Poppins-Light",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontCinzelBlack: {
      fontFamily: "Cinzel-Black",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontPlayFairLight: {
      fontFamily: "PlayfairDisplay-Black",
      top: Platform.OS == "android" ? 2 : 0,
    },
    fontPlayFairRegular: {
      fontFamily: "PlayfairDisplay-Regular",
      top: Platform.OS == "android" ? 2 : 0,
    },
  },

  elevationLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
  },

  elevationHeavy: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
};

export default theme;
