import React from "react";
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
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DefaultBackground from "../../Components/DefaultBackground";

const { height, width } = Dimensions.get("window");

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
});

const ForgotPasswordScreen = ({ navigation }: any) => {
  const handleSendEmailSubmit = (
    values: any,
    { setSubmitting, setErrors }: any
  ) => {
    navigation.navigate("OTPScreen", { email: values?.email });
    // sendOTPAPICall
    //   ?.mutateAsync({
    //     body: {
    //       email: values?.email,
    //     },
    //   })
    //   ?.then((res: any) => {
    //     setSubmitting(false);
    //     if (res?.code == "0") {
    //       return Toast.show({
    //         type: "error",
    //         text1: res.message,
    //       });
    //     } else {
    //       navigation.navigate("OTPScreen", { email: values?.email });
    //       return Toast.show({
    //         type: "success",
    //         text1: res.message,
    //       });
    //     }
    //   })
    //   ?.catch((err: any) => {
    //     setSubmitting(false);
    //   });
  };

  return (
    <DefaultBackground>
      <SafeAreaView
        style={[
          styles.safeArea,
          Platform.OS === "android" && { paddingTop: useSafeAreaInsets().top },
        ]}
      >
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
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
              initialValues={{ email: "" }}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleSendEmailSubmit}
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
                <>
                  <View style={styles.formContainer}>
                    <Text style={styles.screenTitle}>Enter your email</Text>

                    <View style={styles.inputGroup}>
                      <View style={styles.inputIconWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="email adress"
                          placeholderTextColor={theme.colors.grey}
                          value={values.email}
                          onChangeText={handleChange("email")}
                          onBlur={handleBlur("email")}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          autoComplete="email"
                        />
                      </View>
                      <View style={styles.inputUnderline} />
                      {touched.email && errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
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
                        <Text style={styles.submitButtonText}>sent email</Text>
                      )}
                    </TouchableOpacity>

                    {errors.submit && (
                      <Text style={[styles.errorText, styles.submitError]}>
                        {errors.submit}
                      </Text>
                    )}
                  </View>
                </>
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
    paddingHorizontal: width * 0.08,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? height * 0.02 : height * 0.01,
    paddingHorizontal: width * 0.05,
    width: "100%",
  },
  backButton: {
    padding: 5,
  },
  formContainer: {
    paddingTop: height * 0.05,
    width: "100%",
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    color: theme.colors.black,
    ...theme.font.fontMedium,
    marginBottom: height * 0.06,
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: height * 0.03,
  },
  inputIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
    width: "100%",
  },
  inputUnderline: {},
  eyeIcon: {
    paddingLeft: 10,
    padding: 5,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.red,
    marginTop: 6,
    minHeight: 30,
    ...theme.font.fontRegular,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  submitButtonText: {
    fontSize: 18,
    color: theme.colors.white,
    ...theme.font.fontMedium,
    textTransform: "lowercase",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.grey,
  },
  submitError: {
    textAlign: "center",
    marginTop: 15,
  },
});

export default ForgotPasswordScreen;
