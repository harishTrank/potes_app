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
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Header from "../../Components/Header";
import ActionButtons from "../../Components/ActionButtons";
import FullScreenLoader from "../../Components/FullScreenLoader";
import { allContactApiHook } from "../../../hooks/Others/query";
import { formatPhoneNumber } from "../../../utils/ImagePicker";
import FastImage from "react-native-fast-image";
import dayjs from "dayjs";
import * as Contacts from "expo-contacts";
import { selectContact } from "react-native-select-contact";
import { importContactsAPI } from "../../../store/Services/Others";
// --- Navigation & Props ---
type DirectoryScreenNavigationProp = {
  navigate: (screen: string, params?: object) => void;
  openDrawer: () => void;
};
interface DirectoryScreenProps {
  navigation: DirectoryScreenNavigationProp;
}

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

// --- FIX: Add constants for estimated item and header heights ---
// We estimate the height of items and headers to help SectionList calculate positions.
// This is crucial for making scrollToLocation work reliably.
const ITEM_ESTIMATED_HEIGHT = 85; // Average height for a contact item
const SECTION_HEADER_HEIGHT = 38; // Height of a section letter (e.g., 'A', 'B')

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
      setSections([]);
    }
  }, [apiResponse, apiIsLoading, searchQuery]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (apiRefetch) {
        apiRefetch();
      }
    });
    return unsubscribe;
  }, [navigation, apiRefetch]);

  const ITEM_HEIGHT = 75;
  const HEADER_HEIGHT = 30;

  const sectionOffsets = React.useMemo(() => {
    const offsets: { [key: string]: number } = {};
    let currentOffset = 0;

    sections.forEach((section) => {
      offsets[section.title] = currentOffset;
      currentOffset += HEADER_HEIGHT + section.data.length * ITEM_HEIGHT;
    });

    return offsets;
  }, [sections]);

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });
  // const getItemLayout = (
  //   data: SectionData[] | null,
  //   index: number
  // ): { length: number; offset: number; index: number } => {
  //   if (!data) {
  //     return { length: 0, offset: 0, index };
  //   }

  //   let offset = 0;
  //   let i = 0;

  //   for (const section of data) {
  //     // Account for the section header
  //     if (i === index) {
  //       return { length: SECTION_HEADER_HEIGHT, offset, index };
  //     }
  //     offset += SECTION_HEADER_HEIGHT;
  //     i++;

  //     // Check if the index is for an item within this section
  //     if (i + section.data.length > index) {
  //       const itemOffsetInList = offset + (index - i) * ITEM_ESTIMATED_HEIGHT;
  //       return {
  //         length: ITEM_ESTIMATED_HEIGHT,
  //         offset: itemOffsetInList,
  //         index,
  //       };
  //     }

  //     // Move to the next section
  //     offset += section.data.length * ITEM_ESTIMATED_HEIGHT;
  //     i += section.data.length;
  //   }

  //   // Fallback
  //   return { length: 0, offset, index };
  // };

  const handleAlphabetPress = (letter: string) => {
    const sectionIndex = sections.findIndex(
      (section) => section.title === letter
    );
    if (sectionIndex !== -1 && sectionListRef.current) {
      const offset = sectionOffsets[letter] ?? 0;
      const scrollResponder = sectionListRef.current.getScrollResponder();
      scrollResponder?.scrollTo({ y: offset, animated: true });
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

  const importContacts2 = async () => {
    try {
      const picked: any = await selectContact();

      if (!picked) {
        Alert.alert("Cancelled", "No contact selected");
        return;
      }

      const birthday = picked.birthday
        ? dayjs(
            `${picked.birthday.year}-${picked.birthday.month}-${picked.birthday.day}`
          ).format("YYYY-MM-DD")
        : null;

      const formattedContact = {
        full_name: picked.name || "",
        phone: picked.phones?.[0]?.number || "",
        email: picked.emails?.[0]?.address || "",
        birthday: birthday,
      };

      await importContactsAPI({
        body: { contacts: [formattedContact] },
      });

      apiRefetch();
      Alert.alert("Success", "Contact imported successfully!");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to import contact.");
    }
  };

  const importContacts = async () => {
    Alert.alert(
      "Potes will import only the contacts you grant access to",
      Platform.OS === "ios"
        ? "All contacts you allow access to will be imported. If you wish to change which contacts Potes can access later, you can do so anytime from:\n\nSettings → Privacy & Security → Contacts → MyPotes → Allow Full Access or Select Limited Contacts."
        : "You can change this anytime from:\n\nSettings → Apps → App management→ MyPotes → Permissions → Contacts",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            let permission = await Contacts.requestPermissionsAsync();
            if (permission.status !== "granted" && permission.canAskAgain) {
              permission = await Contacts.requestPermissionsAsync();
            }
            if (permission.status == "granted") {
              const { data } = await Contacts.getContactsAsync({
                fields: [
                  Contacts.Fields.PhoneNumbers,
                  Contacts.Fields.Emails,
                  Contacts.Fields.Birthday,
                ],
              });

              if (data.length > 0) {
                const formattedContacts = data.map((c) => {
                  let birthday = null;
                  if (c.birthday) {
                    const { day, month, year } = c.birthday;
                    if (day && month && year) {
                      birthday = dayjs(`${year}-${month}-${day}`).format(
                        "YYYY-MM-DD"
                      );
                    } else if (day && month) {
                      birthday = `1999-${month}-${day}`;
                    }
                  }

                  return {
                    full_name: c.name || "",
                    phone: c.phoneNumbers?.[0]?.number || "",
                    email: c.emails?.[0]?.email || "",
                    birthday,
                  };
                });

                try {
                  importContactsAPI({
                    body: {
                      contacts: formattedContacts,
                    },
                  })
                    .then((res: any) => {
                      apiRefetch();
                      Alert.alert("Success", "Contacts imported successfully!");
                    })
                    .catch((err: any) => {
                      Alert.alert("Error", "Failed to import contacts.");
                      console.log("err.data.error", JSON.stringify(err));
                    });
                } catch (err) {
                  console.log("Error uploading contacts:", err);
                  Alert.alert("Error", "Failed to upload contacts.");
                }
              } else {
                Alert.alert("No contacts found");
              }
            } else {
              Alert.alert("Permission denied", "Contacts access is required.");
            }
          },
        },
      ]
    );
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
        {item.birthday && (
          <Text style={styles.contactDetail} numberOfLines={1}>
            <Feather name="gift" size={13} color={theme.colors.white} />
            <Text> {dayjs(item.birthday).format("MM-DD-YYYY")}</Text>
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
          onSearchChange={handleHeaderSearchChange}
          directory={true}
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
                getItemLayout={getItemLayout}
                initialNumToRender={100}
                windowSize={21}
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
        <TouchableOpacity onPress={() => importContacts()}>
          <View style={{ alignItems: "center", marginTop: -5 }}>
            <Text
              style={{
                color: theme.colors.secondary,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Import Contacts
            </Text>
          </View>
        </TouchableOpacity>
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
    paddingVertical: 3,
    justifyContent: "space-between",
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
