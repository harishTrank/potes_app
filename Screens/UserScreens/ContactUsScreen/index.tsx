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
  Alert,
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
import { getImage, getfileobj, takePicture } from "../../../utils/ImagePicker";
import FastImage from "react-native-fast-image";

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
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);

  const handleChangePhoto = () => {
    Alert.alert("Pick Image", "Choose from camera or gallery", [
      { text: "Gallery", onPress: () => getImage(setSelectedPhotoUri), style: "default" },
      { text: "Camera", onPress: async () => await takePicture(setSelectedPhotoUri), style: "default" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleFormSubmit = (
    values: ContactFormValues,
    actions: FormikHelpers<ContactFormValues>
  ) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", values.fullName);
    formData.append("email", values.email);
    formData.append("message", values.message);
    if (selectedPhotoUri) {
      formData.append("attachment", getfileobj(selectedPhotoUri));
    }
    contactUsApi({
      body: formData,
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
        setSelectedPhotoUri(null);
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
                    <TouchableOpacity style={styles.avatarSection} onPress={handleChangePhoto}>
                      <View style={styles.avatarContainer}>
                        {selectedPhotoUri ? (
                          <FastImage source={{ uri: selectedPhotoUri, priority: FastImage.priority.normal }} style={styles.avatarImage} />
                        ) : (
                          <Feather name="image" size={32} color={theme.colors.greyText} />
                        )}
                        <View style={styles.cameraBtn}>
                          <Feather name="camera" size={14} color={theme.colors.white} />
                        </View>
                      </View>
                      <Text style={styles.addPhotoText}>ATTACH A PHOTO</Text>
                    </TouchableOpacity>

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
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.lightCard,
    position: "relative",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 45 },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoText: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.greyText,
    marginTop: 8,
    letterSpacing: 0.5,
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
