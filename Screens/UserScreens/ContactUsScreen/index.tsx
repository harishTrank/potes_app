import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator, // For submit button loading state
  Platform, // For KeyboardAvoidingView
  KeyboardAvoidingView,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground"; // Path from AboutUsScreen
import theme from "../../../utils/theme"; // Path from AboutUsScreen
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule"; // Path from AboutUsScreen
import { Formik, FormikHelpers } from "formik"; // For form handling
import * as Yup from "yup"; // For validation
import { contactUsApi } from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import Toast from "react-native-toast-message";

type ContactUsScreenNavigationProp = {
  goBack: () => void;
};

interface ContactUsScreenProps {
  navigation: ContactUsScreenNavigationProp;
}

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

const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
  navigation,
}: any) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading]: any = useState(false);

  const handleSearchPress = () => {
    navigation.navigate("SearchResultScreen", { searchQuery: "" });
  };

  const handleFormSubmit = (values: ContactFormValues) => {
    setLoading(true);
    contactUsApi({
      body: {
        full_name: values?.fullName,
        email: values?.email,
        message: values?.message,
      },
    })
      ?.then((res: any) => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: res?.msg,
        });
        navigation?.goBack();
      })
      ?.catch(() => {
        Toast.show({
          type: "error",
          text1: "Something went wrong.",
        });
        setLoading(false);
      });
  };

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      {loading && <FullScreenLoader />}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100} // Adjust as needed
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
            >
              <Feather
                name="chevron-left"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnlogoImg}
              onPress={() => navigation.navigate("HomeScreen")}
            >
              <Image style={styles.logoImg} source={ImageModule.logo} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSearchPress}
              style={styles.iconButton}
            >
              <Feather name="search" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScrollView} // Use a ScrollView for the form area
            contentContainerStyle={[
              styles.formScrollContentContainer,
              { paddingBottom: insets.bottom + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Contact Us</Text>

              <Formik
                initialValues={{ fullName: "", email: "", message: "" }}
                validationSchema={contactValidationSchema}
                onSubmit={handleFormSubmit}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isSubmitting,
                }) => (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name</Text>
                      <TextInput
                        style={[
                          styles.input,
                          touched.fullName &&
                            errors.fullName &&
                            styles.inputError,
                        ]}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.grey}
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
                        style={[
                          styles.input,
                          touched.email && errors.email && styles.inputError,
                        ]}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.grey}
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
                        style={[
                          styles.input,
                          styles.textArea,
                          touched.message &&
                            errors.message &&
                            styles.inputError,
                        ]}
                        placeholder="Enter your message"
                        placeholderTextColor={theme.colors.grey}
                        value={values.message}
                        onChangeText={handleChange("message")}
                        onBlur={handleBlur("message")}
                        multiline
                        numberOfLines={4} // Suggests initial height
                      />
                      {touched.message && errors.message && (
                        <Text style={styles.errorText}>{errors.message}</Text>
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
                        <ActivityIndicator color={theme.colors.black} /> // Dark indicator on light button
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
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iconButton: {
    backgroundColor: theme.colors.secondary, // Dark grey buttons
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  formScrollView: {
    flex: 1, // Takes up remaining space
  },
  formScrollContentContainer: {
    paddingHorizontal: 15, // Margin for the card
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: theme.colors.secondary, // Dark grey card
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%", // Take full width of its container
  },
  formTitle: {
    fontSize: 22, // Larger title for the form
    ...theme.font.fontBold,
    color: theme.colors.white,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    ...theme.font.fontMedium,
    color: theme.colors.white, // White labels on dark card
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white, // White input fields
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12, // Standard padding
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black, // Dark text in input fields
    height: 50, // Standard height for single line inputs
  },
  textArea: {
    height: 120, // Taller for message input
    textAlignVertical: "top", // Start text from top in multiline
    paddingTop: 12, // Ensure padding is from top
  },
  inputError: {
    borderColor: theme.colors.red, // Red border for errors
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.red, // Red error text (consider changing to a light red for dark bg)
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: theme.colors.white, // White submit button
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 18,
    ...theme.font.fontBold,
    color: theme.colors.black,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.grey,
    opacity: 0.7,
  },
  logoImg: {
    resizeMode: "contain",
    width: "50%",
    height: 40,
  },
  btnlogoImg: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 40,
  },
});

export default ContactUsScreen;
