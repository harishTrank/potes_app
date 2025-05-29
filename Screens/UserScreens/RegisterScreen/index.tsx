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
import Ionicons from "@expo/vector-icons/Ionicons";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";

const { height, width } = Dimensions.get("window");

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const registerValidationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm Password is required"),
});

type RegisterScreenNavigationProp = {
  navigate: (screen: string) => void;
  // goBack?: () => void; // Optional: if you want a back button
};

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleRegisterSubmit = (
    values: RegisterFormValues,
    { setSubmitting }: FormikHelpers<RegisterFormValues>
  ) => {
    console.log("Register attempt with Formik values:", values);
    // Simulate API call
    setTimeout(() => {
      // Example: navigation.navigate('LoginScreen');
      setSubmitting(false);
    }, 2000);
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
              initialValues={{
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={registerValidationSchema}
              onSubmit={handleRegisterSubmit}
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
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={navigation.goBack}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={theme.colors.black}
                    />
                    <Text style={styles.title}>Create Account</Text>
                  </TouchableOpacity>

                  <View style={styles.inputGroup}>
                    {renderLabel("First name:")}
                    <TextInput
                      style={[
                        styles.input,
                        touched.firstName &&
                          errors.firstName &&
                          styles.inputError,
                      ]}
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      placeholder="Enter your first name"
                      placeholderTextColor={theme.colors.grey}
                      autoCapitalize="words"
                    />
                    {touched.firstName && errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    {renderLabel("Last name:")}
                    <TextInput
                      style={[
                        styles.input,
                        touched.lastName &&
                          errors.lastName &&
                          styles.inputError,
                      ]}
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      placeholder="Enter your last name"
                      placeholderTextColor={theme.colors.grey}
                      autoCapitalize="words"
                    />
                    {touched.lastName && errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>

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
                      placeholder="Choose a username"
                      placeholderTextColor={theme.colors.grey}
                      autoCapitalize="none"
                    />
                    {touched.username && errors.username && (
                      <Text style={styles.errorText}>{errors.username}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    {renderLabel("Email:")}
                    <TextInput
                      style={[
                        styles.input,
                        touched.email && errors.email && styles.inputError,
                      ]}
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      placeholder="Enter your email address"
                      placeholderTextColor={theme.colors.grey}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
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
                        placeholder="Create a password"
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

                  <View style={styles.inputGroup}>
                    {renderLabel("Confirm Password:")}
                    <View
                      style={[
                        styles.passwordInputContainer,
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          styles.inputError,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordInput}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                        placeholder="Confirm your password"
                        placeholderTextColor={theme.colors.grey}
                        secureTextEntry={!isConfirmPasswordVisible}
                        autoCapitalize="none"
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
                      styles.registerButton,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <Text style={styles.registerButtonText}>Register</Text>
                    )}
                  </TouchableOpacity>
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
    paddingVertical: height * 0.03, // Added vertical padding for scrollable content
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "stretch",
  },
  title: {
    fontSize: 30,
    ...theme.font.fontBold,
    color: theme.colors.black,
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: height * 0.015, // Consistent margin
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
  registerButton: {
    height: 50,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.03,
    marginBottom: height * 0.02,
  },
  registerButtonText: {
    fontSize: 18,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.grey,
    opacity: 0.7,
  },
});

export default RegisterScreen;
