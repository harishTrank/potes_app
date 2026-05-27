import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Dimensions,
  Alert,
  TextInput,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import FullScreenLoader from "../../Components/FullScreenLoader";
import { allContactApiHook } from "../../../hooks/Others/query";
import FastImage from "react-native-fast-image";
import dayjs from "dayjs";
import * as Contacts from "expo-contacts";
import { selectContact } from "react-native-select-contact";
import { importContactsAPI } from "../../../store/Services/Others";
import { useAtom } from "jotai";
import { apiCallBackGlobal, userProfileGlobal } from "../../../jotaiStore";
import { viewProfileApi } from "../../../store/Services/Others";
import { SideMenuModal } from "../../Components/SideMenuModal";
import { useNavigation } from "@react-navigation/native";

interface ApiContact {
  id: number;
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

const processContactsForSectionList = (contacts: ApiContact[]): SectionData[] => {
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) return [];
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
    data: grouped[letter].sort((a, b) => a.full_name.localeCompare(b.full_name)),
  }));
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");
const ITEM_ESTIMATED_HEIGHT = 68;
const SECTION_HEADER_HEIGHT = 32;

const getInitials = (name: string) => {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
};

const UserAvatar = ({ userProfile }: any) => {
  if (userProfile?.profile_pic) {
    return (
      <FastImage
        style={styles.headerAvatar}
        source={{ uri: userProfile.profile_pic, priority: FastImage.priority.normal }}
      />
    );
  }
  const initials = [userProfile?.first_name?.[0], userProfile?.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || "U";
  return (
    <View style={styles.headerAvatarCircle}>
      <Text style={styles.headerAvatarInitials}>{initials}</Text>
    </View>
  );
};

const DirectoryScreen: React.FC<any> = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const sectionListRef = useRef<SectionList<ApiContact, SectionData>>(null);
  const { data: apiResponse, isLoading: apiIsLoading, refetch: apiRefetch }: any = allContactApiHook();
  const [userProfile, setUserProfile]: any = useAtom(userProfileGlobal);
  const [globalCall]: any = useAtom(apiCallBackGlobal);

  useEffect(() => {
    viewProfileApi().then((res: any) => setUserProfile(res)).catch(() => {});
  }, [globalCall]);

  useEffect(() => {
    if (apiResponse?.results) {
      const contactsFromApi: ApiContact[] = apiResponse.results || [];
      let filteredContacts = contactsFromApi;
      if (searchQuery) {
        const lq = searchQuery.toLowerCase();
        filteredContacts = contactsFromApi.filter(
          (c) => c.full_name.toLowerCase().includes(lq) || c.email?.toLowerCase().includes(lq)
        );
      }
      setSections(processContactsForSectionList(filteredContacts));
    } else if (!apiIsLoading) {
      setSections([]);
    }
  }, [apiResponse, apiIsLoading, searchQuery]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (apiRefetch) apiRefetch();
    });
    return unsubscribe;
  }, [navigation, apiRefetch]);

  const getItemLayout = (_: any, index: number) => {
    let offset = 0;
    let i = 0;
    for (const section of sections) {
      if (i === index) return { length: SECTION_HEADER_HEIGHT, offset, index };
      offset += SECTION_HEADER_HEIGHT;
      i++;
      if (index < i + section.data.length) {
        return { length: ITEM_ESTIMATED_HEIGHT, offset: offset + (index - i) * ITEM_ESTIMATED_HEIGHT, index };
      }
      offset += section.data.length * ITEM_ESTIMATED_HEIGHT;
      i += section.data.length;
    }
    return { length: 0, offset, index };
  };

  const handleAlphabetPress = (letter: string) => {
    const sectionIndex = sections.findIndex((s) => s.title === letter);
    if (sectionIndex === -1) return;
    sectionListRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, viewPosition: 0, animated: true });
  };

  const importContacts = async () => {
    Alert.alert(
      "Import Contacts",
      "Potes will import contacts you select from your device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            let permission = await Contacts.requestPermissionsAsync();
            if (permission.status !== "granted" && permission.canAskAgain) {
              permission = await Contacts.requestPermissionsAsync();
            }
            if (permission.status === "granted") {
              const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Birthday],
              });
              if (data.length > 0) {
                const formattedContacts = data.map((c) => {
                  let birthday = null;
                  if (c.birthday) {
                    const { day, month, year } = c.birthday;
                    if (day && month && year) birthday = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");
                    else if (day && month) birthday = `1999-${month}-${day}`;
                  }
                  return { full_name: c.name || "", phone: c.phoneNumbers?.[0]?.number || "", email: c.emails?.[0]?.email || "", birthday };
                });
                importContactsAPI({ body: { contacts: formattedContacts } })
                  .then(() => { apiRefetch(); Alert.alert("Success", "Contacts imported!"); })
                  .catch(() => Alert.alert("Error", "Failed to import contacts."));
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

  const totalContacts = apiResponse?.results?.length || 0;

  const renderContactItem = ({ item }: { item: ApiContact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => navigation.navigate("ViewContactScreen", { contactId: item.id, contactName: item.full_name })}
    >
      <View style={styles.contactAvatarWrap}>
        {item.photo ? (
          <FastImage style={styles.contactAvatarImg} source={{ uri: item.photo, priority: FastImage.priority.normal }} />
        ) : (
          <View style={styles.contactAvatarCircle}>
            <Text style={styles.contactAvatarInitials}>{getInitials(item.full_name)}</Text>
          </View>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.full_name}</Text>
        {item.birthday && (
          <View style={styles.birthdayRow}>
            <Feather name="gift" size={11} color={theme.colors.greyText} />
            <Text style={styles.contactBirthday}> {dayjs(item.birthday).format("MMMM DD")}</Text>
          </View>
        )}
      </View>
      <Feather name="chevron-right" size={18} color={theme.colors.grey} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: SectionData }) => (
    <View style={styles.sectionHeaderWrap}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      {apiIsLoading && <FullScreenLoader />}
      <SideMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
            <Feather name="menu" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.logoText}>POTES</Text>
            <Text style={styles.logoSub}>people notes</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("UserProfileScreen")} style={styles.avatarBtn}>
            <UserAvatar userProfile={userProfile} />
          </TouchableOpacity>
        </View>

        {/* Directory Title */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Your Contacts</Text>
            <Text style={styles.pageSubtitle}>Managing {totalContacts} total contacts</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={theme.colors.searchPlaceholder} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search directory..."
            placeholderTextColor={theme.colors.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color={theme.colors.grey} />
            </TouchableOpacity>
          )}
        </View>

        {/* Contact List */}
        <View style={styles.listWrapper}>
          {!apiIsLoading && sections.length === 0 ? (
            <Text style={styles.noResultsText}>
              {searchQuery ? `No contacts found for "${searchQuery}"` : "No contacts yet. Import or add one!"}
            </Text>
          ) : (
            <SectionList
              ref={sectionListRef}
              sections={sections}
              renderItem={renderContactItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item) => String(item.id)}
              getItemLayout={getItemLayout}
              stickySectionHeadersEnabled={true}
              removeClippedSubviews={false}
              initialNumToRender={30}
              windowSize={10}
              maxToRenderPerBatch={40}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          )}
          {!apiIsLoading && sections.length > 0 && (
            <View style={styles.alphabetSidebar}>
              {ALPHABET.map((letter) => (
                <TouchableOpacity key={letter} onPress={() => handleAlphabetPress(letter)} style={styles.alphaBtn}>
                  <Text style={styles.alphaText}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sticky Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 6 }]}>
          <TouchableOpacity style={styles.syncBtn} onPress={importContacts}>
            <View style={styles.syncIconWrap}>
              <Feather name="user-plus" size={18} color={theme.colors.white} />
            </View>
            <Text style={styles.syncText}>SYNC LOCAL{"\n"}STORAGE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.importBtn} onPress={importContacts}>
            <Text style={styles.importBtnText}>Import{"\n"}contacts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DefaultBackground>
  );
};

const screenHeight = Dimensions.get("window").height;
const alphabetItemHeight = Math.min(16, screenHeight / (ALPHABET.length * 2.2));

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  menuBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  headerCenter: { alignItems: "center" },
  logoText: { fontSize: 18, fontFamily: "Poppins-Bold", color: theme.colors.primary, letterSpacing: 1 },
  logoSub: { fontSize: 9, fontFamily: "Poppins-Regular", color: theme.colors.greyText, marginTop: -4 },
  avatarBtn: {},
  headerAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.avatarBg, justifyContent: "center", alignItems: "center" },
  headerAvatarInitials: { fontSize: 13, fontFamily: "Poppins-Bold", color: theme.colors.white },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.lightCard,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.searchText },
  titleRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  pageTitle: { fontSize: 24, fontFamily: "Poppins-Bold", color: theme.colors.text },
  pageSubtitle: { fontSize: 13, fontFamily: "Poppins-Regular", color: theme.colors.greyText, marginTop: 2 },
  listWrapper: { flex: 1, flexDirection: "row" },
  sectionHeaderWrap: {
    backgroundColor: theme.colors.lightBackground,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionHeaderText: { fontSize: 13, fontFamily: "Poppins-Bold", color: theme.colors.primary, width: 16 },
  sectionDivider: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  contactAvatarWrap: { marginRight: 12 },
  contactAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.avatarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  contactAvatarImg: { width: 44, height: 44, borderRadius: 22 },
  contactAvatarInitials: { fontSize: 16, fontFamily: "Poppins-Bold", color: theme.colors.white },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontFamily: "Poppins-SemiBold", color: theme.colors.text },
  birthdayRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  contactBirthday: { fontSize: 12, fontFamily: "Poppins-Regular", color: theme.colors.greyText },
  alphabetSidebar: {
    width: 20,
    paddingVertical: 6,
    justifyContent: "space-between",
    alignItems: "center",
  },
  alphaBtn: { height: alphabetItemHeight, justifyContent: "center" },
  alphaText: { fontSize: 9, fontFamily: "Poppins-SemiBold", color: theme.colors.primary },
  noResultsText: { flex: 1, textAlign: "center", color: theme.colors.greyText, fontSize: 14, marginTop: 40, paddingHorizontal: 30 },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  syncBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  syncIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  syncText: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.greyText,
    lineHeight: 16,
  },
  importBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  importBtnText: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: theme.colors.white,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default DirectoryScreen;
