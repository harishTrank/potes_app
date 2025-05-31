import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Header from "../../Components/Header";
import ActionButtons from "../../Components/ActionButtons";

// --- Navigation & Props ---
type SearchResultScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void; // If navigated from another screen
  openDrawer: () => void;
};
interface SearchResultScreenProps {
  navigation: SearchResultScreenNavigationProp;
  route: any; // Expects route.params.searchQuery
}

// --- Data Structures for Search Results ---
interface BaseSearchResult {
  id: string;
  contactName: string; // Name of the primary contact associated
  // avatarUri?: string; // Optional contact avatar
}
interface ChildResult extends BaseSearchResult {
  childName: string;
}
interface InterestResult extends BaseSearchResult {
  interestValue: string;
}
interface NoteResult extends BaseSearchResult {
  noteContent: string;
  noteDate?: string; // Optional
}

type SearchResultItem = ChildResult | InterestResult | NoteResult;

interface SearchResultSection {
  title: string; // e.g., "Children", "Interest", "Notes"
  data: SearchResultItem[];
}

// --- Mock Data (Simulate data that would be searched) ---
const mockContactsForSearch = [
  {
    id: "c1",
    name: "Test Test",
    children: [{ name: "test child" }],
    interests: [],
    notes: [
      {
        id: "n_tt_1",
        content: "Python is one of the most popular programming language...",
      },
    ],
  },
  {
    id: "c2",
    name: "POOJA",
    children: [],
    interests: [{ value: "hfghf" }, { value: "fhrtfhrtf" }],
    notes: [
      { id: "n_pooja_1", content: "helloooooooooooooooooooooo" },
      {
        id: "n_pooja_2",
        content: "Python is one of the most popular programming language...",
      },
      {
        id: "n_pooja_3",
        content: "Python is one of the most akes It beginner-friendly.",
      },
      {
        id: "n_pooja_4",
        content: "Python is one of the most popular programming language...",
      },
    ],
  },
  {
    id: "c3",
    name: "demo",
    children: [],
    interests: [],
    notes: [
      {
        id: "n_demo_1",
        content: "gdgdfhfdPython is one of the most popular la...",
      },
    ],
  },
  {
    id: "c4",
    name: "zzzzzz",
    children: [],
    interests: [],
    notes: [{ id: "n_zz_1", content: "Python is one of the most." }],
  },
];

// --- Search Logic and Highlighting ---
const performSearch = (query: string): SearchResultSection[] => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  const results: {
    children: ChildResult[];
    interests: InterestResult[];
    notes: NoteResult[];
  } = {
    children: [],
    interests: [],
    notes: [],
  };

  mockContactsForSearch.forEach((contact) => {
    // Search in contact children names
    contact.children?.forEach((child, index) => {
      if (child.name.toLowerCase().includes(lowerQuery)) {
        results.children.push({
          id: `${contact.id}-child-${index}`,
          contactName: contact.name,
          childName: child.name,
        });
      }
    });
    // Search in contact interests
    contact.interests?.forEach((interest, index) => {
      if (interest.value.toLowerCase().includes(lowerQuery)) {
        results.interests.push({
          id: `${contact.id}-interest-${index}`,
          contactName: contact.name,
          interestValue: interest.value,
        });
      }
    });
    // Search in contact notes
    contact.notes?.forEach((note) => {
      if (note.content.toLowerCase().includes(lowerQuery)) {
        results.notes.push({
          id: note.id,
          contactName: contact.name,
          noteContent: note.content,
        });
      }
    });
    // Could also search in contact.nameOrDescription, email, number etc. and categorize them differently.
  });

  const sections: SearchResultSection[] = [];
  if (results.children.length > 0)
    sections.push({ title: "Children", data: results.children });
  if (results.interests.length > 0)
    sections.push({ title: "Interest", data: results.interests });
  if (results.notes.length > 0)
    sections.push({ title: "Notes", data: results.notes });

  return sections;
};

const highlightQuery = (text: string, query: string): React.ReactNode[] => {
  if (!query) return [<Text key="fulltext">{text}</Text>];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let partIndex = 0;

  while (lastIndex < text.length) {
    const index = lowerText.indexOf(lowerQuery, lastIndex);
    if (index === -1) {
      parts.push(
        <Text key={`part-${partIndex++}`}>{text.substring(lastIndex)}</Text>
      );
      break;
    }
    // Text before match
    if (index > lastIndex) {
      parts.push(
        <Text key={`part-${partIndex++}`}>
          {text.substring(lastIndex, index)}
        </Text>
      );
    }
    // Matched text (highlighted)
    parts.push(
      <Text key={`highlight-${partIndex++}`} style={styles.highlightedText}>
        {text.substring(index, index + query.length)}
      </Text>
    );
    lastIndex = index + query.length;
  }
  return parts;
};

interface SearchResultItemProps {
  item: SearchResultItem;
  searchQuery: string;
}
const SearchResultDisplayItem: React.FC<SearchResultItemProps> = ({
  item,
  searchQuery,
}) => {
  let primaryContent: string = "";
  if ("childName" in item) primaryContent = item.childName;
  else if ("interestValue" in item) primaryContent = item.interestValue;
  else if ("noteContent" in item) primaryContent = item.noteContent;

  return (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => console.log("View item:", item.id)}
    >
      <View style={styles.itemAvatarPlaceholder}>
        <Feather name="user" size={18} color={theme.colors.white} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemContactName} numberOfLines={1}>
          {item.contactName}
        </Text>
        <Text style={styles.itemContentText} numberOfLines={2}>
          {highlightQuery(primaryContent, searchQuery)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen Component ---
const SearchResultScreen: React.FC<SearchResultScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const searchQueryFromRoute = route.params?.searchQuery || ""; // Get query from navigation
  const [searchQuery, setSearchQuery] = useState(searchQueryFromRoute); // Allow local modification if needed
  const [searchResults, setSearchResults] = useState<SearchResultSection[]>([]);

  useEffect(() => {
    // Perform search when searchQuery changes or on initial load if query is passed
    const results = performSearch(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  // This would be called by the Header's search input
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleProfilePress = () => navigation.navigate("UserProfileScreen");
  const handleCreateContact = () => navigation.navigate("CreateContactScreen");
  const handleCreateNote = () => navigation.navigate("CreateNoteScreen");
  const handleMenuPress = () => navigation.openDrawer();

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

        <Text style={styles.searchResultTitle}>
          Search result for "{searchQuery}"
        </Text>

        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {searchResults.length === 0 && searchQuery ? (
            <Text style={styles.noResultsText}>
              No results found for "{searchQuery}".
            </Text>
          ) : (
            searchResults.map((section) => (
              <View key={section.title} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.data.map((item) => (
                  <SearchResultDisplayItem
                    key={item.id}
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
  searchResultTitle: {
    fontSize: 18,
    ...theme.font.fontSemiBold,
    color: theme.colors.white, // Assuming white text on primary background
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: theme.colors.secondary, // Dark grey card
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18, // Slightly smaller than HomePage section titles
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
  itemAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  itemInfo: { flex: 1 },
  itemContactName: {
    fontSize: 13, // Smaller for contact name context
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
    backgroundColor: theme.colors.primary, // Or a specific highlight color from your theme
    color: theme.colors.white, // Ensure contrast
    // fontWeight: 'bold', // Optional
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
