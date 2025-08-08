import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Header from "../../Components/Header";
import ActionButtons from "../../Components/ActionButtons";
import { mainSearchApi } from "../../../store/Services/Others"; // Ensure this path is correct
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
// --- Navigation & Props ---
type SearchResultScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void;
  openDrawer: () => void;
};
interface SearchResultScreenProps {
  navigation: SearchResultScreenNavigationProp;
  route: { params: { searchQuery: string } };
}

// --- Updated Data Structures ---
interface ApiContactMatch {
  type: "contact";
  id: number | string; // Unique contact ID
  contactName: string;
  avatarUri?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface ApiNoteMatch {
  type: "note";
  id: number | string; // Unique note ID
  contactId: number | string; // ID of the contact this note belongs to
  contactName: string; // Name of the contact this note belongs to
  noteContent: string;
  avatarUri?: string | null;
}

interface ApiSpouseMatch {
  type: "spouse";
  id: number | string; // Unique contact ID (of the person with the spouse)
  contactName: string; // Name of the contact
  spouseName: string; // Name of the spouse
  avatarUri?: string | null;
}

interface ApiChildMatch {
  type: "child";
  id: string; // Composite unique ID for rendering key
  parentContactId: number | string; // Actual ID of the parent contact
  contactName: string; // Parent contact's full_name (from API: childData.full_name)
  childName: string; // Actual child's name (from API: childData.child_name)
  avatarUri?: string | null;
}

interface ApiEmployerMatch {
  type: "employer";
  id: string; // Composite unique ID
  parentContactId: number | string;
  contactName: string;
  employerName: string;
  avatarUri?: string | null;
}

interface ApiUniversityMatch {
  type: "university";
  id: string; // Composite unique ID
  parentContactId: number | string;
  contactName: string;
  universityName: string;
  avatarUri?: string | null;
}

interface ApiInterestMatch {
  type: "interest";
  id: string; // Composite unique ID
  parentContactId: number | string;
  contactName: string;
  interestName: string;
  avatarUri?: string | null;
}

type UnifiedSearchResultItem =
  | ApiContactMatch
  | ApiNoteMatch
  | ApiSpouseMatch
  | ApiChildMatch
  | ApiEmployerMatch
  | ApiUniversityMatch
  | ApiInterestMatch;

interface UnifiedSearchResultSection {
  title: string;
  data: UnifiedSearchResultItem[];
}

// --- Highlighting Logic (remains the same) ---
const highlightQuery = (text: string, query: string): React.ReactNode[] => {
  if (!query || !text) {
    return [<Text key="fulltext">{text || ""}</Text>];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    // No match → return whole text
    return [<Text key="fulltext">{text}</Text>];
  }

  // Calculate start/end positions with boundaries
  const start = Math.max(0, index - 25);
  const end = Math.min(text.length, index + query.length + 25);

  // Get the substring with context
  const before = text.substring(start, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length, end);

  return [
    <Text key="before">
      {start > 0 ? "…" : ""}
      {before}
    </Text>,
    <Text key="highlight" style={styles.highlightedText}>
      {match}
    </Text>,
    <Text key="after">
      {after}
      {end < text.length ? "…" : ""}
    </Text>,
  ];
};


// --- SearchResultDisplayItem (Updated onPress) ---
interface UnifiedSearchResultItemProps {
  item: UnifiedSearchResultItem;
  searchQuery: string;
}
const SearchResultDisplayItem: React.FC<UnifiedSearchResultItemProps> = ({
  item,
  searchQuery,
}) => {
  // Removed ': any' for better type safety if possible
  let primaryContent: string = "";
  let displayContactName: string | null = item.contactName;
  let itemAvatar: string | null | undefined = undefined;
  const navigation = useNavigation<SearchResultScreenNavigationProp>(); // Typed navigation

  switch (item.type) {
    case "contact":
      primaryContent = item.contactName;
      displayContactName = null; // Contact name is the primary content
      itemAvatar = item.avatarUri;
      break;
    case "note":
      primaryContent = item.noteContent;
      // displayContactName is item.contactName (parent contact's name)
      itemAvatar = item.avatarUri;
      break;
    case "spouse":
      primaryContent = item.spouseName;
      // displayContactName is item.contactName (main contact's name)
      itemAvatar = item.avatarUri;
      break;
    case "child":
      primaryContent = item.childName;
      // displayContactName is item.contactName (parent contact's name)
      itemAvatar = item.avatarUri; // Should ideally be parent's avatar
      break;
    case "employer":
      primaryContent = item.employerName;
      itemAvatar = item.avatarUri;
      break;
    case "university":
      primaryContent = item.universityName;
      itemAvatar = item.avatarUri;
      break;
    case "interest":
      primaryContent = item.interestName;
      itemAvatar = item.avatarUri;
      break;
    default:
      // This case should ideally not be reached if types are exhaustive
      const exhaustiveCheck: never = item;
      primaryContent = "Unknown item type";
      break;
  }

  const onItemPress = () => {
    if (item.type === "note") {
      navigation.navigate("AllNotesScreen", {
        contactId: item.contactId, // This is the parent contact's ID
        noteId: item.id, // This is the note's actual ID
      });
    } else {
      let contactIdToNavigate: number | string;

      if (item.type === "contact" || item.type === "spouse") {
        // For Contact and Spouse, item.id is already the relevant contact's ID
        contactIdToNavigate = item.id;
      } else if (item.type === "child") {
        contactIdToNavigate = item.parentContactId;
      } else if (item.type === "employer") {
        contactIdToNavigate = item.parentContactId;
      } else if (item.type === "university") {
        contactIdToNavigate = item.parentContactId;
      } else if (item.type === "interest") {
        contactIdToNavigate = item.parentContactId;
      } else {
        console.warn("Unknown item type for navigation:", (item as any).type);
        return;
      }
      // item.contactName should be the name of the contact we are navigating to,
      // or the parent contact in case of child/employer etc.
      navigation.navigate("ViewContactScreen", {
        contactId: contactIdToNavigate,
        // contactName: item.contactName, // Already part of ViewContactScreen's logic or fetched there
      });
    }
  };

  return (
    <TouchableOpacity style={styles.resultItem} onPress={onItemPress}>
      <View style={styles.itemAvatarContainer}>
        {itemAvatar ? (
          <FastImage
            source={{ uri: itemAvatar, priority: FastImage.priority.normal }}
            style={styles.itemAvatarImage}
          />
        ) : (
          <View style={styles.itemAvatarPlaceholder}>
            <Feather name="user" size={18} color={theme.colors.white} />
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        {displayContactName ? (
          <Text style={styles.itemContactName} numberOfLines={1}>
            {displayContactName}
          </Text>
        ) : null}
        <Text style={styles.itemContentText} numberOfLines={2}>
          {highlightQuery(primaryContent, searchQuery)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen Component (Updated ID generation) ---
const SearchResultScreen: React.FC<SearchResultScreenProps> = ({
  route,
  // navigation prop is available but useNavigation is also used in child
}) => {
  const insets = useSafeAreaInsets();
  const { searchQuery } = route.params;
  const [searchResults, setSearchResults] = useState<
    UnifiedSearchResultSection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      setLoading(true);
      setError(null);
      mainSearchApi({ query: { q: searchQuery } })
        .then((res: any) => {
          const apiData = res.data || res;
          if (!apiData || typeof apiData !== "object") {
            setError("Invalid API response structure.");
            setSearchResults([]);
            setLoading(false);
            return;
          }
          const newSections: UnifiedSearchResultSection[] = [];

          // Contacts
          if (
            apiData.contacts &&
            Array.isArray(apiData.contacts) &&
            apiData.contacts.length > 0
          ) {
            const contactItems: ApiContactMatch[] = apiData.contacts.map(
              (contact: any) => ({
                type: "contact" as const,
                id: contact.id, // contact.id is unique
                contactName: contact.full_name,
                avatarUri: contact.photo,
                email: contact.email,
                phone: contact.phone,
              })
            );
            newSections.push({ title: "Contacts", data: contactItems });
          }

          // Notes
          const matchedNotes: ApiNoteMatch[] = [];
          if (apiData.notes && Array.isArray(apiData.notes)) {
            apiData.notes.forEach((note: any) => {
              if (note?.note) {
                // Ensure note object and note content exist
                matchedNotes.push({
                  type: "note" as const,
                  id: note.id, // note.id is unique
                  contactId: note.contact.id, // Store parent contact ID
                  contactName: note.contact.full_name,
                  noteContent: note.note,
                  avatarUri: note.contact?.photo, // Use optional chaining
                });
              }
            });
          }
          if (matchedNotes.length > 0) {
            newSections.push({ title: "Notes", data: matchedNotes });
          }

          // Spouse
          if (
            apiData.spouse &&
            Array.isArray(apiData.spouse) &&
            apiData.spouse.length > 0
          ) {
            const spouseItems: ApiSpouseMatch[] = apiData.spouse.map(
              (contact: any) => ({
                // API returns the main contact object
                type: "spouse" as const,
                id: contact.id, // contact.id of the person WITH the spouse
                contactName: contact.full_name,
                spouseName: contact.spouse_name,
                avatarUri: contact.photo,
              })
            );
            newSections.push({ title: "Spouse", data: spouseItems });
          }

          // Children
          if (
            apiData.childs &&
            Array.isArray(apiData.childs) &&
            apiData.childs.length > 0
          ) {
            const childItems: ApiChildMatch[] = apiData.childs.map(
              (childData: any, index: number) => ({
                type: "child" as const,
                // childData.id is parent_contact_id. childData.child_name is the child's name.
                id: `child-${childData.id}-${childData.child_name.replace(
                  /\s+/g,
                  "_"
                )}-${index}`, // Unique composite ID
                parentContactId: childData.id, // Store original parent ID
                contactName: childData.full_name, // Parent's name from API
                childName: childData.child_name,
                avatarUri: childData.photo, // Assuming childData might have parent's photo or its own
              })
            );
            newSections.push({ title: "Children", data: childItems });
          }

          // Employers
          if (
            apiData.employers &&
            Array.isArray(apiData.employers) &&
            apiData.employers.length > 0
          ) {
            const employerItems: ApiEmployerMatch[] = apiData.employers.map(
              (empData: any, index: number) => ({
                type: "employer" as const,
                id: `employer-${empData.id}-${empData.employer_name.replace(
                  /\s+/g,
                  "_"
                )}-${index}`, // Unique composite ID
                parentContactId: empData.id,
                contactName: empData.full_name,
                employerName: empData.employer_name,
                avatarUri: empData.photo,
              })
            );
            newSections.push({ title: "Employers", data: employerItems });
          }

          // Universities
          if (
            apiData.universities &&
            Array.isArray(apiData.universities) &&
            apiData.universities.length > 0
          ) {
            const uniItems: ApiUniversityMatch[] = apiData.universities.map(
              (uniData: any, index: number) => ({
                type: "university" as const,
                id: `university-${uniData.id}-${uniData.university.replace(
                  /\s+/g,
                  "_"
                )}-${index}`, // Unique composite ID
                parentContactId: uniData.id,
                contactName: uniData.full_name,
                universityName: uniData.university,
                avatarUri: uniData.photo,
              })
            );
            newSections.push({ title: "Universities", data: uniItems });
          }

          // Interests
          if (
            apiData.interests &&
            Array.isArray(apiData.interests) &&
            apiData.interests.length > 0
          ) {
            const interestItems: ApiInterestMatch[] = apiData.interests.map(
              (intData: any, index: number) => ({
                type: "interest" as const,
                id: `interest-${intData.id}-${intData.interest.replace(
                  /\s+/g,
                  "_"
                )}-${index}`, // Unique composite ID
                parentContactId: intData.id,
                contactName: intData.full_name,
                interestName: intData.interest,
                avatarUri: intData.photo,
              })
            );
            newSections.push({ title: "Interests", data: interestItems });
          }

          const finalSections = newSections.filter(
            (section) => section.data.length > 0
          );
          setSearchResults(finalSections);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error("API Error in SearchResultScreen:", err);
          setError(
            err.message || "Failed to fetch search results. Please try again."
          );
          setSearchResults([]);
          setLoading(false);
        });
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [searchQuery, route.params?.searchQuery]);

  if (loading) {
    return (
      <DefaultBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.white} />
          <Text style={styles.loadingText}>
            Searching for "{searchQuery}"...
          </Text>
        </View>
      </DefaultBackground>
    );
  }

  if (error) {
    return (
      <DefaultBackground>
        <StatusBar style="light" />
        <View
          style={[
            styles.flexContainer,
            { paddingTop: Platform.OS === "android" ? insets.top : 0 },
          ]}
        >
          <Header menu={false} />
          <ActionButtons />
          <View style={styles.centered}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        </View>
      </DefaultBackground>
    );
  }

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View style={[styles.flexContainer]}>
        <Header menu={false} />
        <ActionButtons />

        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {searchResults.length === 0 && searchQuery ? ( // Only show "no results" if a search was made
            <Text style={styles.noResultsText}>
              No results found for "{searchQuery}".
            </Text>
          ) : (
            searchResults.map((section) => (
              <View key={section.title} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.data.map((item) => (
                  <SearchResultDisplayItem
                    key={item.id} // Now item.id is guaranteed to be unique
                    item={item}
                    searchQuery={searchQuery}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  scrollableContent: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.white,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.red || "red",
    textAlign: "center",
  },
  searchResultTitle: {
    fontSize: 18,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    ...theme.font.fontBold,
    color: theme.colors.white,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey,
  },
  itemAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  itemAvatarImage: {
    width: "100%",
    height: "100%",
  },
  itemAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: { flex: 1 },
  itemContactName: {
    fontSize: 13,
    ...theme.font.fontRegular,
    color: theme.colors.grey,
    marginBottom: 3,
  },
  itemContentText: {
    fontSize: 15,
    ...theme.font.fontMedium,
    color: theme.colors.white,
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: "yellow",
    color: theme.colors.black,
    ...theme.font.fontBold,
  },
  noResultsText: {
    textAlign: "center",
    color: theme.colors.white,
    fontSize: 16,
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default SearchResultScreen;
