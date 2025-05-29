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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Feather from "@expo/vector-icons/Feather";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";

import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";

const { height, width } = Dimensions.get("window");

interface LoginFormValues {
  username: string;
  password: string;
}

const loginValidationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

type LoginScreenNavigationProp = {
  navigate: (screen: string) => void;
};

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLoginSubmit = (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    console.log("Login attempt with Formik values:", values);
    setTimeout(() => {
      setSubmitting(false);
    }, 2000);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen");
  };

  const handleRegister = () => {
    navigation.navigate("RegisterScreen");
  };

  const renderLabel = (label: string) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.asterisk}>*</Text>
    </Text>
  );

  return (
    <DefaultBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Formik
              initialValues={{ username: "", password: "" }}
              validationSchema={loginValidationSchema}
              onSubmit={handleLoginSubmit}
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
                  <Text style={styles.title}>Log In</Text>

                  <View style={styles.inputGroup}>
                    {renderLabel("Username:")}
                    <TextInput
                      style={[
                        styles.input,
                        touched.username &&
                          errors.username &&
                          styles.inputError,
                      ]}
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      placeholder="Enter your username"
                      placeholderTextColor={theme.colors.grey}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {touched.username && errors.username && (
                      <Text style={styles.errorText}>{errors.username}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    {renderLabel("Password:")}
                    <View
                      style={[
                        styles.passwordInputContainer,
                        touched.password &&
                          errors.password &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordInput}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        placeholder="Enter your password"
                        placeholderTextColor={theme.colors.grey}
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        style={styles.eyeIconContainer}
                      >
                        <Feather
                          name={isPasswordVisible ? "eye" : "eye-off"}
                          size={24}
                          color={theme.colors.black}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <Text style={styles.loginButtonText}>Log In</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={handleForgotPassword}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                      Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={isSubmitting}
                    >
                      <Text style={[styles.linkText, styles.registerLink]}>
                        Register
                      </Text>
                    </TouchableOpacity>
                  </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "stretch",
  },
  title: {
    fontSize: 36,
    ...theme.font.fontBold,
    color: theme.colors.black,
    marginBottom: height * 0.05,
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.black,
    marginBottom: 8,
  },
  asterisk: {
    color: theme.colors.red,
  },
  input: {
    height: 50,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
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
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
    borderWidth: 0,
  },
  eyeIconContainer: {
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
  loginButton: {
    height: 50,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.03,
  },
  loginButtonText: {
    fontSize: 18,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.grey,
    opacity: 0.7,
  },
  forgotPasswordButton: {
    marginTop: height * 0.025,
    alignItems: "flex-end",
  },
  linkText: {
    fontSize: 14,
    ...theme.font.fontBold,
    color: theme.colors.black,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: height * 0.04,
    paddingBottom: 20,
  },
  registerText: {
    fontSize: 14,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  registerLink: {
    ...theme.font.fontSemiBold,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
