import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import theme from "../../utils/theme";
import { CustomDrawerContent } from "./CustomDrawerContent";
import HomeScreen from "../../Screens/UserScreens/HomeScreen";
import AboutUsScreen from "../../Screens/UserScreens/AboutUsScreen";
import ContactUsScreen from "../../Screens/UserScreens/ContactUsScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: "left",
        headerShown: false,
        drawerType: "back",
        drawerActiveTintColor: theme.colors.primary,
        drawerActiveBackgroundColor: "#FFF0D4",
        drawerInactiveTintColor: theme.colors.secondary,
        swipeEdgeWidth: 0,
        drawerStyle: {
          backgroundColor: "#fff",
          width: 300,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="HomeScreen" component={HomeScreen} />
      <Drawer.Screen name="ContactUsScreen" component={ContactUsScreen} />
      <Drawer.Screen name="AboutUsScreen" component={AboutUsScreen} />
    </Drawer.Navigator>
  );
}
