import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Feather from "@expo/vector-icons/Feather";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../../utils/theme";
import DefaultBackground from "../../Components/DefaultBackground";

const { height, width } = Dimensions.get("window");

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, "Current password must be at least 6 characters")
    .required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required")
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must be different from the current password"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), undefined], "New passwords must match")
    .required("Confirm new password is required"),
});

type ChangePasswordScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void;
};

interface ChangePasswordScreenProps {
  navigation: ChangePasswordScreenNavigationProp;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const toggleCurrentPasswordVisibility = () => {
    setIsCurrentPasswordVisible(!isCurrentPasswordVisible);
  };
  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleChangePasswordSubmit = (
    values: ChangePasswordFormValues,
    { setSubmitting, setFieldError }: any // FormikHelpers<ChangePasswordFormValues>
  ) => {
    console.log("Change Password Submitted:", values);
    // Simulate API call for UI demonstration
    setSubmitting(true);
    setTimeout(() => {
      // Example of success:
      // Toast.show({ type: 'success', text1: 'Password changed successfully!' });
      // navigation.goBack();

      // Example of error (e.g., current password incorrect):
      // setFieldError('currentPassword', 'Incorrect current password');
      // Toast.show({ type: 'error', text1: 'Failed to change password' });

      setSubmitting(false);
      console.log("Password change process simulated.");
    }, 1500);
  };

  return (
    <DefaultBackground>
      <SafeAreaView style={[styles.safeArea]}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjusted for iOS
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={28} color={theme.colors.black} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Formik
              initialValues={{
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }}
              validationSchema={changePasswordSchema}
              onSubmit={handleChangePasswordSubmit}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }: any) => (
                <View style={styles.formContainer}>
                  <Text style={styles.screenTitle}>Change your password</Text>

                  {/* Current Password Field */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.passwordInputContainer,
                        touched.currentPassword &&
                          errors.currentPassword &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordField}
                        placeholder="Enter current password"
                        placeholderTextColor={theme.colors.grey}
                        value={values.currentPassword}
                        onChangeText={handleChange("currentPassword")}
                        onBlur={handleBlur("currentPassword")}
                        secureTextEntry={!isCurrentPasswordVisible}
                        autoCapitalize="none"
                        autoComplete="password" // current-password if supported
                      />
                      <TouchableOpacity
                        onPress={toggleCurrentPasswordVisibility}
                        style={styles.eyeIconContainer}
                      >
                        <Feather
                          name={isCurrentPasswordVisible ? "eye" : "eye-off"}
                          size={24}
                          color={theme.colors.black}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.currentPassword && errors.currentPassword && (
                      <Text style={styles.errorText}>
                        {errors.currentPassword}
                      </Text>
                    )}
                  </View>

                  {/* New Password Field */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.passwordInputContainer,
                        touched.newPassword &&
                          errors.newPassword &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordField}
                        placeholder="Enter new password"
                        placeholderTextColor={theme.colors.grey}
                        value={values.newPassword}
                        onChangeText={handleChange("newPassword")}
                        onBlur={handleBlur("newPassword")}
                        secureTextEntry={!isNewPasswordVisible}
                        autoCapitalize="none"
                        autoComplete="new-password"
                      />
                      <TouchableOpacity
                        onPress={toggleNewPasswordVisibility}
                        style={styles.eyeIconContainer}
                      >
                        <Feather
                          name={isNewPasswordVisible ? "eye" : "eye-off"}
                          size={24}
                          color={theme.colors.black}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.newPassword && errors.newPassword && (
                      <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                  </View>

                  {/* Confirm New Password Field */}
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.passwordInputContainer,
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordField}
                        placeholder="Confirm new password"
                        placeholderTextColor={theme.colors.grey}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                        secureTextEntry={!isConfirmPasswordVisible}
                        autoCapitalize="none"
                        autoComplete="new-password"
                      />
                      <TouchableOpacity
                        onPress={toggleConfirmPasswordVisibility}
                        style={styles.eyeIconContainer}
                      >
                        <Feather
                          name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                          size={24}
                          color={theme.colors.black}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        Update Password
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Global form error (if any from onSubmit) */}
                  {errors.submit && ( // Assuming you might set a general 'submit' error
                    <Text style={[styles.errorText, styles.submitError]}>
                      {errors.submit}
                    </Text>
                  )}
                </View>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DefaultBackground>
  );
};

const styles: any = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute", // Allows ScrollView content to go "behind" it initially
    top: Platform.OS === "ios" ? 0 : 10, // Adjust if status bar handling is different
    left: 0,
    zIndex: 1, // Ensure it's above the ScrollView content
    width: "100%",
    paddingHorizontal: width * 0.02, // Padding for the back button
  },
  backButton: {
    padding: 10, // Make it easier to tap
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08, // 8% horizontal padding
    paddingTop: height * 0.12, // Space for the absolute header and title
    paddingBottom: height * 0.05,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400, // Max width for larger screens
    alignItems: "stretch", // Children will stretch to fill width
  },
  screenTitle: {
    fontSize: 26,
    color: theme.colors.black,
    ...theme.font.fontSemiBold,
    marginBottom: 25, // Increased margin
    textAlign: "left", // Align to left as per image
  },
  inputGroup: {
    marginBottom: height * 0.025, // Spacing between input groups
  },
  passwordInputContainer: {
    height: 55, // Slightly taller input fields
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
    borderWidth: 1.5,
    borderRadius: 10, // Slightly more rounded corners
  },
  passwordField: {
    flex: 1, // Take available space
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  eyeIconContainer: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },
  inputError: {
    borderColor: theme.colors.red, // Red border for error state
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.red,
    marginTop: 5,
    minHeight: 18,
    ...theme.font.fontRegular,
    paddingLeft: 2,
  },
  submitButton: {
    height: 55,
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.02,
  },
  submitButtonText: {
    fontSize: 18,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.grey,
    opacity: 0.7,
  },
  submitError: {
    textAlign: "center",
    marginTop: 15,
  },
});

export default ChangePasswordScreen;
