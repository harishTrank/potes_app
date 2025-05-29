import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";
import { Formik } from "formik";
import * as Yup from "yup";
import DropDownComponent from "../../Components/DropDownComponent";

type CreateNoteScreenNavigationProp = {
  goBack: () => void;
};

interface CreateNoteScreenProps {
  navigation: CreateNoteScreenNavigationProp;
}

interface CreateNoteFormValues {
  contactId: string | null;
  noteText: string;
  reminderOption: string;
}

const createNoteValidationSchema = Yup.object().shape({
  contactId: Yup.string().nullable().required("Contact name is required"),
  noteText: Yup.string()
    .required("Note text is required")
    .min(5, "Note must be at least 5 characters"),
  reminderOption: Yup.string().required("Reminder option is required"), // No longer nullable if "None" is a default
});

const contactOptions = [
  { label: "Alice Smith", value: "alice_smith_id" },
  { label: "Bob Johnson", value: "bob_johnson_id" },
];

const reminderOptions = [
  { label: "None", value: "none" },
  { label: "1 hour before", value: "1_hour_before" },
  { label: "1 day before", value: "1_day_before" },
  { label: "Custom", value: "custom" },
];

const CreateNoteScreen: React.FC<CreateNoteScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleSearchPress = () => {
    console.log("Search icon pressed on Create Note screen");
  };

  const handleFormSubmit = (values: any, { setSubmitting, resetForm }: any) => {
    console.log("Create Note form submitted (labels stored):", values);
    setTimeout(() => {
      resetForm({
        values: { contactId: null, noteText: "", reminderOption: "None" },
      });
      setSubmitting(false);
    }, 2000);
  };

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
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
            <Image source={ImageModule.logo} style={styles.logoImg} />
            <TouchableOpacity
              onPress={handleSearchPress}
              style={styles.iconButton}
            >
              <Feather name="search" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScrollView}
            contentContainerStyle={[
              styles.formScrollContentContainer,
              { paddingBottom: insets.bottom + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Create a Note</Text>

              <Formik
                initialValues={{
                  contactId: null, // Null for placeholder to show
                  noteText: "",
                  reminderOption: "None", // Default selected value as per image
                }}
                validationSchema={createNoteValidationSchema}
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
                  setFieldValue,
                }) => (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Contact Name</Text>
                      <DropDownComponent
                        data={contactOptions}
                        value={values.contactId} // Expects the label string or null
                        setValue={(
                          selectedLabel: string | null // Will receive the label
                        ) => setFieldValue("contactId", selectedLabel)}
                        placeholder="Select any contact"
                        fieldKey="label" // Used for display and as valueField for Dropdown
                        objectSave={false} // To get item[fieldKey] directly
                        search={false} // As per image
                        style={[
                          styles.dropdownStyle,
                          touched.contactId &&
                            errors.contactId &&
                            styles.inputError,
                        ]}
                      />
                      {touched.contactId && errors.contactId && (
                        <Text style={styles.errorText}>{errors.contactId}</Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Enter the Note</Text>
                      <View
                        style={[
                          styles.textAreaContainer,
                          touched.noteText &&
                            errors.noteText &&
                            styles.inputErrorContainer,
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.input, // General input style (for padding, font)
                            styles.textArea,
                            // Error border is on textAreaContainer now
                          ]}
                          placeholder="Enter your note"
                          placeholderTextColor={theme.colors.grey}
                          value={values.noteText}
                          onChangeText={handleChange("noteText")}
                          onBlur={handleBlur("noteText")}
                          multiline
                          numberOfLines={5}
                        />
                      </View>
                      {touched.noteText && errors.noteText && (
                        <Text style={styles.errorText}>{errors.noteText}</Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Note reminder</Text>
                      <DropDownComponent
                        data={reminderOptions}
                        value={values.reminderOption} // Expects the label string like "None"
                        setValue={(selectedLabel: string) =>
                          setFieldValue("reminderOption", selectedLabel)
                        }
                        placeholder="Select reminder" // Will be overridden by initialValue "None"
                        fieldKey="label"
                        objectSave={false}
                        search={false}
                        style={[
                          styles.dropdownStyle,
                          touched.reminderOption &&
                            errors.reminderOption &&
                            styles.inputError,
                        ]}
                      />
                      {touched.reminderOption && errors.reminderOption && (
                        <Text style={styles.errorText}>
                          {errors.reminderOption}
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
                        <ActivityIndicator color={theme.colors.black} />
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
  logoImg: {
    width: "50%",
    height: 40,
    objectFit: "contain",
  },
  iconButton: {
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContentContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
  },
  formTitle: {
    fontSize: 22,
    ...theme.font.fontBold,
    color: theme.colors.white,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    ...theme.font.fontMedium,
    color: theme.colors.white,
    marginBottom: 8,
  },
  input: {
    // Base style for text inputs, for consistent padding/font if needed
    paddingHorizontal: 15, // Applied to TextInput within textAreaContainer
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  dropdownStyle: {
    // Style for the DropDownComponent itself
    height: 50,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 0, // Assuming DropDownComponent handles its own border or no border initially
    // DropDownComponent internal styles handle padding and text
  },
  textAreaContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    // Border for error state will be applied here
  },
  textArea: {
    flex: 1,
    height: 140,
    textAlignVertical: "top",
    paddingTop: 12,
    paddingRight: 40, // Space for mic
    backgroundColor: "transparent", // TextInput itself is transparent, container has bg
    // Removed specific paddingHorizontal here, will inherit from styles.input
  },
  voiceIcon: {
    position: "absolute",
    right: 10,
    top: 12,
    padding: 5,
  },
  inputError: {
    // For DropDownComponent and other direct inputs if needed
    borderColor: theme.colors.red,
    borderWidth: 1.5, // Make error border visible
  },
  inputErrorContainer: {
    // For containers like textAreaContainer
    borderColor: theme.colors.red,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.red,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: theme.colors.white,
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
    backgroundColor: theme.colors.grey, // Using theme.colors.grey instead of lightGrey
    opacity: 0.7,
  },
});

export default CreateNoteScreen;
