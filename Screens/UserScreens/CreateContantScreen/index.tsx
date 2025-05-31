import React, { useState, useCallback, useEffect } from "react";
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
import { Formik, FieldArray, FieldArrayRenderProps } from "formik";
import { DatePickerModal } from "react-native-paper-dates";
import { en, registerTranslation } from "react-native-paper-dates";
import { getImage, getfileobj, takePicture } from "../../../utils/ImagePicker"; // Assuming these are correct
import Toast from "react-native-toast-message";
import {
  createContactApi,
  editContactApi,
} from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
// import { createContactApi } from "../../../store/Services/Others"; // Assuming this is correct

registerTranslation("en", en);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const CollapsibleSection: any = ({
  title,
  children,
  initiallyOpen = false,
}: any) => {
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
const CreateContactScreen: any = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const [selectedAvatarFileUri, setSelectedAvatarFileUri] = useState<
    string | null
  >(null); // Store file URI
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<{
    path: string;
    index?: number;
  } | null>(null);
  const [currentDateValue, setCurrentDateValue] = useState<Date | undefined>(
    undefined
  );
  const [loading, setLoading]: any = useState(false);
  const [initialContactValues, setInitialContactValues]: any = useState({
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
    employmentHistory: [{ id: `emp-${Date.now()}`, name: "", details: "" }],
    educationHistory: [{ id: `edu-${Date.now()}`, name: "", details: "" }],
    interests: [{ id: `interest-${Date.now()}`, name: "" }],
    customFields: [],
  });

  const handleSearchPress = () =>
    navigation.navigate("SearchResultScreen", { searchQuery: "" });
  const parseApiDate = (
    dateString: string | null | undefined
  ): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };
  useEffect(() => {
    const contactToEdit = route.params?.contactData;
    const type = route.params?.type;

    if (type === "edit" && contactToEdit) {
      setInitialContactValues({
        avatarUri: null,
        nameOrDescription: contactToEdit.full_name || "",
        birthday: parseApiDate(contactToEdit.birthday),
        anniversary: parseApiDate(contactToEdit.anniversary),
        email: contactToEdit.email || "",
        number: contactToEdit.phone || "",
        spouseName: contactToEdit.spouse_name || "",
        spouseBirthday: parseApiDate(contactToEdit.spouse_birthday),
        spouseDetails: contactToEdit.spouse_details || "",
        children:
          contactToEdit.children?.map((c: any) => ({
            id: c.id?.toString() || `child-${Date.now()}-${Math.random()}`, // Ensure unique ID
            name: c.name || "",
            birthday: parseApiDate(c.birthday),
            details: c.details || "",
          })) || [],
        employmentHistory:
          contactToEdit.previous_employers?.map((e: any) => ({
            id: e.id?.toString() || `emp-${Date.now()}-${Math.random()}`,
            name: e.name || "",
            details: e.details || "",
          })) || [],
        educationHistory:
          contactToEdit.universities?.map((e: any) => ({
            id: e.id?.toString() || `edu-${Date.now()}-${Math.random()}`,
            name: e.name || "",
            details: e.details || "",
          })) || [],
        interests:
          contactToEdit.interests?.map((i: any) => ({
            id: i.id?.toString() || `interest-${Date.now()}-${Math.random()}`,
            name: i.name || "", // Assuming API returns 'name' for interest
          })) || [],
        customFields:
          contactToEdit.custom_fields?.map((cf: any) => ({
            id: cf.id?.toString() || `custom-${Date.now()}-${Math.random()}`,
            title: cf.title || "",
            values: Array.isArray(cf.values) ? cf.values.map(String) : [], // Ensure values is array of strings
          })) || [],
      });
      if (contactToEdit.photo) {
        setSelectedAvatarFileUri(contactToEdit.photo);
        setSelectedAvatarFileUri(contactToEdit.photo);
      }
    }
  }, [route.params?.contactData, route.params?.type]);

  const formatDateToYYYYMMDD = (
    date: Date | undefined | null
  ): string | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleFormSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    const formData = new FormData();
    setLoading(true);
    formData.append("full_name", values.nameOrDescription);
    formData.append("phone", values.number);
    if (values.birthday) {
      formData.append("birthday", formatDateToYYYYMMDD(values.birthday)!);
    }
    formData.append("email", values.email);
    formData.append("spouse_name", values.spouseName);
    if (values.spouseBirthday) {
      formData.append(
        "spouse_birthday",
        formatDateToYYYYMMDD(values.spouseBirthday)!
      );
    }
    if (values.anniversary)
      formData.append("anniversary", formatDateToYYYYMMDD(values.anniversary)!);
    formData.append("spouse_details", values.spouseDetails);
    const formattedChildren = values.children.map((child: any) => ({
      ...child,
      id: undefined,
      birthday: formatDateToYYYYMMDD(child.birthday),
    }));
    formData.append("children", JSON.stringify(formattedChildren));
    const formattedEmployment = values.employmentHistory.map((emp: any) => ({
      name: emp.name,
      details: emp.details,
    }));
    formData.append("previous_employers", JSON.stringify(formattedEmployment));
    const formattedEducation = values.educationHistory.map((edu: any) => ({
      name: edu.name,
      details: edu.details,
    }));
    formData.append("universities", JSON.stringify(formattedEducation));

    const formattedInterests = values.interests.map((interest: any) => ({
      name: interest.name,
    }));
    formData.append("interests", JSON.stringify(formattedInterests));

    const filteredCustomFields = values.customFields
      .map((cf: any) => ({
        title: cf.title.trim(),
        values: cf.values
          .map((v: any) => v.trim())
          .filter((v: any) => v !== ""),
      }))
      .filter((cf: any) => cf.title !== "" && cf.values.length > 0);
    formData.append("custom_fields", JSON.stringify(filteredCustomFields));

    if (selectedAvatarFileUri) {
      formData.append("photo", getfileobj(selectedAvatarFileUri));
    }
    if (route.params?.type === "edit") {
      editContactApi({
        body: formData,
        query: {
          id: route.params?.contactData?.id,
        },
      })
        .then(() => {
          resetForm({ values: initialContactValues });
          setSelectedAvatarFileUri(null);
          Toast.show({
            type: "success",
            text1: "Contact updated successfully.",
          });
          setSubmitting(false);
          setLoading(false);
          navigation.goBack();
        })
        .catch(() => {
          Toast.show({ type: "error", text1: "Failed to updated contact." });
          setSubmitting(false);
          setLoading(false);
        });
    } else {
      createContactApi({
        body: formData,
      })
        .then(() => {
          resetForm({ values: initialContactValues });
          setSelectedAvatarFileUri(null);
          Toast.show({
            type: "success",
            text1: "Contact create successfully.",
          });
          setSubmitting(false);
          setLoading(false);
          navigation.goBack();
        })
        .catch(() => {
          Toast.show({ type: "error", text1: "Failed to create contact." });
          setSubmitting(false);
          setLoading(false);
        });
    }
  };

  const handleChangeProfileImage = () => {
    Alert.alert("Pick Image", "Choose from camera or gallery", [
      {
        text: "Gallery",
        onPress: () => getImage(setSelectedAvatarFileUri),
        style: "default",
      },
      {
        text: "Camera",
        onPress: async () => await takePicture(setSelectedAvatarFileUri),
        style: "default",
      },
      { text: "Cancel", style: "cancel" },
    ]);
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
      {loading && <FullScreenLoader />}
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
              <Text style={styles.formTitle}>{`${
                route?.params?.type === "edit" ? "Edit" : "Create"
              } a Contact`}</Text>
              <Formik
                initialValues={initialContactValues}
                onSubmit={handleFormSubmit}
                enableReinitialize
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
                        onPress={handleChangeProfileImage}
                        style={styles.avatarContainer}
                      >
                        {selectedAvatarFileUri ? (
                          <Image
                            source={{ uri: selectedAvatarFileUri }}
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
                        {(arrayHelpers: FieldArrayRenderProps) => (
                          <View>
                            {values.children.map((child: any, index: any) => (
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
                        {(arrayHelpers: FieldArrayRenderProps) => (
                          <View>
                            {values.employmentHistory.map(
                              (job: any, index: any) => (
                                <View
                                  key={job.id}
                                  style={styles.arrayEntryCard}
                                >
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
                                    "name",
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
                                    "details",
                                    "Employer Details",
                                    "Enter employer details",
                                    "default",
                                    true,
                                    3
                                  )}
                                </View>
                              )
                            )}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `emp-${Date.now()}`,
                                  name: "",
                                  details: "",
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
                        {(arrayHelpers: FieldArrayRenderProps) => (
                          <View>
                            {values.educationHistory.map(
                              (edu: any, index: any) => (
                                <View
                                  key={edu.id}
                                  style={styles.arrayEntryCard}
                                >
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
                                    "name",
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
                                    "details",
                                    "Details (Degree, Year)",
                                    "Enter education details",
                                    "default",
                                    true,
                                    3
                                  )}
                                </View>
                              )
                            )}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `edu-${Date.now()}`,
                                  name: "",
                                  details: "",
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
                        {(arrayHelpers: FieldArrayRenderProps) => (
                          <View>
                            {values.interests.map(
                              (interest: any, index: any) => (
                                <View
                                  key={interest.id}
                                  style={styles.arrayEntryRow}
                                >
                                  <TextInput
                                    style={[styles.input, styles.interestInput]}
                                    placeholder="Enter an interest"
                                    placeholderTextColor={theme.colors.grey}
                                    value={interest.name}
                                    onChangeText={handleChange(
                                      `interests[${index}].name`
                                    )}
                                    onBlur={handleBlur(
                                      `interests[${index}].name`
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
                              )
                            )}
                            <TouchableOpacity
                              style={styles.addArrayEntryButton}
                              onPress={() =>
                                arrayHelpers.push({
                                  id: `interest-${Date.now()}`,
                                  name: "",
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
                      {(customFieldArrayHelpers: FieldArrayRenderProps) => (
                        <View>
                          {values.customFields.map(
                            (customField: any, cfIndex: any) => (
                              <View
                                key={customField.id}
                                style={styles.customFieldEntry}
                              >
                                <View style={styles.customFieldHeader}>
                                  <TextInput
                                    style={[
                                      styles.input,
                                      styles.customFieldTitleInput,
                                    ]}
                                    placeholder="Custom Field Title"
                                    value={customField.title}
                                    onChangeText={handleChange(
                                      `customFields[${cfIndex}].title`
                                    )}
                                    onBlur={handleBlur(
                                      `customFields[${cfIndex}].title`
                                    )}
                                    placeholderTextColor={theme.colors.grey}
                                  />
                                  <TouchableOpacity
                                    onPress={() =>
                                      customFieldArrayHelpers.remove(cfIndex)
                                    }
                                    style={styles.removeCustomFieldIconHeader}
                                  >
                                    <Feather
                                      name="x-square"
                                      size={24}
                                      color={theme.colors.red}
                                    />
                                  </TouchableOpacity>
                                </View>

                                <FieldArray
                                  name={`customFields[${cfIndex}].values`}
                                >
                                  {(valueArrayHelpers: any) => (
                                    <View style={styles.customFieldValueList}>
                                      {customField.values.map(
                                        (valueItem: any, valIndex: any) => (
                                          <View
                                            key={`${customField.id}-val-${valIndex}`}
                                            style={styles.customFieldValueRow}
                                          >
                                            <TextInput
                                              style={[
                                                styles.input,
                                                styles.customFieldValueInput,
                                              ]}
                                              placeholder="Enter value"
                                              value={valueItem} // Direct string value
                                              onChangeText={handleChange(
                                                `customFields[${cfIndex}].values[${valIndex}]`
                                              )}
                                              onBlur={handleBlur(
                                                `customFields[${cfIndex}].values[${valIndex}]`
                                              )}
                                              placeholderTextColor={
                                                theme.colors.grey
                                              }
                                            />
                                            <TouchableOpacity
                                              onPress={() =>
                                                valueArrayHelpers.remove(
                                                  valIndex
                                                )
                                              }
                                              style={
                                                styles.removeCustomFieldValueIcon
                                              }
                                            >
                                              <Feather
                                                name="minus-circle"
                                                size={20}
                                                color={theme.colors.red}
                                              />
                                            </TouchableOpacity>
                                          </View>
                                        )
                                      )}
                                      <TouchableOpacity
                                        style={styles.addValueButton}
                                        onPress={() =>
                                          valueArrayHelpers.push("")
                                        }
                                      >
                                        <Text style={styles.addValueButtonText}>
                                          + Add Value for "
                                          {customField.title ||
                                            `Field ${cfIndex + 1}`}
                                          "
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </FieldArray>
                              </View>
                            )
                          )}
                          <TouchableOpacity
                            style={styles.addCustomButton}
                            onPress={() =>
                              customFieldArrayHelpers.push({
                                id: `custom-${Date.now()}`,
                                title: "",
                                values: [""],
                              })
                            }
                          >
                            <Text style={styles.addCustomButtonText}>
                              Add Custom Field Title
                            </Text>
                          </TouchableOpacity>
                          {values.customFields.length > 0 && (
                            <TouchableOpacity
                              style={[
                                styles.addCustomButton,
                                styles.removeLastCustomButton,
                              ]}
                              onPress={() =>
                                customFieldArrayHelpers.remove(
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
  // ... (Styles remain the same)
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
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  }, // Added fallback for secondaryLight
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
  customFieldValueList: {
    marginLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
    marginTop: 5,
  }, // Added fallback
  customFieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customFieldValueInput: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: theme.colors.black,
    marginRight: 8,
  }, // Adjusted style
  removeCustomFieldValueIcon: { padding: 5 },
  addValueButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    alignItems: "flex-start",
    marginTop: 0,
  },
  addValueButtonText: {
    fontSize: 14,
    ...theme.font.fontMedium,
    color: theme.colors.primary,
  },
  customFieldEntry: {
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  }, // Added fallback
  customFieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  customFieldTitleInput: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: theme.colors.black,
    marginRight: 10,
  },
  removeCustomFieldIconHeader: { padding: 5 },
});

export default CreateContactScreen;
