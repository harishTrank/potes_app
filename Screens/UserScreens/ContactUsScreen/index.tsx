import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { contactUsApi } from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import Toast from "react-native-toast-message";

interface ContactFormValues {
  fullName: string;
  email: string;
  message: string;
}

const contactValidationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  message: Yup.string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
});

const ContactUsScreen: React.FC<any> = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (
    values: ContactFormValues,
    actions: FormikHelpers<ContactFormValues>
  ) => {
    setLoading(true);
    contactUsApi({
      body: {
        full_name: values.fullName,
        email: values.email,
        message: values.message,
      },
    })
      ?.then((res: any) => {
        setLoading(false);
        Toast.show({ type: "success", text1: res?.msg });
        const subject = encodeURIComponent("Potes, I have a query");
        const body = encodeURIComponent(`I'm ${values.fullName},\n\n${values.message}`);
        const mailtoUrl = `mailto:admin@mypotes.com?subject=${subject}&body=${body}`;
        Linking.canOpenURL(mailtoUrl).then((supported) => {
          if (supported) {
            Linking.openURL(mailtoUrl);
          } else {
            Toast.show({ type: "error", text1: "No email app found." });
          }
        });
        actions.resetForm();
      })
      ?.catch(() => {
        Toast.show({ type: "error", text1: "Something went wrong." });
        setLoading(false);
      });
  };

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      {loading && <FullScreenLoader />}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
      >
        <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Feather name="arrow-left" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contact Us</Text>
            <View style={styles.iconButton} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <Formik
                initialValues={{ fullName: "", email: "", message: "" }}
                validationSchema={contactValidationSchema}
                onSubmit={(values, actions) => handleFormSubmit(values, actions)}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name</Text>
                      <TextInput
                        style={[styles.input, touched.fullName && errors.fullName && styles.inputError]}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.searchPlaceholder}
                        value={values.fullName}
                        onChangeText={handleChange("fullName")}
                        onBlur={handleBlur("fullName")}
                        autoCapitalize="words"
                      />
                      {touched.fullName && errors.fullName && (
                        <Text style={styles.errorText}>{errors.fullName}</Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={[styles.input, touched.email && errors.email && styles.inputError]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.searchPlaceholder}
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                      {touched.email && errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Message</Text>
                      <TextInput
                        style={[styles.input, styles.textArea, touched.message && errors.message && styles.inputError]}
                        placeholder="Enter your message"
                        placeholderTextColor={theme.colors.searchPlaceholder}
                        value={values.message}
                        onChangeText={handleChange("message")}
                        onBlur={handleBlur("message")}
                        multiline
                        numberOfLines={4}
                        blurOnSubmit={true}
                        returnKeyType="done"
                      />
                      {touched.message && errors.message && (
                        <Text style={styles.errorText}>{errors.message}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={theme.colors.white} />
                      ) : (
                        <Text style={styles.submitButtonText}>Submit</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.lightCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  inputError: {
    borderColor: theme.colors.red,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: theme.colors.red,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ContactUsScreen;
