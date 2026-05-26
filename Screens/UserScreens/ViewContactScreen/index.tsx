import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { deleteContactApi } from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";
import { useProfileContactApi } from "../../../hooks/Others/query";
import FastImage from "react-native-fast-image";
import { formatPhoneNumber } from "../../../utils/ImagePicker";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CollapsibleSection: any = ({ title, children, isOpen, onPress }: any) => (
  <View style={styles.collapsibleSection}>
    <TouchableOpacity onPress={onPress} style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.greyText} />
    </TouchableOpacity>
    {isOpen && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value || value.trim() === "" || value === "-") return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const ViewContactScreen: any = ({ navigation, route }: any) => {
  const { contactId } = route?.params || {};
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const apiResponse: any = useProfileContactApi({ query: { id: contactId } });
  const scrollViewRef: any = useRef(null);

  const [sectionOpenState, setSectionOpenState] = useState({
    personal: true,
    family: false,
    employment: false,
    education: false,
    interests: false,
    others: false,
  });

  const toggleSection = (key: keyof typeof sectionOpenState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionOpenState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    return navigation.addListener("focus", () => apiResponse?.refetch());
  }, [contactId, navigation]);

  const handleDelete = () =>
    Alert.alert("Delete Contact", `Delete ${apiResponse?.data?.full_name || "this contact"}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setLoading(true);
          deleteContactApi({ query: { id: apiResponse?.data?.id } })
            ?.then((res: any) => {
              Toast.show({ type: "success", text1: res?.msg });
              setLoading(false);
              navigation.goBack();
            })
            ?.catch(() => setLoading(false));
        },
      },
    ]);

  const handleEdit = () =>
    navigation.navigate("CreateContantScreen", { contactData: apiResponse?.data, type: "edit" });
  const handleAddNote = () =>
    navigation.navigate("CreateNoteScreen", { contactId: apiResponse?.data?.id, contactName: apiResponse?.data?.full_name, type: "AddNote" });
  const handleViewAllNotes = () =>
    navigation.navigate("AllNotesScreen", { contactId: apiResponse?.data?.id });

  if (loading || apiResponse?.isLoading) return <FullScreenLoader />;

  if (!apiResponse?.data) {
    return (
      <DefaultBackground>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Contact not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </DefaultBackground>
    );
  }

  const contact = apiResponse.data;
  const initials = contact.full_name?.split(" ").slice(0, 2).map((p: string) => p[0]).join("").toUpperCase() || "?";
  const lastNoteDate = contact.contact_notes?.[0]?.created_date;
  const employer = contact.previous_employers?.[0];

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Feather name="trash-2" size={16} color={theme.colors.red} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero */}
          <View style={styles.heroSection}>
            {contact.photo ? (
              <FastImage source={{ uri: contact.photo, priority: FastImage.priority.normal }} style={styles.heroAvatar} />
            ) : (
              <View style={styles.heroAvatarPlaceholder}>
                <Text style={styles.heroAvatarInitials}>{initials}</Text>
              </View>
            )}
            <Text style={styles.heroName}>{contact.full_name}</Text>
            {lastNoteDate && (
              <Text style={styles.heroSubtitle}>
                Last note {dayjs().diff(dayjs(lastNoteDate), "month") > 0
                  ? `${dayjs().diff(dayjs(lastNoteDate), "month")} months ago`
                  : `${dayjs().diff(dayjs(lastNoteDate), "day")} days ago`}
              </Text>
            )}
            {employer && (
              <Text style={styles.heroEmployer}>{employer.name}{employer.details ? ` · ${employer.details}` : ""}</Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionBtnsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
                <Feather name="edit-2" size={16} color={theme.colors.primary} />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnActive]}
                onPress={() => navigation.navigate("ChatAiScreen", { contactId })}
              >
                <MaterialCommunityIcons name="star-four-points" size={16} color={theme.colors.white} />
                <Text style={[styles.actionBtnText, { color: theme.colors.white }]}>AI</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleAddNote}>
                <Feather name="file-plus" size={16} color={theme.colors.primary} />
                <Text style={styles.actionBtnText}>Note</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <CollapsibleSection title="PERSONAL INFO" isOpen={sectionOpenState.personal} onPress={() => toggleSection("personal")}>
              <InfoRow label="Birthday" value={contact.birthday ? dayjs(contact.birthday, "YYYY-MM-DD").format("D MMMM") : null} />
              <InfoRow label="Anniversary" value={contact.anniversary ? dayjs(contact.anniversary, "YYYY-MM-DD").format("D MMMM") : null} />
              <InfoRow label="Email" value={contact.email} />
              <InfoRow label="Phone" value={formatPhoneNumber(contact.phone)} />
            </CollapsibleSection>

            {(contact.spouse_name || contact.spouse_birthday || contact.children?.length > 0) && (
              <CollapsibleSection title="FAMILY DETAILS" isOpen={sectionOpenState.family} onPress={() => toggleSection("family")}>
                <InfoRow label="Spouse" value={contact.spouse_name} />
                <InfoRow label="Spouse Birthday" value={contact.spouse_birthday ? dayjs(contact.spouse_birthday, "YYYY-MM-DD").format("D MMMM") : null} />
                {contact.children?.map((child: any) => (
                  <InfoRow key={child.id} label={`Family Member`} value={`${child.name}${child.birthday ? " · " + dayjs(child.birthday).format("D MMMM") : ""}`} />
                ))}
              </CollapsibleSection>
            )}

            {contact.previous_employers?.length > 0 && (
              <CollapsibleSection title="EMPLOYMENT" isOpen={sectionOpenState.employment} onPress={() => toggleSection("employment")}>
                {contact.previous_employers.map((job: any) => (
                  <View key={job.id} style={styles.subCard}>
                    <InfoRow label="Employer" value={job.name} />
                    <InfoRow label="Details" value={job.details} />
                  </View>
                ))}
              </CollapsibleSection>
            )}

            {contact.universities?.length > 0 && (
              <CollapsibleSection title="EDUCATION" isOpen={sectionOpenState.education} onPress={() => toggleSection("education")}>
                {contact.universities.map((edu: any) => (
                  <View key={edu.id} style={styles.subCard}>
                    <InfoRow label="Institution" value={edu.name} />
                    <InfoRow label="Details" value={edu.details} />
                  </View>
                ))}
              </CollapsibleSection>
            )}

            {contact.interests?.length > 0 && (
              <CollapsibleSection title="INTERESTS" isOpen={sectionOpenState.interests} onPress={() => toggleSection("interests")}>
                <View style={styles.interestPillsRow}>
                  {contact.interests.map((interest: any) => (
                    <View key={interest.id} style={styles.interestPill}>
                      <Text style={styles.interestPillText}>{interest.name}</Text>
                    </View>
                  ))}
                </View>
              </CollapsibleSection>
            )}

            {contact.custom_fields?.length > 0 && (
              <CollapsibleSection title="MORE DETAILS" isOpen={sectionOpenState.others} onPress={() => toggleSection("others")}>
                {contact.custom_fields.map((field: any) => (
                  <View key={field.id || field.title} style={styles.subCard}>
                    <Text style={styles.infoLabel}>{field.title}</Text>
                    {field.values?.map((val: any, idx: number) => (
                      <Text key={idx} style={styles.infoValue}>• {val}</Text>
                    ))}
                  </View>
                ))}
              </CollapsibleSection>
            )}
          </View>

          {/* Notes Card */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeaderRow}>
              <Text style={styles.notesTitle}>NOTES</Text>
              {contact.contact_notes?.length > 0 && (
                <TouchableOpacity onPress={handleViewAllNotes}>
                  <Text style={styles.viewAllLink}>VIEW ALL</Text>
                </TouchableOpacity>
              )}
            </View>
            {contact.contact_notes?.length > 0 ? (
              contact.contact_notes.slice(0, 2).map((note: any) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteAccent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteDate}>
                      {dayjs(note?.created_date).format("MMM D, YYYY").toUpperCase()}
                    </Text>
                    <Text style={styles.noteContent} numberOfLines={3}>{note.note}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noNotesText}>No notes yet for this contact.</Text>
            )}
          </View>
        </ScrollView>
      </View>
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
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  deleteBtnText: { fontSize: 14, fontFamily: "Poppins-Medium", color: theme.colors.red },
  scroll: { flex: 1 },
  heroSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 14,
    ...theme.elevationLight,
  },
  heroAvatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  heroAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.avatarBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroAvatarInitials: { fontSize: 32, fontFamily: "Poppins-Bold", color: theme.colors.white },
  heroName: { fontSize: 22, fontFamily: "Poppins-Bold", color: theme.colors.text },
  heroSubtitle: { fontSize: 13, fontFamily: "Poppins-Regular", color: theme.colors.greyText, marginTop: 2 },
  heroEmployer: { fontSize: 13, fontFamily: "Poppins-Medium", color: theme.colors.primary, marginTop: 2 },
  actionBtnsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    gap: 6,
  },
  actionBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  actionBtnText: { fontSize: 14, fontFamily: "Poppins-SemiBold", color: theme.colors.primary },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: "hidden",
    ...theme.elevationLight,
  },
  collapsibleSection: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sectionHeaderText: { fontSize: 12, fontFamily: "Poppins-Bold", color: theme.colors.greyText, letterSpacing: 0.8 },
  sectionContent: { paddingHorizontal: 16, paddingBottom: 14 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: { fontSize: 13, fontFamily: "Poppins-Regular", color: theme.colors.greyText, flex: 1 },
  infoValue: { fontSize: 13, fontFamily: "Poppins-Medium", color: theme.colors.text, flex: 2, textAlign: "right" },
  subCard: { backgroundColor: theme.colors.lightCard, borderRadius: 8, padding: 10, marginBottom: 8 },
  interestPillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestPill: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  interestPillText: { fontSize: 13, fontFamily: "Poppins-Medium", color: theme.colors.primary },
  notesCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    ...theme.elevationLight,
  },
  notesHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  notesTitle: { fontSize: 12, fontFamily: "Poppins-Bold", color: theme.colors.greyText, letterSpacing: 0.8 },
  viewAllLink: { fontSize: 12, fontFamily: "Poppins-SemiBold", color: theme.colors.primary, letterSpacing: 0.5 },
  noteItem: { flexDirection: "row", gap: 10, marginBottom: 12 },
  noteAccent: { width: 3, borderRadius: 2, backgroundColor: theme.colors.primary, minHeight: 40 },
  noteDate: { fontSize: 11, fontFamily: "Poppins-SemiBold", color: theme.colors.greyText, marginBottom: 3 },
  noteContent: { fontSize: 13, fontFamily: "Poppins-Regular", color: theme.colors.text, lineHeight: 18 },
  noNotesText: { color: theme.colors.greyText, textAlign: "center", fontSize: 13, paddingVertical: 8 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: theme.colors.text, marginBottom: 10 },
  linkText: { fontSize: 14, color: theme.colors.primary, fontFamily: "Poppins-SemiBold" },
});

export default ViewContactScreen;
