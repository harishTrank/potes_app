import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import OTPScreen from "./OTPScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import DrawerNavigation from "../../navigation/DrawerNavigation";
import CreateNoteScreen from "./CreateNoteScreen";
import UserProfileScreen from "./UserProfileScreen";
import CreateContantScreen from "./CreateContantScreen";
import ViewContactScreen from "./ViewContactScreen";
import AllNotesScreen from "./AllNotesScreen";
import SearchResultScreen from "./SearchResultScreen";
import SplashScreen from "../SplashScreen";
import OTPScreenResgister from "./OTPScreenResgister";
import ChangePasswordScreen from "./ChangePasswordScreen";

const Stack = createStackNavigator<any>();

const UserScreens = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={"SplashScreen"}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="OTPScreenResgister" component={OTPScreenResgister} />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />

      {/* <Stack.Screen name="HomeScreen" component={HomeScreen} /> */}
      <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />
      <Stack.Screen name="CreateNoteScreen" component={CreateNoteScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen
        name="CreateContantScreen"
        component={CreateContantScreen}
      />
      <Stack.Screen name="ViewContactScreen" component={ViewContactScreen} />
      <Stack.Screen name="AllNotesScreen" component={AllNotesScreen} />
      <Stack.Screen name="SearchResultScreen" component={SearchResultScreen} />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default UserScreens;
