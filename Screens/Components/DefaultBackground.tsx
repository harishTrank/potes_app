import React from "react";
import {
  ImageBackground,
  StyleSheet,
  ImageSourcePropType,
  ImageResizeMode,
  StyleProp,
  ViewStyle,
} from "react-native";
import ImageModule from "../../ImageModule";

interface DefaultBackgroundProps {
  children: React.ReactNode;
  imageSource?: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  style?: StyleProp<ViewStyle>;
}

const DefaultBackground: React.FC<DefaultBackgroundProps> = ({
  children,
  imageSource = ImageModule.backGroundImg,
  resizeMode = "cover",
  style,
}) => {
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
