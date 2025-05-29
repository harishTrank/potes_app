import React, { useState, useEffect, useRef } from "react"; // Added useRef
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Image,
  Platform,
  Dimensions, // For screen height to calculate scroller item height
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Header from "../../Components/Header"; // Assuming Header has onMenuPress, onProfilePress, and a way to get searchQuery
import ActionButtons from "../../Components/ActionButtons";

// --- Navigation & Props ---
type DirectoryScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  openDrawer: () => void;
};
interface DirectoryScreenProps {
  navigation: DirectoryScreenNavigationProp;
}

// --- Data Structures ---
interface Contact {
  id: string;
  name: string;
  email?: string;
  number?: string;
  birthday?: string;
}
interface SectionData {
  title: string;
  data: Contact[];
}

// --- Mock Data ---
const allContacts: Contact[] = [
  { id: "1", name: "demo", email: "-", number: "-", birthday: "05-29-2025" },
  {
    id: "2",
    name: "dev",
    email: "dev@GMAIL.COM",
    number: "456.666.6666",
    birthday: "05-30-2025",
  },
  {
    id: "3",
    name: "POOJA",
    email: "pooja@gmail.com",
    number: "756.757.5665",
    birthday: "05-29-2025",
  },
  { id: "4", name: "test", email: "-", number: "-", birthday: "05-30-2025" },
  {
    id: "5",
    name: "Test Test",
    email: "test@gmail.com",
    number: "765.756.7567",
    birthday: "05-30-2025",
  },
  { id: "6", name: "zzzzzz", email: "-", number: "-", birthday: "05-29-2025" },
  {
    id: "7",
    name: "Daniel Smith",
    email: "daniel@example.com",
    number: "123-456-7890",
    birthday: "01-15-2025",
  },
  {
    id: "8",
    name: "David Lee",
    email: "david@example.com",
    number: "987-654-3210",
    birthday: "03-22-2025",
  },
  {
    id: "9",
    name: "Aaron Jones",
    email: "aaron@example.com",
    birthday: "02-10-2025",
  },
  {
    id: "10",
    name: "Ben Carter",
    email: "ben@example.com",
    birthday: "04-05-2025",
  },
  // Add more contacts to better test the scroller
];

const processContactsForSectionList = (contacts: Contact[]): SectionData[] => {
  const grouped: { [key: string]: Contact[] } = {};
  contacts.forEach((contact) => {
    const firstLetter = contact.name[0]?.toUpperCase();
    if (firstLetter && /^[A-Z]$/.test(firstLetter)) {
      // Ensure it's a letter
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(contact);
    } else {
      // Group non-alphabetic under '#' or similar
      if (!grouped["#"]) grouped["#"] = [];
      grouped["#"].push(contact);
    }
  });
  const sortedLetters = Object.keys(grouped).sort((a, b) => {
    if (a === "#") return 1; // '#' at the end
    if (b === "#") return -1;
    return a.localeCompare(b);
  });
  return sortedLetters.map((letter) => ({
    title: letter,
    data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
  }));
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split(""); // For the scroller

// --- Main Screen Component ---
const DirectoryScreen: React.FC<DirectoryScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState(""); // Connect this to Header's search input
  const [sections, setSections] = useState<SectionData[]>([]);
  const sectionListRef = useRef<SectionList<Contact, SectionData>>(null);

  useEffect(() => {
    const processed = processContactsForSectionList(allContacts);
    setSections(processed);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSections(processContactsForSectionList(allContacts));
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filteredContacts = allContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.email?.toLowerCase().includes(lowerQuery) ||
        contact.number?.includes(searchQuery) // Number search is usually exact or startsWith
    );
    setSections(processContactsForSectionList(filteredContacts));
  }, [searchQuery]);

  const handleAlphabetPress = (letter: string) => {
    const sectionIndex = sections.findIndex(
      (section) => section.title === letter
    );
    if (sectionListRef.current && sectionIndex !== -1) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: sectionIndex,
        itemIndex: 0, // Scroll to the start of the section
        animated: true, // Can be false for instant jump
        viewOffset: 0, // Adjust if you have a sticky header height
      });
    } else if (letter === "#" && sectionListRef.current) {
      // Handle '#' if not found directly
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

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => navigation.navigate("ViewContactScreen")}
    >
      <View style={styles.avatarPlaceholder}>
        <Feather name="user" size={20} color={theme.colors.white} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.email && item.email !== "-" && (
          <Text style={styles.contactDetail}>
            <Feather name="mail" size={13} color={theme.colors.white} />{" "}
            {item.email}
          </Text>
        )}
        {item.number && item.number !== "-" && (
          <Text style={styles.contactDetail}>
            <Feather name="phone" size={13} color={theme.colors.white} />{" "}
            {item.number}
          </Text>
        )}
        {item.birthday && (
          <Text style={styles.contactDetail}>
            <Feather name="gift" size={13} color={theme.colors.white} />{" "}
            {item.birthday}
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
      <View style={[styles.flexContainer]}>
        <Header />
        <ActionButtons />

        <View style={styles.directoryContentWrapper}>
          <View style={styles.listContainerCard}>
            <SectionList
              ref={sectionListRef}
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
            />
          </View>
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
        </View>
      </View>
    </DefaultBackground>
  );
};

const screenHeight = Dimensions.get("window").height;
const alphabetItemHeight = Math.min(20, screenHeight / (ALPHABET.length * 1.8)); // Calculate dynamic height

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  directoryContentWrapper: {
    // New wrapper for list and scroller
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  listContainerCard: {
    flex: 1, // Takes most space
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15, // Rounded on the left side
    // No right border radius if scroller is directly adjacent
    paddingTop: 10, // Reduced top padding
    overflow: "hidden",
  },
  sectionHeader: {
    fontSize: 16, // Slightly smaller
    ...theme.font.fontBold,
    color: theme.colors.white,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10, // Reduced padding
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16, // Smaller avatar
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  contactInfo: { flex: 1 },
  contactName: {
    fontSize: 15, // Slightly smaller
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 12, // Smaller detail text
    ...theme.font.fontRegular,
    color: theme.colors.white,
    opacity: 0.8, // Subtler details
    lineHeight: 16,
    flexWrap: "wrap",
  },
  alphabetScrollerContainer: {
    width: 25, // Width of the scroller
    backgroundColor: theme.colors.secondary, // Match card, or slightly different
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    paddingVertical: 10, // Vertical padding for the letters
    justifyContent: "space-around", // Distribute letters evenly
    alignItems: "center",
  },
  alphabetLetterButton: {
    paddingVertical: 0, // Minimal vertical padding, height controlled by container
    height: alphabetItemHeight,
    justifyContent: "center",
  },
  alphabetLetterText: {
    fontSize: 11, // Small letters
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
});

export default DirectoryScreen;
