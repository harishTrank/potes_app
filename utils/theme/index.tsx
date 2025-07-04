import { Platform } from "react-native";

const theme = {
  colors: {
    primary: "#5dd7d1",
    primaryLight: "#aeebe8",
    secondary: "#38423f",
    secondaryLight: "#727272",
    red: "#C70039",
    text: "#10181E",
    greyText: "#888C94",
    white: "#fff",
    lightBackground: "#272F35",
    black: "#000",
    grey: "#bdbdbd",
    searchPlaceholder: "#A0A0A0",
    searchText: "#333333",
    reminderMessageText: "#E0E0E0",
    categoryCountBadgeBackground: "#404040",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,

    elevation: 5,
  },

  elevationHeavy: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 10,
  },
};

export default theme;
