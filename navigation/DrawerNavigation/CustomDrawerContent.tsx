// components/CustomDrawerContent.tsx (or your chosen path)

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import Feather from "@expo/vector-icons/Feather";
import theme from "../../utils/theme"; // Adjust path
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImageModule from "../../ImageModule";

// Updated drawer items to match the image
const drawerItems = [
  { label: "Home", iconName: "home", navigateTo: "HomeScreen" }, // Assuming HomeScreen is your home
  { label: "Directory", iconName: "users", navigateTo: "DirectoryScreen" }, // Add screen name
  { label: "About Us", iconName: "info", navigateTo: "AboutUsScreen" }, // Add screen name
  { label: "Contact Us", iconName: "phone", navigateTo: "ContactUsScreen" }, // Add screen name
  { label: "Logout", iconName: "log-out", isLogout: true },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const insets = useSafeAreaInsets();
  const focusedRouteKey = state.routes[state.index]?.key;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.closeDrawer();
          navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={[styles.headerContainer]}>
        <TouchableOpacity
          style={styles.btnlogoImg}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Image source={ImageModule.logo} style={styles.logoImg} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.closeDrawer()}
          style={styles.closeButton}
        >
          <Feather name="x" size={28} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.itemListContainer}>
          {drawerItems.map((item, index) => {
            const targetRoute = state.routes.find(
              (route: any) => route.name === item.navigateTo
            );
            const isFocused = targetRoute?.key === focusedRouteKey;

            return (
              <DrawerItem
                key={index}
                label={item.label}
                labelStyle={[
                  styles.labelStyle,
                  {
                    color: isFocused ? theme.colors.black : theme.colors.white,
                  },
                ]}
                style={[styles.drawerItemStyle]}
                icon={({ size }) => (
                  <Feather
                    name={item.iconName as any}
                    size={22}
                    color={isFocused ? theme.colors.black : theme.colors.white}
                  />
                )}
                focused={isFocused && !item.isLogout}
                activeTintColor={theme.colors.white}
                inactiveTintColor={theme.colors.white}
                activeBackgroundColor={theme.colors.primary}
                onPress={() => {
                  if (item.isLogout) {
                    handleLogout();
                  } else if (item.navigateTo) {
                    navigation.navigate(item.navigateTo);
                  }
                }}
              />
            );
          })}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.secondaryLight,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  scrollViewContent: {
    paddingTop: 0,
  },
  itemListContainer: {
    paddingHorizontal: 5,
  },
  drawerItemStyle: {
    marginVertical: 2,
    borderRadius: 8,
  },
  labelStyle: {
    fontSize: 17,
    ...theme.font.fontMedium,
    marginLeft: -5,
  },
  logoutItem: {
    marginTop: 20,
  },
  logoImg: {
    height: 50,
    objectFit: "contain",
    width: "100%",
  },
  btnlogoImg: {
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
  },
});
