import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { mainSearchApi } from "../../../store/Services/Others";
import { useNavigation, useRoute } from "@react-navigation/native";
import FastImage from "react-native-fast-image";

interface ApiContactMatch {
  type: "contact";
  id: number | string;
  contactName: string;
  avatarUri?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface ApiNoteMatch {
  type: "note";
  id: number | string;
  contactId: number | string;
  contactName: string;
  noteContent: string;
  avatarUri?: string | null;
}

interface ApiSpouseMatch {
  type: "spouse";
  id: number | string;
  contactName: string;
  spouseName: string;
  avatarUri?: string | null;
}

interface ApiChildMatch {
  type: "child";
  id: string;
  parentContactId: number | string;
  contactName: string;
  childName: string;
  avatarUri?: string | null;
}

interface ApiEmployerMatch {
  type: "employer";
  id: string;
  parentContactId: number | string;
  contactName: string;
  employerName: string;
  avatarUri?: string | null;
}

interface ApiUniversityMatch {
  type: "university";
  id: string;
  parentContactId: number | string;
  contactName: string;
  universityName: string;
  avatarUri?: string | null;
}

interface ApiInterestMatch {
  type: "interest";
  id: string;
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

const highlightQuery = (text: string, query: string): React.ReactNode[] => {
  if (!query || !text) return [<Text key="fulltext">{text || ""}</Text>];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return [<Text key="fulltext">{text}</Text>];
  const start = Math.max(0, index - 25);
  const end = Math.min(text.length, index + query.length + 25);
  const before = text.substring(start, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length, end);
  return [
    <Text key="before">{start > 0 ? "…" : ""}{before}</Text>,
    <Text key="highlight" style={styles.highlightedText}>{match}</Text>,
    <Text key="after">{after}{end < text.length ? "…" : ""}</Text>,
  ];
};

const ItemAvatar = ({ uri, name }: { uri?: string | null; name: string }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
  if (uri) {
    return (
      <FastImage
        source={{ uri, priority: FastImage.priority.normal }}
        style={styles.avatarImage}
      />
    );
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarInitials}>{initials || <Feather name="user" size={14} color={theme.colors.white} />}</Text>
    </View>
  );
};

const SearchResultDisplayItem = ({
  item,
  searchQuery,
}: {
  item: UnifiedSearchResultItem;
  searchQuery: string;
}) => {
  const navigation = useNavigation<any>();
  let primaryContent = "";
  let displayContactName: string | null = item.contactName;
  let itemAvatar: string | null | undefined = undefined;

  switch (item.type) {
    case "contact":
      primaryContent = item.contactName;
      displayContactName = null;
      itemAvatar = item.avatarUri;
      break;
    case "note":
      primaryContent = item.noteContent;
      itemAvatar = item.avatarUri;
      break;
    case "spouse":
      primaryContent = item.spouseName;
      itemAvatar = item.avatarUri;
      break;
    case "child":
      primaryContent = item.childName;
      itemAvatar = item.avatarUri;
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
      const _exhaustive: never = item;
      break;
  }

  const onItemPress = () => {
    if (item.type === "note") {
      navigation.navigate("AllNotesScreen", { contactId: item.contactId, noteId: item.id });
    } else if (item.type === "contact" || item.type === "spouse") {
      navigation.navigate("ViewContactScreen", { contactId: item.id });
    } else if (
      item.type === "child" ||
      item.type === "employer" ||
      item.type === "university" ||
      item.type === "interest"
    ) {
      navigation.navigate("ViewContactScreen", { contactId: item.parentContactId });
    }
  };

  return (
    <TouchableOpacity style={styles.resultItem} onPress={onItemPress}>
      <View style={styles.avatarContainer}>
        <ItemAvatar uri={itemAvatar} name={displayContactName || primaryContent} />
      </View>
      <View style={styles.itemInfo}>
        {displayContactName ? (
          <Text style={styles.itemContactName} numberOfLines={1}>{displayContactName}</Text>
        ) : null}
        <Text style={styles.itemContentText} numberOfLines={2}>
          {highlightQuery(primaryContent, searchQuery)}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={theme.colors.grey} />
    </TouchableOpacity>
  );
};

const SearchResultScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const initialQuery = route?.params?.searchQuery || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<UnifiedSearchResultSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    mainSearchApi({ query: { q: activeQuery } })
      .then((res: any) => {
        const apiData = res.data || res;
        if (!apiData || typeof apiData !== "object") { setSearchResults([]); return; }
        const newSections: UnifiedSearchResultSection[] = [];

        if (apiData.contacts?.length > 0) {
          newSections.push({
            title: "Contacts",
            data: apiData.contacts.map((c: any) => ({
              type: "contact" as const, id: c.id, contactName: c.full_name, avatarUri: c.photo, email: c.email, phone: c.phone,
            })),
          });
        }
        const matchedNotes: ApiNoteMatch[] = (apiData.notes || [])
          .filter((n: any) => n?.note)
          .map((n: any) => ({ type: "note" as const, id: n.id, contactId: n.contact.id, contactName: n.contact.full_name, noteContent: n.note, avatarUri: n.contact?.photo }));
        if (matchedNotes.length > 0) newSections.push({ title: "Notes", data: matchedNotes });

        if (apiData.spouse?.length > 0) {
          newSections.push({
            title: "Spouse",
            data: apiData.spouse.map((c: any) => ({ type: "spouse" as const, id: c.id, contactName: c.full_name, spouseName: c.spouse_name, avatarUri: c.photo })),
          });
        }
        if (apiData.childs?.length > 0) {
          newSections.push({
            title: "Family Member",
            data: apiData.childs.map((c: any, i: number) => ({ type: "child" as const, id: `child-${c.id}-${i}`, parentContactId: c.id, contactName: c.full_name, childName: c.child_name, avatarUri: c.photo })),
          });
        }
        if (apiData.employers?.length > 0) {
          newSections.push({
            title: "Employers",
            data: apiData.employers.map((e: any, i: number) => ({ type: "employer" as const, id: `employer-${e.id}-${i}`, parentContactId: e.id, contactName: e.full_name, employerName: e.employer_name, avatarUri: e.photo })),
          });
        }
        if (apiData.universities?.length > 0) {
          newSections.push({
            title: "Universities",
            data: apiData.universities.map((u: any, i: number) => ({ type: "university" as const, id: `university-${u.id}-${i}`, parentContactId: u.id, contactName: u.full_name, universityName: u.university, avatarUri: u.photo })),
          });
        }
        if (apiData.interests?.length > 0) {
          newSections.push({
            title: "Interests",
            data: apiData.interests.map((n: any, i: number) => ({ type: "interest" as const, id: `interest-${n.id}-${i}`, parentContactId: n.id, contactName: n.full_name, interestName: n.interest, avatarUri: n.photo })),
          });
        }
        setSearchResults(newSections.filter((s) => s.data.length > 0));
      })
      .catch(() => setSearchResults([]))
      .finally(() => setLoading(false));
  }, [activeQuery]);

  const handleSearchSubmit = () => setActiveQuery(query);

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={theme.colors.grey} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              placeholder="Search contacts, notes..."
              placeholderTextColor={theme.colors.grey}
              autoFocus={!initialQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); setActiveQuery(""); }}>
                <Feather name="x" size={16} color={theme.colors.grey} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 15, paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            {!activeQuery.trim() ? (
              <Text style={styles.hintText}>Type something to search across your contacts and notes.</Text>
            ) : searchResults.length === 0 ? (
              <Text style={styles.noResultsText}>No results found for "{activeQuery}".</Text>
            ) : (
              searchResults.map((section) => (
                <View key={section.title} style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.data.map((item, idx) => (
                    <SearchResultDisplayItem
                      key={item.id}
                      item={item}
                      searchQuery={activeQuery}
                    />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    padding: 0,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
  },
  hintText: {
    textAlign: "center",
    color: theme.colors.greyText,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 40,
    lineHeight: 22,
  },
  noResultsText: {
    textAlign: "center",
    color: theme.colors.greyText,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 40,
  },
  sectionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primary,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.white,
  },
  itemInfo: { flex: 1 },
  itemContactName: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginBottom: 2,
  },
  itemContentText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: theme.colors.text,
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: "#FFF3CD",
    color: theme.colors.black,
    fontFamily: "Poppins-Bold",
  },
});

export default SearchResultScreen;
