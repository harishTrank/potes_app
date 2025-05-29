import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReminderCategory, { CategoryData } from "./Component/ReminderCategory";
import ActionButtons from "../../Components/ActionButtons";
import Header from "../../Components/Header";
import EventListItem from "./Component/EventListItem";

// Mock Data
const eventData: any = [
  {
    id: "ev1",
    icon: "calendar",
    text: "zzzzzzzzzzzzzzzz (POOJa's Anniversary)",
    date: "05-29-2025",
    type: "Anniversary",
  },
  {
    id: "ev2",
    icon: "gift",
    text: "fsfsgfedgdg (test's Spouse Birthday)",
    date: "05-29-2025",
    type: "Spouse Birthday",
  },
  {
    id: "ev3",
    icon: "gift",
    text: "test spouse (Test Test's Spouse Birthday)",
    date: "05-29-2025",
    type: "Spouse Birthday",
  },
  {
    id: "ev4",
    icon: "calendar",
    text: "DEV spouse (dev's Anniversary)",
    date: "05-29-2025",
    type: "Anniversary",
  },
  {
    id: "cb1",
    icon: "gift",
    text: "test child (Test Test's Child Birthday)",
    date: "05-29-2025",
    type: "Child Birthday",
  },
  {
    id: "cb2",
    icon: "gift",
    text: "Another Kiddo (demo's Child Birthday)",
    date: "06-15-2025",
    type: "Child Birthday",
  },
  {
    id: "ca1",
    icon: "calendar",
    text: "POOJA (Contact Anniversary)",
    date: "07-01-2025",
    type: "Contact Anniversary",
  },
];
const reminderCategoriesData: CategoryData[] = [
  {
    id: "today",
    name: "Today",
    count: 3,
    initiallyOpen: true,
    items: [
      {
        id: "r1",
        user: "zzzzzz",
        message: "Its clean syntax makes it beginner-friendly.",
      },
      {
        id: "r2",
        user: "demo",
        message: "gdgdfhfdPython is one of ... kes it beginner-friendly.",
      },
      { id: "r3", user: "demo", message: "ggggggdgggfdgdgdg" },
    ],
  },
  {
    id: "tomorrow",
    name: "Tomorrow",
    count: 3,
    items: [{ id: "r4", user: "userA", message: "Meeting at 10 AM." }],
  },
  { id: "upcoming", name: "Upcoming", count: 4, items: [] },
  { id: "missed", name: "Missed", count: 2, items: [] },
];

const memoryCategoriesData: CategoryData[] = [
  { id: "oneYear", name: "One Year Ago", count: 0, items: [] },
  { id: "sixMonths", name: "Six Months Ago", count: 0, items: [] },
  {
    id: "lastMonth",
    name: "Last Month",
    count: 1,
    items: [{ id: "m1", user: "memUser", message: "Birthday party" }],
  },
];

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const handleProfilePress = () => console.log("Profile pressed");

  return (
    <DefaultBackground>
      <View style={styles.flexContainer}>
        <Header onProfilePress={handleProfilePress} />
        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ActionButtons />

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            {reminderCategoriesData.map((category) => (
              <ReminderCategory key={category.id} category={category} />
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Memories</Text>
            {memoryCategoriesData.map((category) => (
              <ReminderCategory key={category.id} category={category} />
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Events</Text>
            <View style={styles.eventData}>
              <Text style={styles.smallHead}>Birthdays</Text>
              {eventData?.map((item: any) => (
                <EventListItem item={item} key={item?.id} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollableContent: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 22,
    ...theme.font.fontBold,
    color: theme.colors.white,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  smallHead: {
    flex: 1,
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.reminderMessageText,
  },
  eventData: {
    paddingHorizontal: 15,
  },
});

export default HomeScreen;
