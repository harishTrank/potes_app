import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReminderCategory, { CategoryData } from "./Component/ReminderCategory";
import ActionButtons from "../../Components/ActionButtons";
import Header from "../../Components/Header";

// Mock Data
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
  const handleCreateContact = () => console.log("Create contact");
  const handleCreateNote = () => console.log("Create note");

  return (
    <DefaultBackground>
      <View style={styles.flexContainer}>
        <Header onProfilePress={handleProfilePress} />
        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ActionButtons
            onCreateContactPress={handleCreateContact}
            onCreateNotePress={handleCreateNote}
          />

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
    backgroundColor: theme.colors.cardBackground,
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
});

export default HomeScreen;
