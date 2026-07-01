import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  InteractionManager,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Formik, FieldArray, FieldArrayRenderProps } from "formik";
import {
  getDefaultAvatarFileUri,
  getImage,
  getfileobj,
  takePicture,
} from "../../../utils/ImagePicker";
import Toast from "react-native-toast-message";
import {
  createContactApi,
  editContactApi,
} from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import FastImage from "react-native-fast-image";
import dayjs from "dayjs";
import MonthDayPicker from "./Component/MonthDayPicker";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SECTION_ICONS: any = {
  "Family Details": "people-outline",
  Employment: "briefcase-outline",
  Education: "school-outline",
  Interests: "star-outline",
  "More Details": "ellipsis-horizontal-outline",
};

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
        <View style={styles.sectionHeaderLeft}>
          <Ionicons
            name={SECTION_ICONS[title] || "ellipsis-horizontal-outline"}
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.greyText}
        />
      </TouchableOpacity>
      {isOpen && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

const CreateContactScreen: any = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const isEdit = route?.params?.type === "edit";
  const contactId = route?.params?.contactData?.id;
  const [selectedAvatarFileUri, setSelectedAvatarFileUri] = useState<
    string | null
  >(null);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [viewPhotoVisible, setViewPhotoVisible] = useState(false);
  const [monthDayVisible, setMonthDayVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<{
    path: string;
    index?: number;
  } | null>(null);
  const [loading, setLoading]: any = useState(false);
  const [initialContactValues, setInitialContactValues]: any = useState({
    avatarUri: null,
    nameOrDescription: "",
    birthday: undefined,
    anniversary: undefined,
    spouseName: "",
    spouseBirthday: undefined,
    spouseDetails: "",
    children: [
      { id: `child-${Date.now()}`, name: "", birthday: undefined, details: "" },
    ],
    employmentHistory: [{ id: `emp-${Date.now()}`, name: "", details: "" }],
    educationHistory: [{ id: `edu-${Date.now()}`, name: "", details: "" }],
    interests: [{ id: `interest-${Date.now()}`, name: "" }],
    customFields: [],
  });

  const parseApiDate = (dateString?: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const [year, month, day] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
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
        spouseName: contactToEdit.spouse_name || "",
        spouseBirthday: parseApiDate(contactToEdit.spouse_birthday),
        spouseDetails: contactToEdit.spouse_details || "",
        children:
          contactToEdit.children?.map((c: any) => ({
            id: c.id?.toString() || `child-${Date.now()}`,
            name: c.name || "",
            birthday: parseApiDate(c.birthday),
            details: c.details || "",
          })) || [],
        employmentHistory:
          contactToEdit.previous_employers?.map((e: any) => ({
            id: e.id?.toString() || `emp-${Date.now()}`,
            name: e.name || "",
            details: e.details || "",
          })) || [],
        educationHistory:
          contactToEdit.universities?.map((e: any) => ({
            id: e.id?.toString() || `edu-${Date.now()}`,
            name: e.name || "",
            details: e.details || "",
          })) || [],
        interests:
          contactToEdit.interests?.map((i: any) => ({
            id: i.id?.toString() || `interest-${Date.now()}`,
            name: i.name || "",
          })) || [],
        customFields:
          contactToEdit.custom_fields?.map((cf: any) => ({
            id: cf.id?.toString() || `custom-${Date.now()}`,
            title: cf.title || "",
            values: Array.isArray(cf.values) ? cf.values.map(String) : [],
          })) || [],
      });
      if (contactToEdit.photo) setSelectedAvatarFileUri(contactToEdit.photo);
    }
  }, [route.params?.contactData, route.params?.type]);

  const formatDateToYYYYMMDD = (date?: Date | null) => {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleFormSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any,
  ) => {
    const formData = new FormData();
    setLoading(true);
    formData.append("full_name", values.nameOrDescription);
    if (values.birthday)
      formData.append("birthday", formatDateToYYYYMMDD(values.birthday)!);
    formData.append("spouse_name", values.spouseName);
    if (values.spouseBirthday)
      formData.append(
        "spouse_birthday",
        formatDateToYYYYMMDD(values.spouseBirthday)!,
      );
    if (values.anniversary)
      formData.append("anniversary", formatDateToYYYYMMDD(values.anniversary)!);
    formData.append("spouse_details", values.spouseDetails);
    formData.append(
      "children",
      JSON.stringify(
        values.children.map((c: any) => ({
          ...c,
          id: undefined,
          birthday: formatDateToYYYYMMDD(c.birthday),
        })),
      ),
    );
    formData.append(
      "previous_employers",
      JSON.stringify(
        values.employmentHistory.map((e: any) => ({
          name: e.name,
          details: e.details,
        })),
      ),
    );
    formData.append(
      "universities",
      JSON.stringify(
        values.educationHistory.map((e: any) => ({
          name: e.name,
          details: e.details,
        })),
      ),
    );
    formData.append(
      "interests",
      JSON.stringify(values.interests.map((i: any) => ({ name: i.name }))),
    );
    const filteredCustomFields = values.customFields
      .map((cf: any) => ({
        title: cf.title.trim(),
        values: cf.values
          .map((v: any) => v.trim())
          .filter((v: any) => v !== ""),
      }))
      .filter((cf: any) => cf.title !== "" && cf.values.length > 0);
    formData.append("custom_fields", JSON.stringify(filteredCustomFields));
    // In edit mode the photo is uploaded immediately when picked/removed (see uploadContactPhoto/handleRemovePhoto),
    // so only bundle it here for the initial create flow where the contact has no id yet.
    if (
      !isEdit &&
      selectedAvatarFileUri &&
      !selectedAvatarFileUri.includes("http")
    ) {
      formData.append("photo", getfileobj(selectedAvatarFileUri));
    }

    const onSuccess = () => {
      resetForm({ values: initialContactValues });
      setSelectedAvatarFileUri(null);
      Toast.show({
        type: "success",
        text1: isEdit ? "Contact updated." : "Contact created.",
      });
      setSubmitting(false);
      setLoading(false);
      navigation.goBack();
    };
    const onError = (err: any) => {
      Toast.show({
        type: "error",
        text1: "Error, User already exists with this name or email.",
      });
      setSubmitting(false);
      setLoading(false);
    };

    if (isEdit) {
      editContactApi({ body: formData, query: { id: contactId } })
        .then(onSuccess)
        .catch(onError);
    } else {
      createContactApi({ body: formData }).then(onSuccess).catch(onError);
    }
  };

  const handlePickImage = () => setPhotoSheetVisible(true);

  // Mirrors UserProfileScreen: in edit mode, photo changes upload immediately instead of waiting for Save.
  const uploadContactPhoto = (uri: string) => {
    setSelectedAvatarFileUri(uri);
    if (!isEdit || !contactId) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("photo", getfileobj(uri));
    editContactApi({ body: formData, query: { id: contactId } })
      ?.then(() => {
        setLoading(false);
        InteractionManager.runAfterInteractions(() => {
          Toast.show({
            type: "success",
            text1: "Contact photo updated successfully.",
          });
        });
      })
      ?.catch(() => {
        setLoading(false);
        InteractionManager.runAfterInteractions(() => {
          Toast.show({
            type: "error",
            text1: "Could not update photo. Please try again.",
          });
        });
      });
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this contact's photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (!isEdit || !contactId) {
              setSelectedAvatarFileUri(null);
              return;
            }
            setLoading(true);
            try {
              const uri = await getDefaultAvatarFileUri();
              const formData = new FormData();
              formData.append("photo", getfileobj(uri));
              await editContactApi({
                body: formData,
                query: { id: contactId },
              });
              setSelectedAvatarFileUri(null);
              setLoading(false);
              InteractionManager.runAfterInteractions(() => {
                Toast.show({
                  type: "success",
                  text1: "Contact photo removed successfully.",
                });
              });
            } catch {
              setLoading(false);
              InteractionManager.runAfterInteractions(() => {
                Toast.show({
                  type: "error",
                  text1: "Could not remove photo. Please try again.",
                });
              });
            }
          },
        },
      ],
    );
  };

  const photoSheetOptions: any[] = [
    ...(selectedAvatarFileUri
      ? [
          {
            text: "View Photo",
            icon: "eye",
            onPress: () => setViewPhotoVisible(true),
          },
        ]
      : []),
    {
      text: "Gallery",
      icon: "image",
      onPress: () => getImage(uploadContactPhoto),
    },
    {
      text: "Camera",
      icon: "camera",
      onPress: async () => await takePicture(uploadContactPhoto),
    },
    ...(selectedAvatarFileUri
      ? [
          {
            text: "Remove Photo",
            icon: "trash-2",
            onPress: handleRemovePhoto,
            destructive: true,
          },
        ]
      : []),
  ];

  const openDatePicker = useCallback(
    (path: string, _currentValue: Date | undefined, index?: number) => {
      setActiveDateField({ path, index });
      setMonthDayVisible(true);
    },
    [],
  );

  const renderTextInput = (
    formikBag: any,
    name: string,
    label: string,
    placeholder: string,
    required = false,
    keyboardType: any = "default",
    multiline = false,
    numberOfLines = 1,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.grey}
        value={formikBag.values[name]}
        onChangeText={formikBag.handleChange(name)}
        onBlur={formikBag.handleBlur(name)}
        keyboardType={keyboardType}
        multiline={multiline}
        blurOnSubmit={true}
        returnKeyType="done"
        numberOfLines={numberOfLines}
        maxLength={200}
      />
    </View>
  );

  const renderDateInput = (
    formikValues: any,
    _setFieldValue: Function,
    fieldPath: string,
    label: string,
    placeholder: string,
    arrayIndex?: number,
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
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDatePicker(fieldPath, displayValue, arrayIndex)}
        >
          <Text style={displayValue ? styles.dateText : styles.datePlaceholder}>
            {displayValue ? dayjs(displayValue).format("MM/DD") : placeholder}
          </Text>
          <Feather name="calendar" size={18} color={theme.colors.greyText} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      {loading && <FullScreenLoader />}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150}
      >
        <View style={[styles.headerRow, { paddingTop: insets.top + 6 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? "Edit Contact" : "Create Contact"}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
              <View style={{ paddingHorizontal: 16 }}>
                {/* Avatar */}
                <TouchableOpacity
                  style={styles.avatarSection}
                  onPress={handlePickImage}
                >
                  <View style={styles.avatarContainer}>
                    {selectedAvatarFileUri ? (
                      <FastImage
                        source={{
                          uri: selectedAvatarFileUri,
                          priority: FastImage.priority.normal,
                        }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Feather
                        name="user-plus"
                        size={36}
                        color={theme.colors.greyText}
                      />
                    )}
                    <View style={styles.cameraBtn}>
                      <Feather
                        name="camera"
                        size={14}
                        color={theme.colors.white}
                      />
                    </View>
                  </View>
                  <Text style={styles.addPhotoText}>ADD CONTACT PHOTO</Text>
                </TouchableOpacity>

                {/* Name */}
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>NAME OR DESCRIPTION *</Text>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="e.g. Julianne Smith"
                    placeholderTextColor={theme.colors.grey}
                    value={values.nameOrDescription}
                    onChangeText={handleChange("nameOrDescription")}
                    onBlur={handleBlur("nameOrDescription")}
                    returnKeyType="done"
                  />
                </View>

                {/* Birthday & Anniversary */}
                <View style={styles.dateRow}>
                  <View style={[styles.card, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.cardLabel}>BIRTHDAY</Text>
                    <TouchableOpacity
                      style={styles.dateInputInline}
                      onPress={() =>
                        openDatePicker("birthday", values.birthday)
                      }
                    >
                      <Text
                        style={
                          values.birthday
                            ? styles.dateText
                            : styles.datePlaceholder
                        }
                      >
                        {values.birthday
                          ? dayjs(values.birthday).format("MM/DD")
                          : "mm/dd"}
                      </Text>
                      <MaterialCommunityIcons
                        name="cake-variant"
                        size={18}
                        color={theme.colors.greyText}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.card, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.cardLabel}>ANNIVERSARY</Text>
                    <TouchableOpacity
                      style={styles.dateInputInline}
                      onPress={() =>
                        openDatePicker("anniversary", values.anniversary)
                      }
                    >
                      <Text
                        style={
                          values.anniversary
                            ? styles.dateText
                            : styles.datePlaceholder
                        }
                      >
                        {values.anniversary
                          ? dayjs(values.anniversary).format("MM/DD")
                          : "mm/dd"}
                      </Text>
                      <Feather
                        name="heart"
                        size={16}
                        color={theme.colors.greyText}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Collapsible Sections */}
                <View style={styles.sectionsCard}>
                  <CollapsibleSection title="Family Details">
                    {renderTextInput(
                      { values, handleChange, handleBlur },
                      "spouseName",
                      "Spouse Name",
                      "Enter spouse name",
                    )}
                    {renderDateInput(
                      values,
                      setFieldValue,
                      "spouseBirthday",
                      "Spouse Birthday",
                      "mm/dd",
                    )}
                    {renderTextInput(
                      { values, handleChange, handleBlur },
                      "spouseDetails",
                      "Spouse Details",
                      "Enter details",
                      false,
                      "default",
                      true,
                      2,
                    )}
                    <FieldArray name="children">
                      {(arrayHelpers: FieldArrayRenderProps) => (
                        <View>
                          {values.children.map((child: any, index: any) => (
                            <View key={child.id} style={styles.arrayCard}>
                              <View style={styles.arrayCardHeader}>
                                <Text style={styles.arrayCardTitle}>
                                  Family Member {index + 1}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => arrayHelpers.remove(index)}
                                >
                                  <Feather
                                    name="trash-2"
                                    size={18}
                                    color={theme.colors.red}
                                  />
                                </TouchableOpacity>
                              </View>
                              {renderTextInput(
                                {
                                  values: child,
                                  handleChange: (f: string) => (v: string) =>
                                    setFieldValue(`children[${index}].${f}`, v),
                                  handleBlur,
                                },
                                "name",
                                "Name",
                                "Enter name",
                              )}
                              {renderDateInput(
                                values,
                                setFieldValue,
                                `children[index].birthday`,
                                "Birthday",
                                "mm/dd",
                                index,
                              )}
                            </View>
                          ))}
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() =>
                              arrayHelpers.push({
                                id: `child-${Date.now()}`,
                                name: "",
                                birthday: undefined,
                                details: "",
                              })
                            }
                          >
                            <Text style={styles.addBtnText}>
                              + Add Family Member
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
                              <View key={job.id} style={styles.arrayCard}>
                                <View style={styles.arrayCardHeader}>
                                  <Text style={styles.arrayCardTitle}>
                                    Employment {index + 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => arrayHelpers.remove(index)}
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={18}
                                      color={theme.colors.red}
                                    />
                                  </TouchableOpacity>
                                </View>
                                {renderTextInput(
                                  {
                                    values: job,
                                    handleChange: (f: string) => (v: string) =>
                                      setFieldValue(
                                        `employmentHistory[${index}].${f}`,
                                        v,
                                      ),
                                    handleBlur,
                                  },
                                  "name",
                                  "Employer",
                                  "Employer name",
                                )}
                                {renderTextInput(
                                  {
                                    values: job,
                                    handleChange: (f: string) => (v: string) =>
                                      setFieldValue(
                                        `employmentHistory[${index}].${f}`,
                                        v,
                                      ),
                                    handleBlur,
                                  },
                                  "details",
                                  "Details",
                                  "Role/position",
                                  false,
                                  "default",
                                  true,
                                  2,
                                )}
                              </View>
                            ),
                          )}
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() =>
                              arrayHelpers.push({
                                id: `emp-${Date.now()}`,
                                name: "",
                                details: "",
                              })
                            }
                          >
                            <Text style={styles.addBtnText}>
                              + Add Employment
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
                              <View key={edu.id} style={styles.arrayCard}>
                                <View style={styles.arrayCardHeader}>
                                  <Text style={styles.arrayCardTitle}>
                                    Education {index + 1}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => arrayHelpers.remove(index)}
                                  >
                                    <Feather
                                      name="trash-2"
                                      size={18}
                                      color={theme.colors.red}
                                    />
                                  </TouchableOpacity>
                                </View>
                                {renderTextInput(
                                  {
                                    values: edu,
                                    handleChange: (f: string) => (v: string) =>
                                      setFieldValue(
                                        `educationHistory[${index}].${f}`,
                                        v,
                                      ),
                                    handleBlur,
                                  },
                                  "name",
                                  "Institution",
                                  "University name",
                                )}
                                {renderTextInput(
                                  {
                                    values: edu,
                                    handleChange: (f: string) => (v: string) =>
                                      setFieldValue(
                                        `educationHistory[${index}].${f}`,
                                        v,
                                      ),
                                    handleBlur,
                                  },
                                  "details",
                                  "Details",
                                  "Degree/program",
                                  false,
                                  "default",
                                  true,
                                  2,
                                )}
                              </View>
                            ),
                          )}
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() =>
                              arrayHelpers.push({
                                id: `edu-${Date.now()}`,
                                name: "",
                                details: "",
                              })
                            }
                          >
                            <Text style={styles.addBtnText}>
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
                          {values.interests.map((interest: any, index: any) => (
                            <View key={interest.id} style={styles.interestRow}>
                              <TextInput
                                style={[
                                  styles.input,
                                  { flex: 1, marginRight: 8, marginBottom: 0 },
                                ]}
                                placeholder="e.g. Golf, Running..."
                                placeholderTextColor={theme.colors.grey}
                                value={interest.name}
                                onChangeText={handleChange(
                                  `interests[${index}].name`,
                                )}
                              />
                              <TouchableOpacity
                                onPress={() => arrayHelpers.remove(index)}
                              >
                                <Feather
                                  name="trash-2"
                                  size={18}
                                  color={theme.colors.red}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() =>
                              arrayHelpers.push({
                                id: `interest-${Date.now()}`,
                                name: "",
                              })
                            }
                          >
                            <Text style={styles.addBtnText}>
                              + Add Interest
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </FieldArray>
                  </CollapsibleSection>

                  <CollapsibleSection title="More Details">
                    <Text style={styles.moreDetailsHint}>
                      A catch-all for anything else — preferred contact method,
                      how you met, notes on their personality, etc.
                    </Text>
                    <FieldArray name="customFields">
                      {(customFieldArrayHelpers: FieldArrayRenderProps) => (
                        <View>
                          {values.customFields.map((cf: any, cfIndex: any) => (
                            <View key={cf.id} style={styles.arrayCard}>
                              <View style={styles.arrayCardHeader}>
                                <TextInput
                                  style={[
                                    styles.input,
                                    {
                                      flex: 1,
                                      marginRight: 8,
                                      marginBottom: 0,
                                      height: 40,
                                    },
                                  ]}
                                  placeholder="Field title"
                                  value={cf.title}
                                  onChangeText={handleChange(
                                    `customFields[${cfIndex}].title`,
                                  )}
                                  placeholderTextColor={theme.colors.grey}
                                />
                                <TouchableOpacity
                                  onPress={() =>
                                    customFieldArrayHelpers.remove(cfIndex)
                                  }
                                >
                                  <Feather
                                    name="x"
                                    size={20}
                                    color={theme.colors.red}
                                  />
                                </TouchableOpacity>
                              </View>
                              <FieldArray
                                name={`customFields[${cfIndex}].values`}
                              >
                                {(valueHelpers: any) => (
                                  <View>
                                    {cf.values.map((val: any, valIdx: any) => (
                                      <View
                                        key={valIdx}
                                        style={styles.interestRow}
                                      >
                                        <TextInput
                                          style={[
                                            styles.input,
                                            {
                                              flex: 1,
                                              marginRight: 8,
                                              marginBottom: 0,
                                            },
                                          ]}
                                          placeholder="Value"
                                          value={val}
                                          onChangeText={handleChange(
                                            `customFields[${cfIndex}].values[${valIdx}]`,
                                          )}
                                          placeholderTextColor={
                                            theme.colors.grey
                                          }
                                        />
                                        <TouchableOpacity
                                          onPress={() =>
                                            valueHelpers.remove(valIdx)
                                          }
                                        >
                                          <Feather
                                            name="minus-circle"
                                            size={18}
                                            color={theme.colors.red}
                                          />
                                        </TouchableOpacity>
                                      </View>
                                    ))}
                                    <TouchableOpacity
                                      style={styles.addBtn}
                                      onPress={() => valueHelpers.push("")}
                                    >
                                      <Text style={styles.addBtnText}>
                                        + Add Value
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </FieldArray>
                            </View>
                          ))}
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() =>
                              customFieldArrayHelpers.push({
                                id: `custom-${Date.now()}`,
                                title: "",
                                values: [""],
                              })
                            }
                          >
                            <Text style={styles.addBtnText}>
                              + Add Custom Field
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </FieldArray>
                  </CollapsibleSection>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.saveBtnText}>SAVE CONTACT</Text>
                  )}
                </TouchableOpacity>

                {monthDayVisible && (
                  <MonthDayPicker
                    visible={monthDayVisible}
                    initialDate={
                      activeDateField
                        ? activeDateField.index !== undefined
                          ? values[activeDateField.path.split("[index]")[0]]?.[
                              activeDateField.index
                            ]?.[activeDateField.path.split(".")[1]]
                          : values[activeDateField.path]
                        : undefined
                    }
                    onClose={() => {
                      setMonthDayVisible(false);
                      setActiveDateField(null);
                    }}
                    onConfirm={(date: Date) => {
                      if (!activeDateField) return;
                      if (activeDateField.index !== undefined) {
                        const arrayName =
                          activeDateField.path.split("[index]")[0];
                        const fieldName = activeDateField.path.split(".")[1];
                        setFieldValue(
                          `${arrayName}[${activeDateField.index}].${fieldName}`,
                          date,
                        );
                      } else {
                        setFieldValue(activeDateField.path, date);
                      }
                      setMonthDayVisible(false);
                      setActiveDateField(null);
                    }}
                  />
                )}
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Contact Photo Options Sheet */}
      <Modal
        animationType="fade"
        transparent
        visible={photoSheetVisible}
        onRequestClose={() => setPhotoSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPhotoSheetVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.photoSheetCard}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Contact Photo</Text>
            <Text style={styles.modalText}>Choose an option</Text>
            {photoSheetOptions.map((option) => (
              <TouchableOpacity
                key={option.text}
                style={styles.photoSheetOption}
                onPress={() => {
                  setPhotoSheetVisible(false);
                  option.onPress();
                }}
              >
                <Feather
                  name={option.icon}
                  size={18}
                  color={
                    option.destructive ? theme.colors.red : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.photoSheetOptionText,
                    option.destructive &&
                      styles.photoSheetOptionTextDestructive,
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.photoSheetCancelBtn}
              onPress={() => setPhotoSheetVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* View Photo Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={viewPhotoVisible}
        onRequestClose={() => setViewPhotoVisible(false)}
      >
        <TouchableOpacity
          style={styles.viewPhotoOverlay}
          activeOpacity={1}
          onPress={() => setViewPhotoVisible(false)}
        >
          {selectedAvatarFileUri ? (
            <FastImage
              source={{
                uri: selectedAvatarFileUri,
                priority: FastImage.priority.high,
              }}
              style={styles.viewPhotoImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : null}
          <TouchableOpacity
            style={styles.viewPhotoClose}
            onPress={() => setViewPhotoVisible(false)}
          >
            <Feather name="x" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
  },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  avatarSection: { alignItems: "center", paddingVertical: 20 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.lightCard,
    position: "relative",
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 50 },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
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
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    ...theme.elevationLight,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.greyText,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 6,
  },
  dateRow: { flexDirection: "row", marginBottom: 0 },
  dateInputInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: theme.colors.greyText,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.lightCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    height: 44,
    marginBottom: 4,
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.lightCard,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
  },
  datePlaceholder: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.grey,
  },
  sectionsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    ...theme.elevationLight,
  },
  collapsibleSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionHeaderText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  sectionContent: { paddingHorizontal: 14, paddingBottom: 14 },
  arrayCard: {
    backgroundColor: theme.colors.lightCard,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  arrayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrayCardTitle: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  addBtn: { paddingVertical: 8 },
  addBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: theme.colors.primary,
  },
  interestRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  moreDetailsHint: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginBottom: 12,
    fontStyle: "italic",
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: theme.colors.white,
    letterSpacing: 1,
  },
  btnDisabled: { opacity: 0.6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginBottom: 20,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  photoSheetCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    width: "90%",
    ...theme.elevationHeavy,
  },
  photoSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightCard,
  },
  photoSheetOptionText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: theme.colors.text,
  },
  photoSheetOptionTextDestructive: { color: theme.colors.red },
  photoSheetCancelBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: theme.colors.lightCard,
  },
  viewPhotoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewPhotoImage: { width: "100%", height: "80%" },
  viewPhotoClose: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreateContactScreen;
