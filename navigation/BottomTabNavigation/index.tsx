import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../utils/theme";
import HomeScreen from "../../Screens/UserScreens/HomeScreen";
import DirectoryScreen from "../../Screens/UserScreens/DirectoryScreen";
import ChatAiScreen from "../../Screens/UserScreens/ChatAiScreen";
import UserProfileScreen from "../../Screens/UserScreens/UserProfileScreen";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

const AITabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.aiTabIcon, focused && styles.aiTabIconActive]}>
    <MaterialCommunityIcons
      name="star-four-points"
      size={20}
      color={focused ? theme.colors.white : theme.colors.tabBarInactive}
    />
  </View>
);

export default function BottomTabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: "HOME",
          tabBarIcon: ({ focused, color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DirectoryScreen"
        component={DirectoryScreen}
        options={{
          tabBarLabel: "CONTACTS",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatAiScreen"
        component={ChatAiScreen}
        options={{
          tabBarLabel: "AI",
          tabBarIcon: ({ focused }) => <AITabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{
          tabBarLabel: "PROFILE",
          tabBarIcon: ({ focused, color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
    marginTop: 2,
  },
  aiTabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.lightCard,
    justifyContent: "center",
    alignItems: "center",
  },
  aiTabIconActive: {
    backgroundColor: theme.colors.primary,
  },
});
