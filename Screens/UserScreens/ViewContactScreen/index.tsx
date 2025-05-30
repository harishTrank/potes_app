import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";
import {
  deleteContactApi,
  profileContactApi,
} from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader"; // Assuming you have this
import dayjs from "dayjs";
import Toast from "react-native-toast-message";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CollapsibleSection: any = ({ title, children, isOpen, onPress }: any) => {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={onPress} style={styles.sectionHeader}>
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

// --- Display Field Component ---
interface InfoDisplayFieldProps {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}
const InfoDisplayField: React.FC<InfoDisplayFieldProps> = ({
  label,
  value,
  children,
}) => {
  const hasValue = value !== null && value !== undefined && value.trim() !== "";
  if (!hasValue && !children) return null;
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {hasValue && <Text style={styles.infoValue}>{value}</Text>}
      {children}
    </View>
  );
};

// --- Main Screen Component ---
const ViewContactScreen: any = ({ navigation, route }: any) => {
  const { contactId, contactName: nameFromRoute } = route?.params || {}; // Destructure contactId and optional name
  const insets = useSafeAreaInsets();
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [areAllSectionsOpen, setAreAllSectionsOpen] = useState(false);

  const initialSectionStates = {
    personal: true,
    spouse: false,
    children: false,
    employment: false,
    education: false,
    interests: false,
    others: false,
  };
  const [sectionOpenState, setSectionOpenState] =
    useState(initialSectionStates);

  const toggleSection = (sectionName: keyof typeof initialSectionStates) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionOpenState((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };
  const toggleAllSections = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newState = !areAllSectionsOpen;
    setSectionOpenState({
      personal: newState,
      spouse: newState,
      children: newState,
      employment: newState,
      education: newState,
      interests: newState,
      others: newState,
    });
    setAreAllSectionsOpen(newState);
  };

  useEffect(() => {
    return navigation.addListener("focus", () => {
      if (contactId) {
        setLoading(true);
        profileContactApi({ query: { id: contactId } })
          .then((res: any) => {
            setContactDetails(res);
          })
          .catch((err: any) => {
            console.error("Error fetching contact profile:", err);
            Alert.alert("Error", "Could not load contact details.");
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        Alert.alert("Error", "No contact ID provided.");
        navigation.goBack();
        setLoading(false);
      }
    });
  }, [contactId, navigation]);

  const handleSearchPress = () => console.log("Search pressed on View Contact");
  const handleDelete = () =>
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${
        contactDetails?.full_name || "this contact"
      }?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: () => {
            setLoading(true);
            deleteContactApi({
              query: {
                id: contactDetails?.id,
              },
            })
              ?.then((res: any) => {
                Toast.show({
                  type: "success",
                  text1: res?.msg,
                });
                setLoading(false);
                navigation.goBack();
              })
              ?.catch(() => setLoading(false));
          },
          style: "destructive",
        },
      ]
    );
  const handleEdit = () =>
    navigation.navigate("EditContactScreen", { contactData: contactDetails }); // Pass full contactDetails
  const handleAddNote = () =>
    navigation.navigate("CreateNoteScreen", {
      contactId: contactDetails?.id,
      contactName: contactDetails?.full_name,
      type: "AddNote",
    });
  const handleViewAllNotes = () =>
    navigation.navigate("AllNotesScreen", {
      contactId: contactDetails?.id,
    });

  if (loading) {
    return <FullScreenLoader />;
  }
  if (!contactDetails) {
    return (
      <DefaultBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Contact not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.allNotesLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </DefaultBackground>
    );
  }

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : insets.top },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButtonSmall}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Image source={ImageModule.logo} style={styles.logoImgSmall} />
          </View>
          <TouchableOpacity
            onPress={handleSearchPress}
            style={styles.iconButtonSmall}
          >
            <Feather name="search" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color={theme.colors.white} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
            <Feather name="edit-2" size={18} color={theme.colors.white} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleAddNote}>
            <Feather name="file-plus" size={18} color={theme.colors.white} />
            <Text style={styles.actionText}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={toggleAllSections}
          >
            <Feather
              name={areAllSectionsOpen ? "minimize-2" : "maximize-2"}
              size={18}
              color={theme.colors.white}
            />
            <Text style={styles.actionText}>
              {areAllSectionsOpen ? "Collapse" : "Expand"} +
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainInfoCard}>
            <View style={styles.avatarDisplaySection}>
              {contactDetails.photo ? (
                <Image
                  source={{ uri: contactDetails.photo }}
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
              <Text style={styles.userName}>{contactDetails.full_name}</Text>
            </View>

            <CollapsibleSection
              title="Personal Information"
              isOpen={sectionOpenState.personal}
              onPress={() => toggleSection("personal")}
            >
              <InfoDisplayField label="Name" value={contactDetails.full_name} />
              <InfoDisplayField
                label="Description"
                value={contactDetails.description}
              />
              <InfoDisplayField
                label="Birthday"
                value={dayjs(contactDetails.birthday).format("MM-DD-YYYY")}
              />
              <InfoDisplayField label="Email" value={contactDetails.email} />
              <InfoDisplayField label="Number" value={contactDetails.phone} />
              <InfoDisplayField
                label="Anniversary"
                value={dayjs(contactDetails.anniversary).format("MM-DD-YYYY")}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Spouse Details"
              isOpen={sectionOpenState.spouse}
              onPress={() => toggleSection("spouse")}
            >
              <InfoDisplayField
                label="Spouse Name"
                value={contactDetails.spouse_name}
              />
              <InfoDisplayField
                label="Spouse Birthday"
                value={dayjs(contactDetails.spouse_birthday).format(
                  "MM-DD-YYYY"
                )}
              />
              <InfoDisplayField
                label="Spouse Details"
                value={contactDetails.spouse_details}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Children Details"
              isOpen={sectionOpenState.children}
              onPress={() => toggleSection("children")}
            >
              {contactDetails.children?.map((child: any, index: any) => (
                <View key={child.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>Child {index + 1}</Text>
                  <InfoDisplayField label="Name" value={child.name} />
                  <InfoDisplayField
                    label="Birthday"
                    value={dayjs(child.birthday).format("MM-DD-YYYY")}
                  />
                  <InfoDisplayField label="Details" value={child.details} />
                </View>
              ))}
              {(!contactDetails.children ||
                contactDetails.children.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No children details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Employment Details"
              isOpen={sectionOpenState.employment}
              onPress={() => toggleSection("employment")}
            >
              {contactDetails.previous_employers?.map(
                (job: any, index: any) => (
                  <View key={job.id} style={styles.arrayItemCard}>
                    <Text style={styles.arrayItemTitle}>
                      Employment {index + 1}
                    </Text>
                    <InfoDisplayField label="Employer" value={job.name} />
                    <InfoDisplayField label="Details" value={job.details} />
                  </View>
                )
              )}
              {(!contactDetails.previous_employers ||
                contactDetails.previous_employers.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No employment details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Education Details"
              isOpen={sectionOpenState.education}
              onPress={() => toggleSection("education")}
            >
              {contactDetails.universities?.map((edu: any, index: any) => (
                <View key={edu.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>
                    Education {index + 1}
                  </Text>
                  <InfoDisplayField label="Institution" value={edu.name} />
                  <InfoDisplayField label="Details" value={edu.details} />
                </View>
              ))}
              {(!contactDetails.universities ||
                contactDetails.universities.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No education details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Interests"
              isOpen={sectionOpenState.interests}
              onPress={() => toggleSection("interests")}
            >
              {contactDetails.interests?.map((interest: any) => (
                <Text key={interest.id} style={styles.interestItemValue}>
                  • {interest.name}
                </Text>
              ))}
              {(!contactDetails.interests ||
                contactDetails.interests.length === 0) && (
                <Text style={styles.noArrayItemsText}>No interests added.</Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Others (Custom Fields)"
              isOpen={sectionOpenState.others}
              onPress={() => toggleSection("others")}
            >
              {contactDetails.custom_fields?.map((field: any) => (
                <InfoDisplayField
                  key={field.id || field.title}
                  label={field.title}
                >
                  {field.values.map((val: any, idx: any) => (
                    <Text key={idx} style={styles.infoValue}>
                      • {val}
                    </Text>
                  ))}
                </InfoDisplayField>
              ))}
              {(!contactDetails.custom_fields ||
                contactDetails.custom_fields.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No custom fields added.
                </Text>
              )}
            </CollapsibleSection>
          </View>

          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Notes</Text>
              <TouchableOpacity onPress={handleViewAllNotes}>
                <Text style={styles.allNotesLink}>
                  All notes{" "}
                  <Feather
                    name="arrow-right-circle"
                    size={14}
                    color={theme.colors.primary}
                  />
                </Text>
              </TouchableOpacity>
            </View>
            {contactDetails.contact_notes?.map((note: any) => (
              <View key={note.id} style={styles.noteItem}>
                <Text style={styles.noteDate}>
                  <Feather name="calendar" size={13} />{" "}
                  {note.reminder
                    ? dayjs(note.reminder).format("MM-DD-YYYY")
                    : ""}
                </Text>
                <Text style={styles.noteContent} numberOfLines={2}>
                  {note.note}
                </Text>
                <Text style={styles.noteCreationDate}>
                  Noted created at <Feather name="clock" size={13} />{" "}
                  {dayjs(note.created_at).format("MM-DD-YYYY")}
                </Text>
              </View>
            ))}
            {(!contactDetails.contact_notes ||
              contactDetails.contact_notes.length === 0) && (
              <Text style={styles.noNotesText}>
                No notes yet for this contact.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  // ... (Most styles remain the same, check for consistency with new data)
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iconButtonSmall: {
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: { alignItems: "center", flex: 1, marginHorizontal: 10 },
  headerContactName: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.white,
    textAlign: "center",
  },
  logoImgSmall: {
    width: "50%",
    height: 35,
    resizeMode: "contain",
    opacity: 0.8,
    marginTop: 2,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 15,
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 5,
    marginBottom: 15,
  },
  actionItem: { alignItems: "center", paddingHorizontal: 5 },
  actionText: {
    color: theme.colors.white,
    fontSize: 11,
    ...theme.font.fontMedium,
    marginTop: 3,
  },
  contentScrollView: { flex: 1 },
  mainInfoCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  avatarDisplaySection: { alignItems: "center", paddingVertical: 20 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  // userName under avatar was removed as name is in header
  collapsibleSection: { borderTopWidth: 1, borderTopColor: theme.colors.grey },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  sectionContent: { paddingBottom: 15, paddingHorizontal: 20 },
  infoField: { marginBottom: 12 },
  infoLabel: {
    fontSize: 13,
    ...theme.font.fontMedium,
    color: theme.colors.grey /* Changed to grey */,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.white,
  },
  arrayItemCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  arrayItemTitle: {
    fontSize: 14,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey,
    paddingBottom: 3,
  },
  interestItemValue: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.white,
    marginLeft: 5,
    marginBottom: 5,
  },
  notesCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 18,
    ...theme.font.fontBold,
    color: theme.colors.black,
  },
  allNotesLink: {
    fontSize: 14,
    ...theme.font.fontSemiBold,
    color: theme.colors.primary,
  },
  noteItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey,
  }, // Changed separator to grey
  noteDate: {
    fontSize: 12,
    /* API provides reminder or created_at */ ...theme.font.fontSemiBold,
    color: theme.colors.secondary,
    marginBottom: 3,
  },
  noteContent: {
    fontSize: 14,
    ...theme.font.fontRegular,
    color: theme.colors.text,
    marginBottom: 4,
  },
  noteCreationDate: {
    fontSize: 11,
    ...theme.font.fontRegular,
    color: theme.colors.grey,
  },
  noNotesText: {
    textAlign: "center",
    color: theme.colors.grey,
    paddingVertical: 10,
  },
  noArrayItemsText: {
    color: theme.colors.grey,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  }, // Ensure primary is defined
  errorText: {
    color: theme.colors.white,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  userName: {
    ...theme.font.fontBold,
    fontSize: 15,
    color: theme.colors.white,
    paddingHorizontal: 5,
    marginTop: 5,
  },
});

export default ViewContactScreen;
