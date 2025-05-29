import React, { useEffect } from "react";
import { Image, View } from "react-native";
import theme from "../../utils/theme";
import ImageModule from "../../ImageModule";

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
        backgroundColor: theme.colors.primary,
      }}
    >
      <Image
        source={ImageModule.logo}
        style={{
          height: "100%",
          width: "70%",
          objectFit: "contain",
        }}
      />
    </View>
  );
};

export default SplashScreen;
