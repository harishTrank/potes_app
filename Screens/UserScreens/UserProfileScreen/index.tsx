import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import ActionButtons from "../../Components/ActionButtons";
import Header from "../../Components/Header";
import {
  changeProfileName,
  viewProfileApi,
} from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import Toast from "react-native-toast-message";
import { getImage, getfileobj, takePicture } from "../../../utils/ImagePicker";
import { useAtom } from "jotai";
import { apiCallBackGlobal } from "../../../jotaiStore";
import FastImage from 'react-native-fast-image';

type UserProfileScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  openDrawer: () => void;
};

interface UserProfileScreenProps {
  navigation: UserProfileScreenNavigationProp;
}

interface UpdateNameFormValues {
  firstName: string;
  lastName: string;
}

const updateNameValidationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
});

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [profilePic, setProfilePic]: any = useState(undefined);
  const [loading, setLoading]: any = useState(false);
  const [, setGlobalCall]: any = useAtom(apiCallBackGlobal);

  useEffect(() => {
    setLoading(true);
    viewProfileApi()
      ?.then((res: any) => {
        setUserData({
          firstName: res?.first_name,
          lastName: res?.last_name,
          email: res?.email,
          username: res?.username,
          avatarUri: res?.profile_pic,
        });
        setLoading(false);
      })
      ?.catch(() => setLoading(false));
  }, []);

  const handlePickImage = async () => {
    Alert.alert("Pick Image", "Choose from camera or gallery", [
      {
        text: "Gallery",
        onPress: () => getImage(setProfilePic),
        style: "default",
      },
      {
        text: "Camera",
        onPress: async () => await takePicture(setProfilePic),
        style: "default",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  useEffect(() => {
    if (profilePic) {
      setLoading(true);
      const formData = new FormData();
      if (profilePic) {
        formData.append("profile_pic", getfileobj(profilePic));
      }
      changeProfileName({
        body: formData,
      })
        ?.then(() => {
          setLoading(false);
          setGlobalCall((oldVal: any) => oldVal + 1);
          Toast.show({
            type: "success",
            text1: "Profile pic updated successfully.",
          });
        })
        ?.catch(() => {
          setLoading(false);
          Toast.show({
            type: "error",
            text1: "Something went wrong.",
          });
        });
      setUserData((olddata: any) => {
        return {
          ...olddata,
          avatarUri: profilePic,
        };
      });
    }
  }, [profilePic]);

  const handleCreateContact = () => navigation.navigate("CreateContactScreen");
  const handleCreateNote = () => navigation.navigate("CreateNoteScreen");

  const handleChangePassword = () => {
    navigation.navigate("ChangePasswordScreen", {
      email: userData.email,
    });
  };

  const handleUpdateNameSubmit = (
    values: UpdateNameFormValues,
    { setSubmitting }: FormikHelpers<UpdateNameFormValues>
  ) => {
    setLoading(true);
    changeProfileName({
      body: {
        first_name: values.firstName,
        last_name: values.lastName,
      },
    })
      ?.then((res: any) => {
        setUserData((prev: any) => ({
          ...prev,
          firstName: values.firstName,
          lastName: values.lastName,
        }));
        setLoading(false);
        setIsEditingName(false);
        setSubmitting(false);
        Toast.show({
          type: "success",
          text1: "Profile update successfully.",
        });
      })
      ?.catch(() => {
        setLoading(false);
        setIsEditingName(false);
        setSubmitting(false);
        Toast.show({
          type: "error",
          text1: "Something went wrong.",
        });
      });
  };

  const renderInfoField = (label: string, value: string) => (
    <View style={styles.infoFieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={{...styles.valueContainer, backgroundColor: "rgba(255,255,255,0.05)"}}>
        <Text style={{...styles.valueText, color:'#fff'}}>{value}</Text>
      </View>
    </View>
  );

  return (
    <DefaultBackground>
      {loading && <FullScreenLoader />}
      <StatusBar style="light" />
      <View style={[styles.flexContainer]}>
        <Header menu={false} />
        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ActionButtons
            onCreateContactPress={handleCreateContact}
            onCreateNotePress={handleCreateNote}
          />

          <View style={styles.profileCard}>
            <Text style={styles.cardTitle}>User Profile</Text>

            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.avatarContainer}
              >
                {userData.avatarUri ? (
                  <FastImage
                    source={{ uri: userData.avatarUri,priority: FastImage.priority.normal, }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather
                      name="user"
                      size={60}
                      color={theme.colors.secondary}
                    />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Feather name="camera" size={18} color={theme.colors.white} />
                </View>
              </TouchableOpacity>
            </View>

            <Formik
              initialValues={{
                firstName: userData.firstName,
                lastName: userData.lastName,
              }}
              validationSchema={updateNameValidationSchema}
              onSubmit={handleUpdateNameSubmit}
              enableReinitialize // Important: To update Formik values if userData changes externally
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
                resetForm, // To cancel editing
              }: any) => (
                <>
                  <View style={styles.infoFieldGroup}>
                    <Text style={styles.label}>First Name</Text>
                    {isEditingName ? (
                      <TextInput
                        style={[
                          styles.valueContainer, // Re-use for background and padding
                          styles.inputText, // For text color and font
                          touched.firstName &&
                            errors.firstName &&
                            styles.inputError,
                        ]}
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                        placeholder="Enter first name"
                        placeholderTextColor={theme.colors.grey}
                      />
                    ) : (
                      <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>
                          {userData.firstName}
                        </Text>
                      </View>
                    )}
                    {isEditingName && touched.firstName && errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View style={styles.infoFieldGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    {isEditingName ? (
                      <TextInput
                        style={[
                          styles.valueContainer,
                          styles.inputText,
                          touched.lastName &&
                            errors.lastName &&
                            styles.inputError,
                        ]}
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                        placeholder="Enter last name"
                        placeholderTextColor={theme.colors.grey}
                      />
                    ) : (
                      <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>
                          {userData.lastName}
                        </Text>
                      </View>
                    )}
                    {isEditingName && touched.lastName && errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>

                  {/* Non-editable fields */}
                  {renderInfoField("Email", userData.email)}
                  {renderInfoField("Username", userData.username)}

                  {isEditingName ? (
                    <View style={styles.editingButtonsContainer}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => {
                          resetForm({
                            values: {
                              firstName: userData.firstName,
                              lastName: userData.lastName,
                            },
                          }); // Reset to original
                          setIsEditingName(false);
                        }}
                        disabled={isSubmitting}
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            styles.cancelButtonText,
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.saveButton,
                          isSubmitting && styles.buttonDisabled,
                        ]}
                        onPress={() => handleSubmit()}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color={theme.colors.white} />
                        ) : (
                          <Text
                            style={[
                              styles.actionButtonText,
                              styles.saveButtonText,
                            ]}
                          >
                            Save Changes
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setIsEditingName(true)}
                    >
                      <Text style={styles.actionButtonText}>Update Name</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </Formik>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.actionButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollableContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 22,
    ...theme.font.fontBold,
    color: theme.colors.white,
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  infoFieldGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    ...theme.font.fontMedium,
    color: theme.colors.white,
    marginBottom: 6,
  },
  valueContainer: {
    // Used for both display text and TextInput background/padding
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: "center", // For display text
  },
  valueText: {
    // For display text
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  inputText: {
    // For TextInput specifically (text color, font, already has bg from valueContainer)
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
  },
  inputError: {
    borderColor: theme.colors.red,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.red,
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 16,
    ...theme.font.fontBold,
    color: theme.colors.black,
  },
  editingButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary, // Example: use primary color for save
    marginLeft: 5,
  },
  saveButtonText: {
    color: theme.colors.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.grey, // Lighter button for cancel
    marginRight: 5,
  },
  cancelButtonText: {
    color: theme.colors.black,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default UserProfileScreen;
