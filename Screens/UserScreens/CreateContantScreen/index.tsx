import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";
import {
  Formik,
  FormikHelpers,
  FieldArray,
  FieldArrayRenderProps,
} from "formik"; // Added FieldArrayRenderProps
import { DatePickerModal } from "react-native-paper-dates";
import { en, registerTranslation } from "react-native-paper-dates";
registerTranslation("en", en);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Navigation & Props ---
type CreateContactScreenNavigationProp = { goBack: () => void };
interface CreateContactScreenProps {
  navigation: CreateContactScreenNavigationProp;
}

// --- Form Value Interfaces ---
interface ChildDetail {
  id: string;
  name: string;
  birthday: Date | undefined;
  details: string;
}
interface EmploymentDetail {
  id: string;
  employerName: string;
  employerDetails: string;
}
interface EducationDetail {
  id: string;
  universityName: string;
  universityDetails: string;
}
interface InterestDetail {
  id: string;
  value: string;
}
interface CustomField {
  id: string;
  title: string;
  value: string;
}

interface CreateContactFormValues {
  avatarUri: string | null;
  nameOrDescription: string;
  birthday: Date | undefined;
  anniversary: Date | undefined;
  email: string;
  number: string;
  spouseName: string;
  spouseBirthday: Date | undefined;
  spouseDetails: string;
  children: ChildDetail[];
  employmentHistory: EmploymentDetail[];
  educationHistory: EducationDetail[];
  interests: InterestDetail[];
  customFields: CustomField[];
}

// --- Initial Form State ---
const initialContactValues: CreateContactFormValues = {
  avatarUri: null,
  nameOrDescription: "",
  birthday: undefined,
  anniversary: undefined,
  email: "",
  number: "",
  spouseName: "",
  spouseBirthday: undefined,
  spouseDetails: "",
  children: [],
  employmentHistory: [
    { id: `emp-${Date.now()}`, employerName: "", employerDetails: "" },
  ],
  educationHistory: [
    { id: `edu-${Date.now()}`, universityName: "", universityDetails: "" },
  ],
  interests: [{ id: `interest-${Date.now()}`, value: "" }],
  customFields: [],
};

// --- Collapsible Section Component (no change) ---
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={toggleOpen} style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Feather
          name={isOpen ? "minus" : "plus"}
          size={20}
          color={theme.colors.white}
        />
      </TouchableOpacity>
      {isOpen && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// --- Main Screen Component ---
const CreateContactScreen: React.FC<CreateContactScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<{
    path: string;
    index?: number;
  } | null>(null);
  const [currentDateValue, setCurrentDateValue] = useState<Date | undefined>(
    undefined
  );

  const handleSearchPress = () => console.log("Search pressed");
  const handlePickImage = () =>
    Alert.alert("Image Picker", "Implement image picking functionality.");

  const handleFormSubmit = (
    values: CreateContactFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CreateContactFormValues>
  ) => {
    const submissionValues = { ...values, avatarUri: selectedAvatar };
    console.log("Create Contact form submitted:", submissionValues);
    setTimeout(() => {
      resetForm({ values: initialContactValues });
      setSelectedAvatar(null);
      setSubmitting(false);
    }, 2000);
  };

  const renderTextInput = (
    formikBag: any,
    name: string,
    label: string,
    placeholder: string,
    keyboardType: any = "default",
    multiline = false,
    numberOfLines = 1
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.grey}
        value={formikBag.values[name]}
        onChangeText={formikBag.handleChange(name)}
        onBlur={formikBag.handleBlur(name)}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );

  const openDatePicker = useCallback(
    (path: string, currentValue: Date | undefined, index?: number) => {
      setCurrentDateField({ path, index });
      setCurrentDateValue(currentValue || new Date());
      setDatePickerVisible(true);
    },
    []
  );
  const onDismissDatePicker = useCallback(() => {
    setDatePickerVisible(false);
    setCurrentDateField(null);
  }, []);
  const onConfirmDatePicker = useCallback(
    (params: { date: Date | undefined }, setFieldValue: Function) => {
      setDatePickerVisible(false);
      if (currentDateField && params.date) {
        if (currentDateField.index !== undefined) {
          const arrayName = currentDateField.path.split("[index]")[0];
          const fieldName = currentDateField.path.split(".")[1];
          setFieldValue(
            `${arrayName}[${currentDateField.index}].${fieldName}`,
            params.date
          );
        } else {
          setFieldValue(currentDateField.path, params.date);
        }
      }
      setCurrentDateField(null);
    },
    [currentDateField]
  );
  const renderPaperDateInput = (
    formikValues: any,
    setFieldValue: Function,
    fieldPath: string,
    label: string,
    placeholder: string,
    arrayIndex?: number
  ) => {
    let displayValue: Date | undefined;
    if (arrayIndex !== undefined) {
      const arrayName = fieldPath.split("[index]")[0];
      const actualFieldName = fieldPath.split(".")[1];
      displayValue = formikValues[arrayName]?.[arrayIndex]?.[actualFieldName];
    } else {
      displayValue = formikValues[fieldPath];
    }
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.dateInputDisplay}
          onPress={() => openDatePicker(fieldPath, displayValue, arrayIndex)}
        >
          <Text
            style={
              displayValue ? styles.dateInputText : styles.dateInputPlaceholder
            }
          >
            {displayValue ? displayValue.toLocaleDateString() : placeholder}
          </Text>
          <Feather name="calendar" size={20} color={theme.colors.grey} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150}
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
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Create a Contact</Text>
              <Formik
                initialValues={initialContactValues}
                onSubmit={handleFormSubmit}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  setFieldValue,
                  isSubmitting,
                }) => (
                  <>
                    <View style={styles.avatarSection}>
                      <TouchableOpacity
                        onPress={handlePickImage}
                        style={styles.avatarContainer}
                      >
                        {selectedAvatar ? (
                          <Image
                            source={{ uri: selectedAvatar }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Feather
                              name="user"
                              size={50}
                              color={theme.colors.secondary}
                            />
                          </View>
                        )}
                        <View style={styles.editIconContainer}>
                          <Feather
                            name="camera"
                            size={16}
                            color={theme.colors.white}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>

                    <CollapsibleSection
                      title="Personal Information"
                      initiallyOpen={true}
                    >
                      {renderTextInput(
                        { values, handleChange, handleBlur },
                        "nameOrDescription",
                        "Name or Description",
                        "Enter name or description"
                      )}
                      {renderPaperDateInput(
                        values,
                        setFieldValue,
                        "birthday",
                        "Birthday",
                        "Select Birthday"
                      )}
                      {renderPaperDateInput(
                        values,
                        setFieldValue,
                        "anniversary",
                        "Anniversary",
                        "Select Anniversary"
                      )}
                      {renderTextInput(
                        { values, handleChange, handleBlur },
                        "email",
                        "Email",
                        "Enter email",
                        "email-address"
                      )}
                      {renderTextInput(
                        { values, handleChange, handleBlur },
                        "number",
                        "Number",
                        "Enter number",
                        "phone-pad"
                      )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Family Details">
                      {renderTextInput(
                        { values, handleChange, handleBlur },
                        "spouseName",
                        "Spouse Name",
                        "Enter spouse name"
                      )}
                      {renderPaperDateInput(
                        values,
                        setFieldValue,
                        "spouseBirthday",
                        "Spouse Birthday",
                        "Select Spouse Birthday"
                      )}
                      {renderTextInput(
                        { values, handleChange, handleBlur },
                        "spouseDetails",
                        "Spouse Details",
                        "Enter spouse details",
                        "default",
                        true,
                        3
                      )}
                      <FieldArray name="children">
                        {(
                          arrayHelpers: FieldArrayRenderProps // CORRECTED
                        ) => (
                          <View>
                            {values.children.map((child, index) => (
                              <View
                                key={child.id}
                                style={styles.arrayEntryCard}
                              >
                                <View style={styles.arrayEntryHeader}>
                                  <Text style={styles.arrayEntryTitle}>
                                    Child {index + 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => arrayHelpers.remove(index)}
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={20}
                                      color={theme.colors.red}
                                    />
                                  </TouchableOpacity>
                                </View>
                                {renderTextInput(
                                  {
                                    values: child,
                                    handleChange:
                                      (field: string) => (val: string) =>
                                        setFieldValue(
                                          `children[${index}].${field}`,
                                          val
                                        ),
                                    handleBlur,
                                  },
                                  "name",
                                  "Child Name",
                                  "Enter child name"
                                )}
                                {renderPaperDateInput(
                                  values,
                                  setFieldValue,
                                  `children[index].birthday`,
                                  "Child Birthday",
                                  "Select Child Birthday",
                                  index
                                )}
                                {renderTextInput(
                                  {
                                    values: child,
                                    handleChange:
                                      (field: string) => (val: string) =>
                                        setFieldValue(
                                          `children[${index}].${field}`,
                                          val
                                        ),
                                    handleBlur,
                                  },
                                  "details",
                                  "Child Details",
                                  "Enter child details",
                                  "default",
                                  true,
                                  2
                                )}
                              </View>
                            ))}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `child-${Date.now()}`,
                                  name: "",
                                  birthday: undefined,
                                  details: "",
                                })
                              }
                            >
                              <Text style={styles.addArrayEntryButtonText}>
                                + Add Child
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </FieldArray>
                    </CollapsibleSection>

                    <CollapsibleSection title="Employment">
                      <FieldArray name="employmentHistory">
                        {(
                          arrayHelpers: FieldArrayRenderProps // CORRECTED
                        ) => (
                          <View>
                            {values.employmentHistory.map((job, index) => (
                              <View key={job.id} style={styles.arrayEntryCard}>
                                <View style={styles.arrayEntryHeader}>
                                  <Text style={styles.arrayEntryTitle}>
                                    Employment {index + 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => arrayHelpers.remove(index)}
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={20}
                                      color={theme.colors.red}
                                    />
                                  </TouchableOpacity>
                                </View>
                                {renderTextInput(
                                  {
                                    values: job,
                                    handleChange:
                                      (field: string) => (val: string) =>
                                        setFieldValue(
                                          `employmentHistory[${index}].${field}`,
                                          val
                                        ),
                                    handleBlur,
                                  },
                                  "employerName",
                                  "Employer Name",
                                  "Enter employer name"
                                )}
                                {renderTextInput(
                                  {
                                    values: job,
                                    handleChange:
                                      (field: string) => (val: string) =>
                                        setFieldValue(
                                          `employmentHistory[${index}].${field}`,
                                          val
                                        ),
                                    handleBlur,
                                  },
                                  "employerDetails",
                                  "Employer Details",
                                  "Enter employer details",
                                  "default",
                                  true,
                                  3
                                )}
                              </View>
                            ))}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `emp-${Date.now()}`,
                                  employerName: "",
                                  employerDetails: "",
                                })
                              }
                            >
                              <Text style={styles.addArrayEntryButtonText}>
                                + Add Employer
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </FieldArray>
                    </CollapsibleSection>

                    <CollapsibleSection title="Education">
                      <FieldArray name="educationHistory">
                        {(
                          arrayHelpers: FieldArrayRenderProps // CORRECTED
                        ) => (
                          <View>
                            {values.educationHistory.map((edu, index) => (
                              <View key={edu.id} style={styles.arrayEntryCard}>
                                <View style={styles.arrayEntryHeader}>
                                  <Text style={styles.arrayEntryTitle}>
                                    Education {index + 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => arrayHelpers.remove(index)}
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={20}
                                      color={theme.colors.red}
                                    />
                                  </TouchableOpacity>
                                </View>
                                {renderTextInput(
                                  {
                                    values: edu,
                                    handleChange:
                                      (field: string) => (val: string) =>
                                        setFieldValue(
                                          `educationHistory[${index}].${field}`,
                                          val
                                        ),
                                    handleBlur,
                                  },
                                  "universityName",
                                  "University/School Name",
                                  "Enter institution name"
                                )}
                                {renderTextInput(
                                  {
                                    values: edu,
                                    handleChange:
                                      (field: string) => (val: string) =>
                                        setFieldValue(
                                          `educationHistory[${index}].${field}`,
                                          val
                                        ),
                                    handleBlur,
                                  },
                                  "universityDetails",
                                  "Details (Degree, Year)",
                                  "Enter education details",
                                  "default",
                                  true,
                                  3
                                )}
                              </View>
                            ))}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `edu-${Date.now()}`,
                                  universityName: "",
                                  universityDetails: "",
                                })
                              }
                            >
                              <Text style={styles.addArrayEntryButtonText}>
                                + Add Education
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </FieldArray>
                    </CollapsibleSection>

                    <CollapsibleSection title="Interests">
                      <FieldArray name="interests">
                        {(
                          arrayHelpers: FieldArrayRenderProps // CORRECTED
                        ) => (
                          <View>
                            {values.interests.map((interest, index) => (
                              <View
                                key={interest.id}
                                style={styles.arrayEntryRow}
                              >
                                <TextInput
                                  style={[styles.input, styles.interestInput]}
                                  placeholder="Enter an interest"
                                  placeholderTextColor={theme.colors.grey}
                                  value={interest.value}
                                  onChangeText={handleChange(
                                    `interests[${index}].value`
                                  )}
                                  onBlur={handleBlur(
                                    `interests[${index}].value`
                                  )}
                                />
                                <TouchableOpacity
                                  onPress={() => arrayHelpers.remove(index)}
                                  style={styles.removeArrayEntryIcon}
                                >
                                  <Feather
                                    name="trash-2"
                                    size={20}
                                    color={theme.colors.red}
                                  />
                                </TouchableOpacity>
                              </View>
                            ))}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `interest-${Date.now()}`,
                                  value: "",
                                })
                              }
                            >
                              <Text style={styles.addArrayEntryButtonText}>
                                + Add Interest
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </FieldArray>
                    </CollapsibleSection>

                    <FieldArray name="customFields">
                      {(
                        arrayHelpers: FieldArrayRenderProps // CORRECTED
                      ) => (
                        <View>
                          {values.customFields.map((field, index) => (
                            <View key={field.id} style={styles.customFieldRow}>
                              <TextInput
                                style={[
                                  styles.input,
                                  styles.customFieldTitleInput,
                                ]}
                                placeholder="Field Title"
                                value={field.title}
                                onChangeText={handleChange(
                                  `customFields[${index}].title`
                                )}
                                onBlur={handleBlur(
                                  `customFields[${index}].title`
                                )}
                                placeholderTextColor={theme.colors.grey}
                              />
                              <TextInput
                                style={[
                                  styles.input,
                                  styles.customFieldValueInput,
                                ]}
                                placeholder="Field Value"
                                value={field.value}
                                onChangeText={handleChange(
                                  `customFields[${index}].value`
                                )}
                                onBlur={handleBlur(
                                  `customFields[${index}].value`
                                )}
                                placeholderTextColor={theme.colors.grey}
                              />
                              <TouchableOpacity
                                onPress={() => arrayHelpers.remove(index)}
                                style={styles.removeCustomFieldIcon}
                              >
                                <Feather
                                  name="x-circle"
                                  size={22}
                                  color={theme.colors.red}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity
                            style={styles.addCustomButton}
                            onPress={() =>
                              arrayHelpers.push({
                                id: `custom-${Date.now()}`,
                                title: "",
                                value: "",
                              })
                            }
                          >
                            <Text style={styles.addCustomButtonText}>
                              Add Custom Field
                            </Text>
                          </TouchableOpacity>
                          {values.customFields.length > 0 && (
                            <TouchableOpacity
                              style={[
                                styles.addCustomButton,
                                styles.removeLastCustomButton,
                              ]}
                              onPress={() =>
                                arrayHelpers.remove(
                                  values.customFields.length - 1
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.addCustomButtonText,
                                  styles.removeLastCustomButtonText,
                                ]}
                              >
                                Remove Last Custom Field
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </FieldArray>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={theme.colors.black} />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          Save Contact
                        </Text>
                      )}
                    </TouchableOpacity>

                    <DatePickerModal
                      locale="en"
                      mode="single"
                      visible={datePickerVisible}
                      onDismiss={onDismissDatePicker}
                      date={currentDateValue}
                      onConfirm={(params) =>
                        onConfirmDatePicker(params, setFieldValue)
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
  // ... (Styles remain the same as the previous correct version)
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logoImg: { width: "50%", height: 40, objectFit: "contain" },
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
  formCard: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginHorizontal: 15,
    width: "auto",
  },
  formTitle: {
    fontSize: 22,
    ...theme.font.fontBold,
    color: theme.colors.white,
    marginBottom: 20,
    paddingLeft: 5,
  },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 50 },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.secondary,
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  collapsibleSection: {
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  sectionHeaderText: {
    fontSize: 17,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  sectionContent: { paddingBottom: 10, paddingHorizontal: 5 },
  inputGroup: { marginBottom: 15 },
  label: {
    fontSize: 14,
    ...theme.font.fontMedium,
    color: theme.colors.white,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.black,
    height: 48,
  },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  dateInputDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  dateInputText: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  dateInputPlaceholder: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.grey,
  },
  arrayEntryCard: {
    backgroundColor: theme.colors.grey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  arrayEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  arrayEntryTitle: {
    fontSize: 15,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  addArrayEntryButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    alignItems: "flex-start",
    marginTop: 5,
  },
  addArrayEntryButtonText: {
    fontSize: 15,
    ...theme.font.fontMedium,
    color: theme.colors.primary,
  },
  arrayEntryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  interestInput: { flex: 1, marginRight: 10 },
  removeArrayEntryIcon: { padding: 5 },
  customFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  customFieldTitleInput: { flex: 0.4, marginRight: 10, height: 44 },
  customFieldValueInput: { flex: 0.6, height: 44 },
  removeCustomFieldIcon: { paddingLeft: 10 },
  addCustomButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  addCustomButtonText: {
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  removeLastCustomButton: { backgroundColor: theme.colors.grey },
  removeLastCustomButtonText: { color: theme.colors.white },
  submitButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    ...theme.font.fontBold,
    color: theme.colors.black,
  },
});

export default CreateContactScreen;
