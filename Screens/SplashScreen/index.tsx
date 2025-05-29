import React, { useEffect } from "react";
import { View } from "react-native";
import theme from "../../utils/theme";

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("UserScreens");
    }, 500);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.white,
      }}
    >
      {/* <Image
        source={ImageModule.animatedLogo}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "contain",
        }}
      /> */}
    </View>
  );
};

export default SplashScreen;
