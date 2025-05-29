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
import ImageModule from "../../../ImageModule"; // Assuming ImageModule.logo exists

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Navigation & Props ---
type ViewContactScreenNavigationProp = {
  goBack: () => void;
  navigate: (screen: string, params?: object) => void;
};
interface ViewContactScreenProps {
  navigation: ViewContactScreenNavigationProp;
  route: any; // Assuming contactId or contact object is passed via route params
}

// --- Data Structures (can be imported from CreateContactScreen if shared) ---
interface ChildDetail {
  id: string;
  name: string;
  birthday: string | null;
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
interface Note {
  id: string;
  date: string;
  content: string;
  createdAt: string;
}

interface ContactFullDetails {
  id: string;
  avatarUri: string | null;
  nameOrDescription: string;
  birthday: string | null;
  anniversary: string | null;
  email: string;
  number: string;
  spouseName?: string;
  spouseBirthday?: string | null;
  spouseDetails?: string;
  children?: ChildDetail[];
  employmentHistory?: EmploymentDetail[];
  educationHistory?: EducationDetail[];
  interests?: InterestDetail[];
  customFields?: CustomField[];
  notes?: Note[];
}

// --- Mock Data ---
const mockContact: ContactFullDetails = {
  id: "contact123",
  avatarUri: null, // Replace with an actual URI or keep null for placeholder
  nameOrDescription: "POOJA",
  birthday: "05-29-2025",
  anniversary: "06-19-2025",
  email: "pooja@gmail.com",
  number: "756.757.5665",
  spouseName: "Spouse Name Example",
  spouseBirthday: "08-15-2025",
  spouseDetails: "Details about spouse here.",
  children: [
    {
      id: "c1",
      name: "Child One",
      birthday: "10-10-2028",
      details: "Loves to draw.",
    },
    {
      id: "c2",
      name: "Child Two",
      birthday: "12-01-2030",
      details: "Plays the piano.",
    },
  ],
  employmentHistory: [
    {
      id: "e1",
      employerName: "Tech Solutions Inc.",
      employerDetails: "Software Engineer, 2020-Present",
    },
  ],
  educationHistory: [
    {
      id: "edu1",
      universityName: "State University",
      universityDetails: "B.Sc. Computer Science, 2016-2020",
    },
  ],
  interests: [
    { id: "i1", value: "hfghf" },
    { id: "i2", value: "fhrfthrtf" },
  ],
  customFields: [
    { id: "cf1", title: "Favorite Color", value: "Blue" },
    { id: "cf2", title: "Blood Group", value: "O+" },
  ],
  notes: [
    {
      id: "n1",
      date: "05-30-2025",
      content: "helloooooooooooooooooo",
      createdAt: "05-29-2025",
    },
    {
      id: "n2",
      date: "06-02-2025",
      content: "Python is one of the most popular programming languages.",
      createdAt: "05-29-2025",
    },
    {
      id: "n3",
      date: "05-27-2025",
      content: "Python is one of the most akes It beginner-friendly.",
      createdAt: "05-29-2025",
    },
  ],
};

// --- Collapsible Section Component (can be a shared component) ---
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onPress: () => void;
}
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  isOpen,
  onPress,
}) => {
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
  if (!value && !children) return null; // Don't render if no value or children
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {value && <Text style={styles.infoValue}>{value}</Text>}
      {children}
    </View>
  );
};

// --- Main Screen Component ---
const ViewContactScreen: React.FC<ViewContactScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  // const contactId = route.params?.contactId; // Get contactId from navigation
  const [contactDetails, setContactDetails] =
    useState<ContactFullDetails | null>(mockContact); // Load with mock or fetch
  const [areAllSectionsOpen, setAreAllSectionsOpen] = useState(false);

  // State for individual section visibility
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

  // useEffect(() => {
  //   // Fetch contact details based on contactId and setContactDetails
  //   // For now, using mockContact
  //   if (contactId) setContactDetails(mockContact);
  // }, [contactId]);

  const handleSearchPress = () => console.log("Search pressed on View Contact");
  const handleDelete = () =>
    Alert.alert("Delete Contact", "Are you sure you want to delete POOJA?", [
      { text: "Cancel" },
      { text: "Delete", onPress: () => console.log("Deleted") },
    ]);
  const handleEdit = () =>
    navigation.navigate("EditContactScreen", { contactData: contactDetails });
  const handleAddNote = () =>
    navigation.navigate("CreateNoteScreen", {
      contactId: contactDetails?.id,
      contactName: contactDetails?.nameOrDescription,
    });
  const handleViewAllNotes = () =>
    navigation.navigate("ContactNotesScreen", {
      contactId: contactDetails?.id,
    });

  if (!contactDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
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

        {/* Action Bar */}
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
            {/* Avatar */}
            <View style={styles.avatarDisplaySection}>
              {contactDetails.avatarUri ? (
                <Image
                  source={{ uri: contactDetails.avatarUri }}
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
              <Text style={styles.userName}>
                {contactDetails.nameOrDescription}
              </Text>
            </View>

            {/* Collapsible Sections */}
            <CollapsibleSection
              title="Personal Information"
              isOpen={sectionOpenState.personal}
              onPress={() => toggleSection("personal")}
            >
              <InfoDisplayField
                label="Name or Description"
                value={contactDetails.nameOrDescription}
              />
              <InfoDisplayField
                label="Birthday"
                value={contactDetails.birthday}
              />
              <InfoDisplayField label="Email" value={contactDetails.email} />
              <InfoDisplayField label="Number" value={contactDetails.number} />
              <InfoDisplayField
                label="Anniversary"
                value={contactDetails.anniversary}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Spouse Details"
              isOpen={sectionOpenState.spouse}
              onPress={() => toggleSection("spouse")}
            >
              <InfoDisplayField
                label="Spouse Name"
                value={contactDetails.spouseName}
              />
              <InfoDisplayField
                label="Spouse Birthday"
                value={contactDetails.spouseBirthday}
              />
              <InfoDisplayField
                label="Spouse Details"
                value={contactDetails.spouseDetails}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Children Details"
              isOpen={sectionOpenState.children}
              onPress={() => toggleSection("children")}
            >
              {contactDetails.children?.map((child, index) => (
                <View key={child.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>Child {index + 1}</Text>
                  <InfoDisplayField label="Name" value={child.name} />
                  <InfoDisplayField label="Birthday" value={child.birthday} />
                  <InfoDisplayField label="Details" value={child.details} />
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="Employment Details"
              isOpen={sectionOpenState.employment}
              onPress={() => toggleSection("employment")}
            >
              {contactDetails.employmentHistory?.map((job, index) => (
                <View key={job.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>
                    Employment {index + 1}
                  </Text>
                  <InfoDisplayField label="Employer" value={job.employerName} />
                  <InfoDisplayField
                    label="Details"
                    value={job.employerDetails}
                  />
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="University Details"
              isOpen={sectionOpenState.education}
              onPress={() => toggleSection("education")}
            >
              {contactDetails.educationHistory?.map((edu, index) => (
                <View key={edu.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>
                    Education {index + 1}
                  </Text>
                  <InfoDisplayField
                    label="Institution"
                    value={edu.universityName}
                  />
                  <InfoDisplayField
                    label="Details"
                    value={edu.universityDetails}
                  />
                </View>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="Interests"
              isOpen={sectionOpenState.interests}
              onPress={() => toggleSection("interests")}
            >
              {contactDetails.interests?.map((interest) => (
                <Text key={interest.id} style={styles.interestItemValue}>
                  • {interest.value}
                </Text>
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              title="Others"
              isOpen={sectionOpenState.others}
              onPress={() => toggleSection("others")}
            >
              {contactDetails.customFields?.map((field) => (
                <InfoDisplayField
                  key={field.id}
                  label={field.title}
                  value={field.value}
                />
              ))}
            </CollapsibleSection>
          </View>

          {/* Notes Section */}
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
            {contactDetails.notes?.slice(0, 3).map(
              (
                note // Display first 3 notes
              ) => (
                <View key={note.id} style={styles.noteItem}>
                  <Text style={styles.noteDate}>
                    <Feather name="calendar" size={13} /> {note.date}
                  </Text>
                  <Text style={styles.noteContent} numberOfLines={2}>
                    {note.content}
                  </Text>
                  <Text style={styles.noteCreationDate}>
                    Noted created at <Feather name="clock" size={13} />{" "}
                    {note.createdAt}
                  </Text>
                </View>
              )
            )}
            {(!contactDetails.notes || contactDetails.notes.length === 0) && (
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
    width: "100%",
    height: 40,
    objectFit: "contain",
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
    color: theme.colors.grey,
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
  },
  noteDate: {
    fontSize: 14,
    ...theme.font.fontBold,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  userName: {
    ...theme.font.fontBold,
    fontSize: 15,
    color: theme.colors.white,
    paddingHorizontal: 5,
  },
});

export default ViewContactScreen;
