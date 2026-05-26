import React from "react";
import { View, StyleSheet } from "react-native";
import theme from "../../utils/theme";

const DefaultBackground: any = ({ children, style }: any) => {
  return (
    <View style={[styles.background, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.lightBackground,
  },
});

export default DefaultBackground;
