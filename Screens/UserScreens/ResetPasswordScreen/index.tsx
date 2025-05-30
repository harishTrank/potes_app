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
import { Formik, FormikHelpers } from "formik"; // Added FormikHelpers
import * as Yup from "yup";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Toast from "react-native-toast-message"; // Uncomment if using Toast
import DefaultBackground from "../../Components/DefaultBackground";
import { forgotPasswordChange } from "../../../store/Services/Others";
import Toast from "react-native-toast-message";

const { height, width } = Dimensions.get("window");

interface ResetPasswordFormValues {
  // Specific interface for this form
  newPassword: string;
  confirmPassword: string;
}

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters") // Adjusted message
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), undefined], "Passwords must match") // Simpler message
    .required("Confirm password is required"),
});

type ResetPasswordScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void;
};

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  route: { params?: { email?: string } };
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}: any) => {
  const insets = useSafeAreaInsets();
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  };
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleResetSubmit = (values: ResetPasswordFormValues) => {
    forgotPasswordChange({
      email: route?.params?.email,
      otp: route?.params?.otp,
      new_password: values?.newPassword,
      confirm_password: values?.confirmPassword,
    })
      ?.then((res: any) => {
        console.log("res", res);
        Toast.show({
          type: "success",
          text1: res?.msg,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        });
      })
      ?.catch((err: any) => {
        Toast.show({
          type: "error",
          text1: err?.data?.error,
        });
      });
  };

  return (
    <DefaultBackground>
      <SafeAreaView
        style={[
          styles.safeArea,
          Platform.OS === "android" && { paddingTop: insets.top },
        ]}
      >
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Consistent iOS offset
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
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={resetPasswordSchema}
              onSubmit={handleResetSubmit}
            >
              {(
                {
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isSubmitting,
                }: any // Kept 'any' as per user's last working example
              ) => (
                <View style={styles.formContainer}>
                  <Text style={styles.screenTitle}>Reset your password</Text>

                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.passwordInputContainer, // New container for password input + eye icon
                        touched.newPassword &&
                          errors.newPassword &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordField} // Renamed for clarity
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
                        style={styles.eyeIconContainer} // Consistent eye icon container
                      >
                        <Feather
                          name={isNewPasswordVisible ? "eye" : "eye-off"}
                          size={24}
                          color={theme.colors.black} // Consistent icon color
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.newPassword && errors.newPassword && (
                      <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.passwordInputContainer, // Reused container style
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordField} // Reused field style
                        placeholder="Confirm password"
                        placeholderTextColor={theme.colors.grey}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                        secureTextEntry={!isConfirmPasswordVisible}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={toggleConfirmPasswordVisibility}
                        style={styles.eyeIconContainer} // Reused eye icon container style
                      >
                        <Feather
                          name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                          size={24}
                          color={theme.colors.black} // Consistent icon color
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
                      <Text style={styles.submitButtonText}>Reset</Text>
                    )}
                  </TouchableOpacity>

                  {errors.submit && (
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    zIndex: 1,
    width: "100%",
  },
  backButton: {
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingTop: 100,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "stretch",
  },
  screenTitle: {
    fontSize: 26,
    color: theme.colors.black,
    ...theme.font.fontSemiBold,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: height * 0.02,
  },
  passwordInputContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  passwordField: {
    // The actual TextInput part
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
    borderWidth: 0, // Border is on the container
  },
  eyeIconContainer: {
    // For the TouchableOpacity holding the icon
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },
  inputError: {
    borderColor: theme.colors.red,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.red,
    marginTop: 4,
    minHeight: 18,
    ...theme.font.fontRegular,
    marginBottom: 4,
  },
  submitButton: {
    height: 50,
    backgroundColor: theme.colors.secondary, // Assuming secondary is the dark button color
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.03,
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

export default ResetPasswordScreen;
