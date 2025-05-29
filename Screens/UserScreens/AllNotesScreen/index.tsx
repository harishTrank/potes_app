import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground"; // Adjust path
import theme from "../../../utils/theme"; // Adjust path
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule"; // Adjust path, assuming ImageModule.logo exists

// --- Navigation & Props ---
type AllNotesScreenNavigationProp = {
  goBack: () => void;
  navigate: (screen: string, params?: object) => void; // For edit note
};

interface AllNotesScreenProps {
  navigation: AllNotesScreenNavigationProp;
  route?: any; // Could receive contactId to filter notes, or filter criteria
}

// --- Data Structure for a Note ---
interface NoteItemData {
  id: string;
  contactName: string; // Name of the contact the note is associated with
  noteDate: string; // Date the note itself refers to or was logged for
  content: string;
  reminderDate?: string; // Optional reminder date for this note
  // avatarUri?: string; // Optional contact avatar for display next to name
}

// --- Mock Data ---
const mockNotes: NoteItemData[] = [
  {
    id: "note1",
    contactName: "demo",
    noteDate: "05-29-2025",
    content:
      "gdgdfhfdPython is one of the most popular programming languages. It's simple to use, packed with features and supported by a wide range of libraries and frameworks. Its clean syntax makes it beginner-friendly.",
    reminderDate: "05-29-2025",
  },
  {
    id: "note2",
    contactName: "demo", // Assuming same contact for example
    noteDate: "05-31-2025",
    content: "and frameworks. Its clean syntax makes it beginner-friendly.",
    reminderDate: "05-29-2025", // Dates can be different
  },
  {
    id: "note3",
    contactName: "POOJA",
    noteDate: "05-29-2025",
    content: "ggggggdgggfdgdgdg",
    reminderDate: "05-29-2025",
  },
  {
    id: "note4",
    contactName: "Test Test",
    noteDate: "06-15-2025",
    content: "Another note about something important for Test Test.",
    // No reminderDate for this one
  },
];

// --- Main Screen Component ---
const AllNotesScreen: React.FC<AllNotesScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<NoteItemData[]>(mockNotes); // Load with mock or fetch

  // const contactIdFilter = route.params?.contactId; // Example if filtering by contact
  // useEffect(() => {
  //   // Fetch notes based on contactIdFilter or other criteria
  //   // setNotes(fetchedNotes);
  // }, [contactIdFilter]);

  const handleSearchPress = () =>
    console.log("Search pressed on All Notes screen");
  const handleEditNote = (noteId: string) => {
    console.log("Edit note:", noteId);
    // navigation.navigate("EditNoteScreen", { noteId });
    Alert.alert("Edit Note", `Editing note ID: ${noteId}`);
  };
  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete note ID: ${noteId}?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: () => {
            console.log("Deleting note:", noteId);
            setNotes((prevNotes) =>
              prevNotes.filter((note) => note.id !== noteId)
            ); // Optimistic delete
            // Call API to delete note from backend
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : insets.top },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Image source={ImageModule.logo} style={styles.logoImg} />
          <TouchableOpacity
            onPress={handleSearchPress}
            style={styles.iconButton}
          >
            <Feather name="search" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>Notes</Text>

            {notes.length === 0 ? (
              <Text style={styles.noNotesText}>No notes found.</Text>
            ) : (
              notes.map((note, index) => (
                <View
                  key={note.id}
                  style={[
                    styles.noteItemContainer,
                    index === notes.length - 1 && styles.lastNoteItemContainer,
                  ]}
                >
                  <View style={styles.noteHeader}>
                    <View style={styles.contactInfo}>
                      <View style={styles.noteAvatarPlaceholder}>
                        <Feather
                          name="user"
                          size={16}
                          color={theme.colors.secondary}
                        />
                      </View>
                      <Text style={styles.contactName}>{note.contactName}</Text>
                    </View>
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note.id)}
                        style={styles.actionIcon}
                      >
                        <Feather
                          name="trash-2"
                          size={18}
                          color={theme.colors.grey}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEditNote(note.id)}
                        style={styles.actionIcon}
                      >
                        <Feather
                          name="edit-2"
                          size={18}
                          color={theme.colors.grey}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.noteDate}>{note.noteDate}</Text>
                  <Text style={styles.noteContent}>{note.content}</Text>

                  {note.reminderDate && (
                    <View style={styles.reminderInfo}>
                      <Feather
                        name="calendar"
                        size={14}
                        color={theme.colors.secondary}
                      />
                      <Text style={styles.reminderDateText}>
                        {note.reminderDate}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logoImg: { width: "50%", height: 40, resizeMode: "contain" },
  iconButton: {
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contentScrollView: { flex: 1, marginTop: 10 }, // Added marginTop
  notesCard: {
    backgroundColor: theme.colors.white, // White card background
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20, // Space at the bottom
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  cardTitle: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.black, // Dark title text on white card
    marginBottom: 15,
  },
  noteItemContainer: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey, // Dotted line appearance
    // For actual dotted line: borderStyle: 'dotted', (might not work on all platforms perfectly)
  },
  lastNoteItemContainer: {
    borderBottomWidth: 0, // No border for the last item
    marginBottom: 0,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  contactName: {
    fontSize: 15,
    ...theme.font.fontSemiBold,
    color: theme.colors.black,
  },
  noteActions: {
    flexDirection: "row",
  },
  actionIcon: {
    padding: 5, // For easier touch
    marginLeft: 10,
  },
  noteDate: {
    fontSize: 14,
    ...theme.font.fontSemiBold, // Bold date
    color: theme.colors.black,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.text, // Standard text color
    lineHeight: 22,
    marginBottom: 10,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end", // Position to the bottom right
  },
  reminderDateText: {
    fontSize: 13,
    ...theme.font.fontMedium,
    color: theme.colors.secondary, // Darker text for reminder date
    marginLeft: 5,
  },
  noNotesText: {
    textAlign: "center",
    color: theme.colors.grey,
    paddingVertical: 30,
    fontSize: 16,
  },
});

export default AllNotesScreen;
