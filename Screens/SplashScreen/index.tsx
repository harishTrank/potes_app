import React, { useEffect } from "react";
import { Image, View } from "react-native";
import theme from "../../utils/theme";
import ImageModule from "../../ImageModule";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }: any) => {
  const loginChecker = async () => {
    const token: any = await AsyncStorage.getItem("accessToken");
    if (token) {
      navigation.navigate("DrawerNavigation");
    } else {
      navigation.navigate("LoginScreen");
    }
  };
  useEffect(() => {
    setTimeout(() => {
      loginChecker();
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
