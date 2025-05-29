import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
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
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : insets.top },
        ]}
      >
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
        </View>

        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.contentText}>
            Welcome to POTES! We are dedicated to helping you organize your
            thoughts and connections with people in your life. Our mission is to
            provide a simple, intuitive platform for managing personal notes and
            reminders related to your contacts.
            {"\n\n"}
            At POTES, we believe that meaningful relationships are built on
            remembering the little things. Whether it's a birthday, an important
            detail from a conversation, or a follow-up task, our app is designed
            to be your personal assistant for nurturing connections.
            {"\n\n"}
            Key Features:
            {"\n"}- Create and manage contacts with detailed personal
            information.
            {"\n"}- Add notes and reminders linked directly to your contacts.
            {"\n"}- Keep track of important dates like birthdays and
            anniversaries.
            {"\n"}- Customize fields to store information that matters most to
            you.
            {"\n\n"}
            Our team is passionate about creating tools that enhance everyday
            life. We are constantly working to improve POTES and add new
            features based on user feedback. Thank you for choosing POTES to
            help you stay connected.
            {"\n\n"}
            If you have any questions, suggestions, or feedback, please don't
            hesitate to reach out to us through the "Contact Us" section.
          </Text>
        </ScrollView>
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
    resizeMode: "contain",
  },
  iconButton: {
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBar: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginTop: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  titleText: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.white,
  },
  contentScrollView: {
    flex: 1,
    marginHorizontal: 15,
    backgroundColor: theme.colors.secondary,
    marginBottom: 70,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  contentContainer: {
    padding: 10,
  },
  contentText: {
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.white,
    textAlign: "left",
    lineHeight: 24,
    paddingHorizontal: 5,
  },
});

export default AboutUsScreen;
