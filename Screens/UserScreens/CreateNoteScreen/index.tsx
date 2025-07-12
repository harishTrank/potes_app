import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
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
import {
  allContactOptionApi,
  createNotesApi,
  editNote,
} from "../../../store/Services/Others";
import { DatePickerModal } from "react-native-paper-dates"; // Import DatePickerModal
import { en, registerTranslation } from "react-native-paper-dates"; // For localization
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
registerTranslation("en", en); // Register English locale

const createNoteValidationSchema = Yup.object().shape({
  contactId: Yup.mixed().nullable().required("Contact name is required"),
  noteText: Yup.string()
    .required("Note text is required")
    .min(5, "Note must be at least 5 characters"),
  reminderOption: Yup.string().required("Reminder option is required"),
  customReminderDate: Yup.date().when("reminderOption", {
    is: "Custom", // Condition: if reminderOption is "Custom"
    then: (schema) =>
      schema.required("Custom reminder date is required").nullable(), // Then customReminderDate is required
    otherwise: (schema) => schema.nullable(), // Otherwise, it's optional
  }),
});

const reminderOptions = [
  { label: "None", value: "none" },
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Yearly", value: "Yearly" },
  { label: "Custom", value: "Custom" },
];

const CreateNoteScreen: any = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<any>([]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [initialValues, setInitialValues]: any = useState({
    contactId: null,
    noteText: "",
    reminderOption: "None",
    customReminderDate: undefined,
  });

  useEffect(() => {
    if (route?.params?.note?.id) {
      setInitialValues({
        contactId: route?.params?.note?.contact,
        noteText: route?.params?.note?.note,
        reminderOption: route?.params?.note?.reminder_type,
        customReminderDate:
          route?.params?.note?.reminder === null
            ? new Date()
            : new Date(route?.params?.note?.reminder),
      });
    }
  }, [route?.params?.note?.id]);

  useEffect(() => {
    allContactOptionApi()
      ?.then((res: any) => {
        setContacts(res?.contacts || []);
      })
      ?.catch((err: any) => {
        console.log("Error fetching contacts:", err);
        setContacts([]);
      });
  }, []);

  const handleSearchPress = () => {
    navigation.navigate("SearchResultScreen", { searchQuery: "" });
  };

  const handleFormSubmit = (values: any) => {
    const payload = {
      contact: values.contactId,
      note: values.noteText,
      reminder_type:
        values.reminderOption === "None" ? null : values.reminderOption,
      reminder:
        values.reminderOption === "Custom"
          ? dayjs(values.customReminderDate).format("YYYY-MM-DD")
          : null,
    };
    if (route?.params?.type === "edit") {
      editNote({
        query: {
          id: route?.params?.note?.id,
        },
        body: payload,
      })
        ?.then((res: any) => {
          Toast.show({
            type: "success",
            text1: "Note edit successfully.",
          });
          navigation.goBack();
        })
        ?.catch((err: any) => {
          Toast.show({
            type: "error",
            text1: "All fields are required.",
          });
        });
    } else {
      createNotesApi({
        body: payload,
      })
        ?.then((res: any) => {
          Toast.show({
            type: "success",
            text1: res.msg,
          });
          navigation.goBack();
        })
        ?.catch((err: any) => {
          Toast.show({
            type: "error",
            text1: err.data.error,
          });
        });
    }
  };

  const onDismissDatePicker = useCallback(() => {
    setDatePickerVisible(false);
  }, []);
  const onConfirmCustomDate = useCallback(
    (params: { date: Date | undefined }, setFieldValue: Function) => {
      setDatePickerVisible(false);
      if (params.date) {
        setFieldValue("customReminderDate", params.date);
      }
    },
    []
  );

  useEffect(() => {
    if (route?.params?.type === "AddNote") {
      setInitialValues({
        contactId: route?.params?.contactId,
        noteText: "",
        reminderOption: "None",
        customReminderDate: undefined,
      });
    }
  }, [route?.params?.type]);

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
            <TouchableOpacity
              style={styles.btnlogoImg}
              onPress={() => navigation.navigate("DrawerNavigation")}
            >
              <Image source={ImageModule.logo} style={styles.logoImg} />
            </TouchableOpacity>
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
              <Text style={styles.formTitle}>{`${
                route?.params?.type === "edit" ? "Edit" : "Create"
              } a Note`}</Text>

              <Formik
                initialValues={initialValues}
                validationSchema={createNoteValidationSchema}
                onSubmit={handleFormSubmit}
                enableReinitialize
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
                        data={contacts}
                        disable={route?.params?.type === "AddNote"}
                        value={
                          values.contactId
                            ? contacts.find(
                                (c: any) => c.id === values.contactId
                              )?.full_name || null
                            : null
                        }
                        setValue={(selectedFullName: string | null) => {
                          if (selectedFullName) {
                            const selectedContact = contacts.find(
                              (c: any) => c.full_name === selectedFullName
                            );
                            setFieldValue(
                              "contactId",
                              selectedContact ? selectedContact.id : null
                            );
                          } else {
                            setFieldValue("contactId", null);
                          }
                        }}
                        placeholder="Select any contact"
                        fieldKey="full_name"
                        objectSave={false}
                        search={true}
                        style={[
                          styles.dropdownStyle,
                          touched.contactId &&
                            errors.contactId &&
                            styles.inputError,
                        ]}
                      />
                      {touched.contactId && errors.contactId && (
                        <Text style={styles.errorText}>
                          {errors.contactId as string}
                        </Text>
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
                          style={[styles.input, styles.textArea]}
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
                        <Text style={styles.errorText}>
                          {errors.noteText as string}
                        </Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{`Note reminder`}</Text>
                      <DropDownComponent
                        data={reminderOptions}
                        value={values.reminderOption}
                        setValue={(selectedValue: string) => {
                          setFieldValue("reminderOption", selectedValue);
                          if (selectedValue !== "Custom") {
                            setFieldValue("customReminderDate", undefined);
                          }
                        }}
                        placeholder="Select reminder type"
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
                          {errors.reminderOption as string}
                        </Text>
                      )}
                    </View>

                    {/* Conditionally Render Custom Date Picker */}
                    {values.reminderOption === "Custom" && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Set a Reminder</Text>
                        <TouchableOpacity
                          style={[
                            styles.dateInputDisplay,
                            touched.customReminderDate &&
                              errors.customReminderDate &&
                              styles.inputError,
                          ]}
                          onPress={() => setDatePickerVisible(true)}
                        >
                          <Text
                            style={
                              values.customReminderDate
                                ? styles.dateInputText
                                : styles.dateInputPlaceholder
                            }
                          >
                            {values?.customReminderDate
                              ? dayjs(values.customReminderDate).format(
                                  "YYYY-MM-DD"
                                )
                              : "YYYY-MM-DD"}
                          </Text>
                          <Feather
                            name="calendar"
                            size={20}
                            color={theme.colors.grey}
                          />
                        </TouchableOpacity>
                        {touched.customReminderDate &&
                          errors.customReminderDate && (
                            <Text style={styles.errorText}>
                              {errors.customReminderDate as string}
                            </Text>
                          )}
                      </View>
                    )}

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

                    <DatePickerModal
                      locale="en"
                      mode="single"
                      visible={datePickerVisible}
                      onDismiss={onDismissDatePicker}
                      date={values?.customReminderDate}
                      onConfirm={(params) =>
                        onConfirmCustomDate(params, setFieldValue)
                      }
                    />
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
  // ... (Your existing styles)
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logoImg: { width: "70%", resizeMode: "contain" },
  btnlogoImg: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 40,
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
  formScrollView: { flex: 1 },
  formScrollContentContainer: { paddingHorizontal: 15, paddingTop: 10 },
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
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 15,
    ...theme.font.fontMedium,
    color: theme.colors.white,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 15,
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  dropdownStyle: {
    height: 50,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    borderWidth: 0,
  },
  textAreaContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    position: "relative" /* For voice icon */,
  },
  textArea: {
    flex: 1,
    height: 140,
    textAlignVertical: "top",
    paddingTop: 12,
    paddingHorizontal: 15 /* Added paddingHorizontal */,
    backgroundColor: "transparent",
  },
  voiceIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 5,
    zIndex: 1,
  },
  inputError: { borderColor: theme.colors.red, borderWidth: 1.5 },
  inputErrorContainer: { borderColor: theme.colors.red, borderWidth: 1.5 },
  errorText: { fontSize: 13, color: theme.colors.red, marginTop: 5 },
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
  buttonDisabled: { backgroundColor: theme.colors.grey, opacity: 0.7 },
  dateInputDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  dateInputText: {
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  dateInputPlaceholder: {
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.grey,
  },
});

export default CreateNoteScreen;
