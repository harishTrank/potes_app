import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReminderCategory from "./Component/ReminderCategory";
import ActionButtons from "../../Components/ActionButtons";
import EventListItem from "./Component/EventListItem";
import { showBirthdays, showReminders, yearsAgo } from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import notifee from "@notifee/react-native";
import Feather from "@expo/vector-icons/Feather";
import { useAtom } from "jotai";
import {
  apiCallBackGlobal,
  searchValueGlobal,
  userProfileGlobal,
} from "../../../jotaiStore";
import { viewProfileApi } from "../../../store/Services/Others";
import FastImage from "react-native-fast-image";
import { useNavigation } from "@react-navigation/native";
import { SideMenuModal } from "../../Components/SideMenuModal";

const UserAvatar = ({ userProfile }: any) => {
  if (userProfile?.profile_pic) {
    return (
      <FastImage
        style={styles.avatarImage}
        source={{ uri: userProfile.profile_pic, priority: FastImage.priority.normal }}
      />
    );
  }
  const initials = [userProfile?.first_name?.[0], userProfile?.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || "U";
  return (
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [reminder, setReminder]: any = useState({});
  const [birthday, setBirthday]: any = useState({});
  const [memories, setMemories]: any = useState({});
  const [loading, setLoading]: any = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVal, setSearchVal]: any = useAtom(searchValueGlobal);
  const [userProfile, setUserProfile]: any = useAtom(userProfileGlobal);
  const [globalCall]: any = useAtom(apiCallBackGlobal);
  const nav: any = useNavigation();

  useEffect(() => {
    viewProfileApi()
      .then((res: any) => setUserProfile(res))
      .catch(() => {});
  }, [globalCall]);

  const homeScreenDataManager = useCallback(async () => {
    setLoading(true);
    try {
      const results: any = await Promise.allSettled([
        showReminders(),
        showBirthdays(),
        yearsAgo(),
      ]);
      if (results[0].status === "fulfilled") setReminder(results[0].value?.reminders);
      if (results[1].status === "fulfilled") setBirthday(results[1].value);
      if (results[2].status === "fulfilled") setMemories(results[2].value);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return navigation.addListener("focus", () => homeScreenDataManager());
  }, [navigation]);

  const todayCount = reminder?.today?.reduce((acc: number, curr: any) => {
    return curr.completed ? acc : acc + 1;
  }, 0);
  const tomorrowCount = reminder?.tomorrow?.reduce((acc: number, curr: any) => {
    return curr.completed ? acc : acc + 1;
  }, 0);
  const globalCount =
    todayCount +
    tomorrowCount +
    reminder?.missed?.length +
    birthday?.birthdays?.length +
    birthday?.anniversary?.length +
    birthday?.spouse_birthday?.length +
    birthday?.child_birthday?.length;
  const safeCount = Math.max(0, Number(globalCount) || 0);

  useEffect(() => {
    notifee.setBadgeCount(safeCount);
  }, [safeCount]);

  const onPressSearch = () => {
    if (searchVal?.length > 0) {
      nav.navigate("SearchResultScreen", { searchQuery: searchVal });
      setSearchVal("");
    }
  };

  const hasEvents =
    (birthday?.birthdays?.length || 0) +
      (birthday?.anniversary?.length || 0) +
      (birthday?.spouse_birthday?.length || 0) +
      (birthday?.child_birthday?.length || 0) >
    0;

  return (
    <DefaultBackground>
      {loading && <FullScreenLoader />}
      <SideMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
          <Feather name="menu" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.logoBlock}>
          <Text style={styles.logoText}>POTES</Text>
          <Text style={styles.logoSub}>people notes</Text>
        </View>
        <TouchableOpacity onPress={() => nav.navigate("UserProfileScreen")}>
          <UserAvatar userProfile={userProfile} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollableContent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={theme.colors.searchPlaceholder} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts or notes..."
            placeholderTextColor={theme.colors.searchPlaceholder}
            value={searchVal}
            onChangeText={setSearchVal}
            onSubmitEditing={onPressSearch}
            returnKeyType="search"
          />
        </View>

        <ActionButtons />

        {/* Reminders Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Reminders</Text>
            {safeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{safeCount} active</Text>
              </View>
            )}
          </View>
          <ReminderCategory
            category={{ items: reminder?.today, initiallyOpen: true, name: "Today", count: reminder?.today?.length, type: "Reminders" }}
            setReminer={setReminder}
          />
          <ReminderCategory
            category={{ items: reminder?.tomorrow, initiallyOpen: false, name: "Tomorrow", count: reminder?.tomorrow?.length, type: "Reminders" }}
            setReminer={setReminder}
          />
          <ReminderCategory
            category={{ items: reminder?.upcoming, initiallyOpen: false, name: "Upcoming", count: reminder?.upcoming?.length, type: "Reminders" }}
          />
          <ReminderCategory
            category={{ items: reminder?.missed, initiallyOpen: false, name: "Missed", count: reminder?.missed?.length, type: "Reminders" }}
            setReminer={setReminder}
          />
        </View>

        {/* Memories Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionAccent, { backgroundColor: "#9a6eb0" }]} />
            <Text style={styles.sectionTitle}>Memories</Text>
          </View>
          <ReminderCategory
            category={{ items: memories?.year, initiallyOpen: true, name: "One Year Ago", count: memories?.year?.length, type: "memories" }}
          />
          <ReminderCategory
            category={{ items: memories?.six_month, initiallyOpen: false, name: "Six Months Ago", count: memories?.six_month?.length, type: "memories" }}
          />
          <ReminderCategory
            category={{ items: memories?.one_month, initiallyOpen: false, name: "One Month Ago", count: memories?.one_month?.length, type: "memories" }}
          />
        </View>

        {/* Events Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionAccent, { backgroundColor: "#c0623a" }]} />
            <Text style={styles.sectionTitle}>Events</Text>
          </View>
          {!hasEvents ? (
            <Text style={styles.nothingText}>NOTHING TODAY</Text>
          ) : (
            <View style={{ padding: 12 }}>
              {birthday?.birthdays?.length > 0 && (
                <View style={styles.eventGroup}>
                  <Text style={styles.eventGroupLabel}>Birthday</Text>
                  {birthday.birthdays.map((item: any) => (
                    <EventListItem item={item} key={item?.id} type={"Birthdays"} />
                  ))}
                </View>
              )}
              {birthday?.anniversary?.length > 0 && (
                <View style={styles.eventGroup}>
                  <Text style={styles.eventGroupLabel}>Anniversary</Text>
                  {birthday.anniversary.map((item: any) => (
                    <EventListItem item={item} key={item?.id} type={"Anniversary"} />
                  ))}
                </View>
              )}
              {birthday?.spouse_birthday?.length > 0 && (
                <View style={styles.eventGroup}>
                  <Text style={styles.eventGroupLabel}>Spouse Birthday</Text>
                  {birthday.spouse_birthday.map((item: any) => (
                    <EventListItem item={item} key={item?.id} type={"spouse"} />
                  ))}
                </View>
              )}
              {birthday?.child_birthday?.length > 0 && (
                <View style={styles.eventGroup}>
                  <Text style={styles.eventGroupLabel}>Family Birthday</Text>
                  {birthday.child_birthday.map((item: any) => (
                    <EventListItem item={item} key={item?.id} type={"child"} />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: theme.colors.lightBackground,
  },
  menuBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  logoBlock: { alignItems: "center" },
  logoText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginTop: -4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.avatarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: theme.colors.white,
  },
  avatarImage: { width: 36, height: 36, borderRadius: 18 },
  scrollableContent: { flex: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    height: 44,
    ...theme.elevationLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.searchText,
  },
  sectionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...theme.elevationLight,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingBottom: 6,
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primary,
  },
  nothingText: {
    textAlign: "center",
    color: theme.colors.greyText,
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    letterSpacing: 1,
    paddingVertical: 18,
  },
  eventGroup: { marginBottom: 10 },
  eventGroupLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.greyText,
    marginBottom: 6,
  },
});

export default HomeScreen;
