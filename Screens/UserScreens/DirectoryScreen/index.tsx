import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Header from "../../Components/Header"; // Ensure this path is correct
import ActionButtons from "../../Components/ActionButtons"; // Ensure this path is correct
import FullScreenLoader from "../../Components/FullScreenLoader"; // Ensure this path is correct
import { allContactApiHook } from "../../../hooks/Others/query"; // Ensure this path is correct
import { formatPhoneNumber } from "../../../utils/ImagePicker";
import FastImage from "react-native-fast-image";
import dayjs from "dayjs";
// --- Navigation & Props ---
type DirectoryScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  openDrawer: () => void;
};
interface DirectoryScreenProps {
  navigation: DirectoryScreenNavigationProp;
}

// --- Data Structures (Updated to match API response) ---
interface ApiContact {
  id: number; // API returns number
  full_name: string;
  email?: string | null;
  phone?: string | null;
  birthday?: string | null;
  photo?: string | null;
}

interface SectionData {
  title: string;
  data: ApiContact[];
}

// --- processContactsForSectionList (Updated to use full_name) ---
const processContactsForSectionList = (
  contacts: ApiContact[]
): SectionData[] => {
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return [];
  }

  const grouped: { [key: string]: ApiContact[] } = {};
  contacts.forEach((contact) => {
    const firstLetter = contact.full_name?.[0]?.toUpperCase();
    if (firstLetter && /^[A-Z]$/.test(firstLetter)) {
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(contact);
    } else {
      if (!grouped["#"]) grouped["#"] = [];
      grouped["#"].push(contact);
    }
  });
  const sortedLetters = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  return sortedLetters.map((letter) => ({
    title: letter,
    data: grouped[letter].sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    ),
  }));
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

// --- Main Screen Component ---
const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  navigation,
}: any) => {
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sectionListRef = useRef<SectionList<ApiContact, SectionData>>(null);
  const {
    data: apiResponse,
    isLoading: apiIsLoading,
    refetch: apiRefetch,
  }: any = allContactApiHook();

  useEffect(() => {
    if (apiResponse?.results) {
      const contactsFromApi: ApiContact[] = apiResponse.results || [];
      let filteredContacts = contactsFromApi;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredContacts = contactsFromApi.filter(
          (contact) =>
            contact.full_name.toLowerCase().includes(lowerQuery) ||
            contact.email?.toLowerCase().includes(lowerQuery) ||
            contact.phone?.includes(searchQuery)
        );
      }
      const processed = processContactsForSectionList(filteredContacts);
      setSections(processed);
    } else if (!apiIsLoading) {
      // If not loading and no data, or error
      setSections([]);
    }
  }, [apiResponse, apiIsLoading, searchQuery]); // Depend on API data, loading state, and search query

  // Effect to refetch data on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (apiRefetch) {
        // Check if refetch function exists
        apiRefetch();
      }
    });
    return unsubscribe;
  }, [navigation, apiRefetch]);

  const handleAlphabetPress = (letter: string) => {
    const sectionIndex = sections.findIndex(
      (section) => section.title === letter
    );
    if (sectionListRef.current && sectionIndex !== -1) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: sectionIndex,
        itemIndex: 0,
        animated: true,
        viewOffset: 0,
      });
    } else if (letter === "#" && sectionListRef.current) {
      const lastSectionIndex = sections.length - 1;
      if (sections[lastSectionIndex]?.title === "#") {
        sectionListRef.current.scrollToLocation({
          sectionIndex: lastSectionIndex,
          itemIndex: 0,
          animated: true,
        });
      }
    }
  };

  const handleMenuPress = () => navigation.openDrawer();
  const handleProfilePress = () => navigation.navigate("UserProfileScreen");
  const handleCreateContact = () => navigation.navigate("CreateContactScreen");
  const handleCreateNote = () => navigation.navigate("CreateNoteScreen");

  const handleHeaderSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const renderContactItem = ({ item }: { item: ApiContact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() =>
        navigation.navigate("ViewContactScreen", {
          contactId: item.id,
          contactName: item.full_name,
        })
      }
    >
      <View style={styles.avatarPlaceholder}>
        {item.photo ? (
          <FastImage
            style={styles.avatarImage}
            source={{
              uri: item.photo,
              priority: FastImage.priority.normal,
            }}
          />
        ) : (
          <Feather name="user" size={20} color={theme.colors.white} />
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.full_name}</Text>
        {item.email && item.email !== "-" && (
          <Text style={styles.contactDetail} numberOfLines={1}>
            <Feather name="mail" size={13} color={theme.colors.white} />
            <Text> {item.email}</Text>
          </Text>
        )}
        {item.phone && item.phone !== "-" && (
          <Text style={styles.contactDetail} numberOfLines={1}>
            <Feather name="phone" size={13} color={theme.colors.white} />
            <Text> {formatPhoneNumber(item.phone)}</Text>
          </Text>
        )}
        {item?.birthday && (
          <Text style={styles.contactDetail} numberOfLines={1}>
            <Feather name="gift" size={13} color={theme.colors.white} />
            <Text> {item?.birthday? dayjs(item.birthday).format('MM-DD-YYYY') : "-"}</Text>
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: SectionData;
  }) => <Text style={styles.sectionHeader}>{title}</Text>;

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      {apiIsLoading && <FullScreenLoader />}
      <View style={[styles.flexContainer]}>
        <Header
          onMenuPress={handleMenuPress}
          onProfilePress={handleProfilePress}
          onSearchChange={handleHeaderSearchChange} // Pass search handler to Header
        />
        <ActionButtons
          onCreateContactPress={handleCreateContact}
          onCreateNotePress={handleCreateNote}
        />

        <View style={styles.directoryContentWrapper}>
          <View style={styles.listContainerCard}>
            {!apiIsLoading && sections.length === 0 ? (
              <Text style={styles.noResultsText}>
                {searchQuery
                  ? `No contacts found for "${searchQuery}"`
                  : "No contacts available."}
              </Text>
            ) : (
              <SectionList
                ref={sectionListRef}
                sections={sections}
                keyExtractor={(item: ApiContact) => String(item.id)}
                renderItem={renderContactItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
              />
            )}
          </View>
          {!apiIsLoading && sections.length > 0 && (
            <View style={styles.alphabetScrollerContainer}>
              {ALPHABET.map((letter) => (
                <TouchableOpacity
                  key={letter}
                  onPress={() => handleAlphabetPress(letter)}
                  style={styles.alphabetLetterButton}
                >
                  <Text style={styles.alphabetLetterText}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </DefaultBackground>
  );
};

const screenHeight = Dimensions.get("window").height;
const alphabetItemHeight = Math.min(20, screenHeight / (ALPHABET.length * 1.8));

const styles = StyleSheet.create({
  flexContainer: { flex: 1, paddingBottom: 70 },
  directoryContentWrapper: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  listContainerCard: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    paddingTop: 10,
    overflow: "hidden",
  },
  sectionHeader: {
    fontSize: 16,
    ...theme.font.fontBold,
    color: theme.colors.white,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  contactInfo: { flex: 1 },
  contactName: {
    fontSize: 15,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 12,
    ...theme.font.fontRegular,
    color: theme.colors.white,
    opacity: 0.8,
    lineHeight: 16,
    flexWrap: "wrap",
  },
  alphabetScrollerContainer: {
    width: 25,
    backgroundColor: theme.colors.secondary,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    paddingVertical: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },
  alphabetLetterButton: {
    paddingVertical: 0,
    height: alphabetItemHeight,
    justifyContent: "center",
  },
  alphabetLetterText: {
    fontSize: 11,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  noResultsText: {
    textAlign: "center",
    color: theme.colors.white,
    fontSize: 16,
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default DirectoryScreen;
