import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  changeProfileName,
  deleteAccountApi,
  viewProfileApi,
} from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import Toast from "react-native-toast-message";
import { getImage, getfileobj, takePicture } from "../../../utils/ImagePicker";
import { useAtom } from "jotai";
import { apiCallBackGlobal } from "../../../jotaiStore";
import FastImage from "react-native-fast-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SideMenuModal } from "../../Components/SideMenuModal";

const updateNameValidationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string(),
});

const UserProfileScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>({});
  const [profilePic, setProfilePic]: any = useState(undefined);
  const [loading, setLoading]: any = useState(false);
  const [, setGlobalCall]: any = useAtom(apiCallBackGlobal);
  const [deleteModalOpen, setDeleteModalOpen]: any = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen]: any = useState(false);
  const [deletePassword, setDeletePassword]: any = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

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
      { text: "Gallery", onPress: () => getImage(setProfilePic), style: "default" },
      { text: "Camera", onPress: async () => await takePicture(setProfilePic), style: "default" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  useEffect(() => {
    if (profilePic) {
      setLoading(true);
      const formData = new FormData();
      formData.append("profile_pic", getfileobj(profilePic));
      changeProfileName({ body: formData })
        ?.then(() => {
          setLoading(false);
          Toast.show({ type: "success", text1: "Profile photo updated successfully." });
          setGlobalCall((v: any) => v + 1);
        })
        ?.catch(() => {
          setLoading(false);
          Toast.show({ type: "error", text1: "Something went wrong." });
        });
      setUserData((prev: any) => ({ ...prev, avatarUri: profilePic }));
    }
  }, [profilePic]);

  const handleChangePassword = () =>
    navigation.navigate("ChangePasswordScreen", { email: userData.email });

  const handleUpdateNameSubmit = (
    values: { firstName: string; lastName: string },
    { setSubmitting }: FormikHelpers<{ firstName: string; lastName: string }>
  ) => {
    setLoading(true);
    changeProfileName({ body: { first_name: values.firstName, last_name: values.lastName } })
      ?.then(() => {
        setUserData((prev: any) => ({ ...prev, firstName: values.firstName, lastName: values.lastName }));
        setLoading(false);
        setSubmitting(false);
        Toast.show({ type: "success", text1: "Profile updated." });
      })
      ?.catch(() => {
        setLoading(false);
        setSubmitting(false);
        Toast.show({ type: "error", text1: "Something went wrong." });
      });
  };

  const handleDeleteAccount = () => {
    deleteAccountApi({ body: { password: deletePassword } })
      .then((res: any) => {
        Toast.show({ type: "success", text1: res?.msg });
        setDeleteModalOpen(false);
        setModalPasswordOpen(false);
        AsyncStorage.clear();
        navigation.navigate("LoginScreen");
      })
      .catch(() => {
        Toast.show({ type: "error", text1: "Wrong password" });
        setDeleteModalOpen(false);
        setModalPasswordOpen(false);
      });
  };

  const initials = [userData.firstName?.[0], userData.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";
  const displayName = [userData.firstName, userData.lastName].filter(Boolean).join(" ");

  return (
    <DefaultBackground>
      {loading && <FullScreenLoader />}
      <SideMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.backBtn}>
            <Feather name="menu" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage}>
              {userData.avatarUri ? (
                <FastImage
                  source={{ uri: userData.avatarUri, priority: FastImage.priority.normal }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraBtn}>
                <Feather name="camera" size={14} color={theme.colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.displayName}>{displayName}</Text>
            {userData.username && <Text style={styles.usernameText}>@{userData.username}</Text>}
          </View>

          {/* Identity Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>PERSONAL IDENTITY</Text>

            <Formik
              initialValues={{ firstName: userData.firstName || "", lastName: userData.lastName || "" }}
              validationSchema={updateNameValidationSchema}
              onSubmit={handleUpdateNameSubmit}
              enableReinitialize
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }: any) => (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>FIRST NAME</Text>
                    <TextInput
                      style={[styles.fieldInput, touched.firstName && errors.firstName && styles.fieldInputError]}
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      placeholder="First name"
                      placeholderTextColor={theme.colors.grey}
                    />
                    {touched.firstName && errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>LAST NAME</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      placeholder="Last name"
                      placeholderTextColor={theme.colors.grey}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldLabelRow}>
                      <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                      <View style={styles.lockedBadge}>
                        <Feather name="lock" size={11} color={theme.colors.greyText} />
                        <Text style={styles.lockedText}>locked</Text>
                      </View>
                    </View>
                    <View style={styles.fieldInputLocked}>
                      <Text style={styles.fieldInputLockedText}>{userData.email}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldLabelRow}>
                      <Text style={styles.fieldLabel}>USERNAME</Text>
                      <View style={styles.lockedBadge}>
                        <Feather name="lock" size={11} color={theme.colors.greyText} />
                        <Text style={styles.lockedText}>locked</Text>
                      </View>
                    </View>
                    <View style={styles.fieldInputLocked}>
                      <Text style={styles.fieldInputLockedText}>{userData.username}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.updateBtn, isSubmitting && styles.btnDisabled]}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <Text style={styles.updateBtnText}>UPDATE NAME</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          </View>

          {/* Security Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>SECURITY</Text>
            <TouchableOpacity style={styles.securityRow} onPress={handleChangePassword}>
              <View style={styles.securityLeft}>
                <View style={styles.securityIconWrap}>
                  <Feather name="lock" size={18} color={theme.colors.red} />
                </View>
                <Text style={styles.securityLabel}>Change Password</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.colors.grey} />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <TouchableOpacity onPress={() => setDeleteModalOpen(true)} style={styles.deleteLink}>
            <Text style={styles.deleteLinkText}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Delete Modal */}
      <Modal animationType="slide" transparent visible={deleteModalOpen} onRequestClose={() => setDeleteModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>This will permanently delete your account and all data.</Text>
            {!modalPasswordOpen ? (
              <View style={styles.modalBtnsRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteModalOpen(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDeleteBtn} onPress={() => setModalPasswordOpen(true)}>
                  <Text style={styles.modalDeleteBtnText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password to confirm"
                  placeholderTextColor={theme.colors.grey}
                  secureTextEntry
                  onChangeText={setDeletePassword}
                />
                <View style={styles.modalBtnsRow}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setDeleteModalOpen(false); setModalPasswordOpen(false); }}>
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDeleteAccount}>
                    <Text style={styles.modalDeleteBtnText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.lightBackground },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: theme.colors.text },
  headerRight: { width: 40 },
  scroll: { flex: 1 },
  avatarSection: { alignItems: "center", paddingVertical: 20 },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.avatarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { fontSize: 32, fontFamily: "Poppins-Bold", color: theme.colors.white },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
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
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  displayName: { fontSize: 20, fontFamily: "Poppins-Bold", color: theme.colors.text },
  usernameText: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.greyText, marginTop: 2 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 14,
    ...theme.elevationLight,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 16,
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins-SemiBold", color: theme.colors.greyText, letterSpacing: 0.5, marginBottom: 6 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: theme.colors.lightCard, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  lockedText: { fontSize: 11, fontFamily: "Poppins-Regular", color: theme.colors.greyText },
  fieldInput: {
    backgroundColor: theme.colors.lightCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
  },
  fieldInputError: { borderWidth: 1.5, borderColor: theme.colors.red },
  fieldInputLocked: {
    backgroundColor: theme.colors.lightCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  fieldInputLockedText: { fontSize: 15, fontFamily: "Poppins-Regular", color: theme.colors.greyText },
  errorText: { fontSize: 12, color: theme.colors.red, marginTop: 4 },
  updateBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  updateBtnText: { fontSize: 15, fontFamily: "Poppins-Bold", color: theme.colors.white, letterSpacing: 1 },
  btnDisabled: { opacity: 0.6 },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    paddingVertical: 12,
  },
  securityLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  securityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fde8e8",
    justifyContent: "center",
    alignItems: "center",
  },
  securityLabel: { fontSize: 15, fontFamily: "Poppins-Medium", color: theme.colors.text },
  deleteLink: { alignItems: "center", paddingVertical: 16 },
  deleteLinkText: { fontSize: 14, fontFamily: "Poppins-Medium", color: theme.colors.red },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    width: "90%",
    ...theme.elevationHeavy,
  },
  modalTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: theme.colors.text, marginBottom: 8 },
  modalText: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.greyText, marginBottom: 20 },
  modalBtnsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalCancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center", backgroundColor: theme.colors.lightCard },
  modalCancelBtnText: { fontSize: 14, fontFamily: "Poppins-SemiBold", color: theme.colors.text },
  modalDeleteBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center", backgroundColor: theme.colors.red },
  modalDeleteBtnText: { fontSize: 14, fontFamily: "Poppins-SemiBold", color: theme.colors.white },
  passwordInput: {
    backgroundColor: theme.colors.lightCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    marginTop: 8,
  },
});

export default UserProfileScreen;
