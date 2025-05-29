import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";

type AboutUsScreenNavigationProp = {
  goBack: () => void;
};

interface AboutUsScreenProps {
  navigation: AboutUsScreenNavigationProp;
}

const AboutUsScreen: React.FC<AboutUsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleSearchPress = () => {
    console.log("Search icon pressed on About Us screen");
  };

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>

          <Image source={ImageModule.logo} style={styles.logoImg} />

          <TouchableOpacity
            onPress={handleSearchPress}
            style={styles.iconButton}
          >
            <Feather name="search" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>About Us</Text>
          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <Text style={styles.placeholderText}>
              About Us content will go here.
              {"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
              {"\n\n"}
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </Text>
          </ScrollView>
        </View>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logoImg: {
    width: "50%",
    height: 40,
    objectFit: "contain",
  },
  iconButton: {
    backgroundColor: theme.colors.cardBackground,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBar: {
    backgroundColor: theme.colors.cardBackground,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderRadius: 12,
    marginTop: 10,
    height: "75%",
  },
  titleText: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.white,
  },
  contentScrollView: {
    flex: 1,
    marginTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.white,
    textAlign: "left",
    lineHeight: 24,
  },
});

export default AboutUsScreen;
