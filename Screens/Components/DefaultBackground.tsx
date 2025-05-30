import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import ImageModule from "../../ImageModule";

const DefaultBackground: any = ({
  children,
  imageSource = ImageModule.backGroundImg,
  resizeMode = "cover",
  style,
}: any) => {
  return (
    <ImageBackground
      source={imageSource}
      style={[styles.background, style]}
      resizeMode={resizeMode}
      accessibilityIgnoresInvertColors
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default DefaultBackground;
