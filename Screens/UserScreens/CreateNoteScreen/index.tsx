import React, { useEffect, useState, useCallback } from "react";
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
  FlatList,
  Keyboard,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  allContactOptionApi,
  createNotesApi,
  editNote,
  postAiChat,
} from "../../../store/Services/Others";
import { DatePickerModal } from "react-native-paper-dates";
import { en, registerTranslation } from "react-native-paper-dates";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useAtom } from "jotai";
import { homeNoteEditGlobal } from "../../../jotaiStore";

dayjs.extend(utc);
registerTranslation("en", en);

const createNoteValidationSchema = Yup.object().shape({
  contactId: Yup.mixed().nullable().required("Contact name is required"),
  noteText: Yup.string().required("Note text is required").min(5, "Note must be at least 5 characters"),
  reminderOption: Yup.string().required("Reminder option is required"),
  customReminderDate: Yup.date().when("reminderOption", {
    is: "Custom",
    then: (schema) => schema.required("Custom reminder date is required").nullable(),
    otherwise: (schema) => schema.nullable(),
  }),
});

const CreateNoteScreen: any = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const item = route?.params?.note ?? null;
  const contact_name = route?.params?.note?.contact_full_name || route?.params?.contactName;
  const [contactNames, setContactNames]: any = useState([]);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isContactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [globalNoteFlag, setGlobalNoteFlag]: any = useAtom(homeNoteEditGlobal);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [initialValues, setInitialValues]: any = useState({
    contactId: item?.contact_id || route?.params?.contactId || null,
    contactName: item?.contact_full_name || contact_name || "Select contact",
    noteText: "",
    reminderOption: "None",
    customReminderDate: undefined,
  });

  const filteredContacts = contactNames.filter((c: any) =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    allContactOptionApi()
      .then((res: any) => setContactNames(res?.contacts))
      .catch((err: any) => Toast.show({ type: "error", text1: err?.data?.details }));
  }, []);

  useEffect(() => {
    if (route?.params?.note?.id) {
      setInitialValues({
        contactId: route?.params?.note?.contact,
        contactName: route?.params?.note?.contact_full_name,
        noteText: route?.params?.note?.note,
        reminderOption: route?.params?.note?.reminder_type || "None",
        customReminderDate:
          route?.params?.note?.reminder === null
            ? new Date()
            : dayjs.utc(route.params.note.reminder).toDate(),
      });
    }
  }, [route?.params?.note?.id]);

  useEffect(() => {
    if (route?.params?.type === "AddNote") {
      setInitialValues({
        contactId: route?.params?.contactId,
        contactName: route?.params?.contactName,
        noteText: "",
        reminderOption: "None",
        customReminderDate: undefined,
      });
    }
  }, [route?.params?.type]);

  const handleFormSubmit = (values: any) => {
    const payload = {
      contact: values.contactId,
      note: values.noteText,
      reminder_type: values.reminderOption === "None" ? null : values.reminderOption,
      reminder:
        values.reminderOption === "Custom"
          ? dayjs(values.customReminderDate).format("YYYY-MM-DD")
          : null,
    };
    if (route?.params?.type === "edit") {
      editNote({ query: { id: route?.params?.note?.id }, body: payload })
        ?.then(() => {
          Toast.show({ type: "success", text1: "Note edited successfully." });
          if (globalNoteFlag) {
            setGlobalNoteFlag(false);
            navigation.navigate("DrawerNavigation");
          } else {
            navigation.goBack();
          }
        })
        ?.catch(() => Toast.show({ type: "error", text1: "All fields are required." }));
    } else {
      createNotesApi({ body: payload })
        ?.then((res: any) => {
          Toast.show({ type: "success", text1: res.msg });
          navigation.goBack();
        })
        ?.catch((err: any) => Toast.show({ type: "error", text1: err?.data?.error }));
    }
  };

  const onDismissDatePicker = useCallback(() => setDatePickerVisible(false), []);
  const onConfirmCustomDate = useCallback((params: { date: Date | undefined }, setFieldValue: Function) => {
    setDatePickerVisible(false);
    if (params.date) setFieldValue("customReminderDate", params.date);
  }, []);

  const AI_PROMPTS: Record<string, string> = {
    cleanup: "Clean up and improve the following note. Keep it concise and professional. Return only the improved note text, no explanations:\n\n",
    summarize: "Summarize the following note in 2-3 sentences. Return only the summary, no explanations:\n\n",
    commitments: "Extract all commitments and action items from the following note as a short bulleted list. Return only the list, no explanations:\n\n",
  };

  const handleAiAssist = (action: string, noteText: string, setFieldValue: Function) => {
    if (!noteText.trim()) {
      Toast.show({ type: "error", text1: "Please enter a note first." });
      return;
    }
    setAiLoading(action);
    postAiChat({
      body: {
        message: AI_PROMPTS[action] + noteText,
        query: AI_PROMPTS[action] + noteText,
        conversation_id: null,
      },
    })
      .then((res: any) => {
        const result = res?.ui?.message || res?.response;
        if (result) setFieldValue("noteText", result);
      })
      .catch(() => Toast.show({ type: "error", text1: "AI assist failed. Please try again." }))
      .finally(() => setAiLoading(null));
  };

  const isEdit = route?.params?.type === "edit";

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.headerRow, { paddingTop: insets.top + 6 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? "Edit Note" : "Create Note"}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={createNoteValidationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }: any) => (
              <View style={{ paddingHorizontal: 16 }}>

                {/* ASSOCIATE CONTACT */}
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>ASSOCIATE CONTACT</Text>
                  <TouchableOpacity
                    style={styles.contactSelector}
                    onPress={() => setContactDropdownOpen(!isContactDropdownOpen)}
                  >
                    <View style={styles.contactSelectorInner}>
                      <View style={styles.contactAvatarSmall}>
                        <Text style={styles.contactAvatarText}>
                          {initialValues.contactName?.[0]?.toUpperCase() || "?"}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.contactSelectorName}>{initialValues.contactName}</Text>
                      </View>
                    </View>
                    <Feather name={isContactDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.greyText} />
                  </TouchableOpacity>
                  {touched.contactId && errors.contactId && (
                    <Text style={styles.errorText}>{errors.contactId as string}</Text>
                  )}
                  {isContactDropdownOpen && (
                    <View style={styles.dropdownArea}>
                      <TextInput
                        style={styles.dropdownSearch}
                        placeholder="Search contacts..."
                        placeholderTextColor={theme.colors.greyText}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                      />
                      <FlatList
                        data={filteredContacts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              setInitialValues({ ...initialValues, contactName: item?.full_name, contactId: item?.id });
                              setFieldValue("contactId", item?.id);
                              setContactDropdownOpen(false);
                              setSearchTerm("");
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{item.full_name}</Text>
                          </TouchableOpacity>
                        )}
                        style={{ maxHeight: 180 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                      />
                    </View>
                  )}
                </View>

                {/* NOTE */}
                <View style={styles.card}>
                  <View style={styles.noteLabelRow}>
                    <Text style={styles.cardLabel}>ENTER THE NOTE</Text>
                    <TouchableOpacity
                      style={styles.newLineBtn}
                      onPress={() => setFieldValue("noteText", values.noteText + "\n")}
                    >
                      <Feather name="corner-down-left" size={13} color={theme.colors.primary} />
                      <Text style={styles.newLineBtnText}>New Line</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.noteInput, touched.noteText && errors.noteText && styles.inputError]}
                    placeholder="Start typing your note here..."
                    placeholderTextColor={theme.colors.grey}
                    value={values.noteText}
                    onChangeText={handleChange("noteText")}
                    onBlur={handleBlur("noteText")}
                    multiline
                    numberOfLines={6}
                    returnKeyType="done"
                    submitBehavior="blurAndSubmit"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    textAlignVertical="top"
                  />
                  {touched.noteText && errors.noteText && (
                    <Text style={styles.errorText}>{errors.noteText as string}</Text>
                  )}
                </View>

                {/* SET REMINDER */}
                <View style={styles.card}>
                  <View style={styles.reminderLabelRow}>
                    <Text style={styles.cardLabel}>SET REMINDER</Text>
                    <Feather name="bell" size={16} color={theme.colors.greyText} />
                  </View>
                  <View style={styles.reminderToggleRow}>
                    <TouchableOpacity
                      style={[styles.reminderToggle, values.reminderOption === "None" && styles.reminderToggleActive]}
                      onPress={() => { setFieldValue("reminderOption", "None"); setFieldValue("customReminderDate", undefined); }}
                    >
                      <Feather name="calendar" size={14} color={values.reminderOption === "None" ? theme.colors.white : theme.colors.primary} />
                      <Text style={[styles.reminderToggleText, values.reminderOption === "None" && styles.reminderToggleTextActive]}>None</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reminderToggle, values.reminderOption === "Custom" && styles.reminderToggleActive]}
                      onPress={() => setFieldValue("reminderOption", "Custom")}
                    >
                      <Feather name="calendar" size={14} color={values.reminderOption === "Custom" ? theme.colors.white : theme.colors.primary} />
                      <Text style={[styles.reminderToggleText, values.reminderOption === "Custom" && styles.reminderToggleTextActive]}>Custom</Text>
                    </TouchableOpacity>
                  </View>
                  {values.reminderOption === "Custom" && (
                    <TouchableOpacity
                      style={[styles.dateDisplay, touched.customReminderDate && errors.customReminderDate && styles.inputError]}
                      onPress={() => setDatePickerVisible(true)}
                    >
                      <Text style={values.customReminderDate ? styles.dateText : styles.datePlaceholder}>
                        {values.customReminderDate ? dayjs(values.customReminderDate).format("MM-DD-YYYY") : "MM-DD-YYYY"}
                      </Text>
                      <Feather name="calendar" size={18} color={theme.colors.greyText} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* AI ASSIST */}
                <View style={styles.card}>
                  <View style={styles.aiAssistHeader}>
                    <MaterialCommunityIcons name="star-four-points" size={16} color={theme.colors.primary} />
                    <Text style={styles.aiAssistLabel}> AI ASSIST</Text>
                  </View>
                  <Text style={styles.aiAssistSub}>Tap a button to refine your note using AI.</Text>
                  <View style={styles.aiChipsRow}>
                    <TouchableOpacity
                      style={[styles.aiChip, aiLoading === "cleanup" && styles.aiChipLoading]}
                      onPress={() => handleAiAssist("cleanup", values.noteText, setFieldValue)}
                      disabled={!!aiLoading}
                    >
                      {aiLoading === "cleanup" ? (
                        <ActivityIndicator size={13} color={theme.colors.primary} />
                      ) : (
                        <MaterialCommunityIcons name="star-four-points" size={13} color={theme.colors.primary} />
                      )}
                      <Text style={styles.aiChipText}> Clean up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiChip, aiLoading === "summarize" && styles.aiChipLoading]}
                      onPress={() => handleAiAssist("summarize", values.noteText, setFieldValue)}
                      disabled={!!aiLoading}
                    >
                      {aiLoading === "summarize" ? (
                        <ActivityIndicator size={13} color={theme.colors.primary} />
                      ) : (
                        <Feather name="align-left" size={13} color={theme.colors.primary} />
                      )}
                      <Text style={styles.aiChipText}> Summarize</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.aiChip, aiLoading === "commitments" && styles.aiChipLoading]}
                      onPress={() => handleAiAssist("commitments", values.noteText, setFieldValue)}
                      disabled={!!aiLoading}
                    >
                      {aiLoading === "commitments" ? (
                        <ActivityIndicator size={13} color={theme.colors.primary} />
                      ) : (
                        <Feather name="check-square" size={13} color={theme.colors.primary} />
                      )}
                      <Text style={styles.aiChipText}> Commitments</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* SAVE BUTTON */}
                <TouchableOpacity
                  style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.saveBtnText}>SAVE NOTE</Text>
                  )}
                </TouchableOpacity>

                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={datePickerVisible}
                  onDismiss={onDismissDatePicker}
                  date={values?.customReminderDate}
                  onConfirm={(params) => onConfirmCustomDate(params, setFieldValue)}
                />
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.lightBackground,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: theme.colors.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    ...theme.elevationLight,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.greyText,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  contactSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.lightCard,
    borderRadius: 10,
    padding: 10,
  },
  contactSelectorInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.avatarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  contactAvatarText: { fontSize: 14, fontFamily: "Poppins-Bold", color: theme.colors.white },
  contactSelectorName: { fontSize: 15, fontFamily: "Poppins-SemiBold", color: theme.colors.text },
  dropdownArea: { backgroundColor: theme.colors.white, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: theme.colors.border },
  dropdownSearch: { padding: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border, fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.text },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  dropdownItemText: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.text },
  noteLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  newLineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  newLineBtnText: { fontSize: 11, fontFamily: "Poppins-SemiBold", color: theme.colors.primary },
  noteInput: {
    minHeight: 130,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    backgroundColor: theme.colors.lightCard,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
  },
  inputError: { borderWidth: 1.5, borderColor: theme.colors.red },
  errorText: { fontSize: 12, color: theme.colors.red, marginTop: 4 },
  reminderLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  reminderToggleRow: { flexDirection: "row", gap: 10 },
  reminderToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    gap: 6,
  },
  reminderToggleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  reminderToggleText: { fontSize: 13, fontFamily: "Poppins-SemiBold", color: theme.colors.primary },
  reminderToggleTextActive: { color: theme.colors.white },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.lightCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginTop: 12,
  },
  dateText: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.text },
  datePlaceholder: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.grey },
  aiAssistHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  aiAssistLabel: { fontSize: 13, fontFamily: "Poppins-SemiBold", color: theme.colors.primary },
  aiAssistSub: { fontSize: 12, fontFamily: "Poppins-Regular", color: theme.colors.greyText, marginBottom: 10 },
  aiChipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.lightCard,
  },
  aiChipText: { fontSize: 12, fontFamily: "Poppins-Medium", color: theme.colors.primary },
  aiChipLoading: { opacity: 0.6 },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  saveBtnText: { fontSize: 16, fontFamily: "Poppins-Bold", color: theme.colors.white, letterSpacing: 1 },
  btnDisabled: { opacity: 0.6 },
});

export default CreateNoteScreen;
