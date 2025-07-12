import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../../../../utils/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { completeTaskApi } from "../../../../store/Services/Others";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";

const ReminderItem = ({ item, name, setReminer, type }: any) => {
  const [flagManager, setFlagManager] = useState(item?.completed);
  const navigation: any = useNavigation();

  const reminderClickHandler = (note_id: any) => {
    // Your existing function logic is perfect, no changes needed here
    completeTaskApi({ query: { note_id } })
      ?.then(() => {
        if (name === "Today") {
          setFlagManager(true);
        } else if (name === "Missed") {
          setReminer((oldVal: any) => ({
            ...oldVal,
            missed: oldVal.missed.filter((item: any) => item.id !== note_id),
          }));
        }
        Toast.show({ type: "success", text1: "Done" });
      })
      ?.catch((err: any) => console.log("err", err));
  };

  const clickCompleteComponent = () => {
    // Your existing function logic is perfect, no changes needed here
    if (type === "memories") {
      navigation.navigate("ViewContactScreen", {
        contactId: item.contact,
        contactName: item.contact_full_name,
      });
    } else {
      navigation.navigate("AllNotesScreen", {
        contactId: item.contact,
        noteId: item.id,
      });
    }
  };

  // --- JSX & STYLE CHANGES START HERE ---
  return (
    <TouchableOpacity style={styles.container} onPress={clickCompleteComponent}>
      {/* 1. RENDER AVATAR (Image or Placeholder) */}
      {item?.contact_photo ? (
        <FastImage
          source={{
            uri: item?.contact_photo,
            priority: FastImage.priority.normal,
          }}
          style={styles.avatar} // Use new 'avatar' style
        />
      ) : (
        // Placeholder view to precisely match the web's look
        <View style={styles.avatar}>
          <FontAwesome
            name="user" // 'user' is a solid icon, closer to the web version
            size={18}
            color={theme.colors.white}
          />
        </View>
      )}

      {/* 2. TEXT CONTAINER (Name stacked on top of Note) */}
      <View style={styles.textContainer}>
        <Text style={styles.userText} numberOfLines={1}>
          {item.contact_full_name}
        </Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.note}
        </Text>
      </View>

      {/* 3. COMPLETION INDICATOR (Checkmark or Dot) */}
      {(name === "Today" || name === "Missed") && (
        <View style={styles.indicatorContainer}>
          {flagManager ? (
            <Ionicons name="checkmark-circle" size={22} color={"#73f440"} />
          ) : (
            <TouchableOpacity onPress={() => reminderClickHandler(item?.id)}>
              <View style={styles.dot} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- UPDATED STYLES ---
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center", // Vertically aligns avatar, text block, and dot
    paddingVertical: 12, // Increased vertical padding for more space
    paddingHorizontal: 15,
  },
  avatar: {
    height: 40, // Increased size
    width: 40, // Increased size
    borderRadius: 20, // Rounded corners, not a full circle
    backgroundColor: "#555", // Placeholder background for the icon
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1, // Takes up available space
    marginLeft: 12, // Creates a gap between avatar and text
    marginRight: 10,
  },
  userText: {
    ...theme.font.fontBold,
    fontSize: 15, // Slightly larger font for the name
    color: theme.colors.white,
    marginBottom: 2, // Small space between name and message
  },
  messageText: {
    fontSize: 14,
    ...theme.font.fontRegular,
    color: theme.colors.reminderMessageText,
    lineHeight: 18, // Improves readability for wrapped text
  },
  indicatorContainer: {
    // Ensures the indicator has a consistent size and alignment
    width: 24,
    alignItems: "center",
  },
  dot: {
    width: 12, // Smaller dot
    height: 12, // Smaller dot
    borderRadius: 6, // To keep it a circle
    backgroundColor: theme.colors.white,
  },
});

export default ReminderItem;
