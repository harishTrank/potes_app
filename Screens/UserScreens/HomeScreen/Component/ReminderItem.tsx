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

  return (
    <TouchableOpacity style={styles.container} onPress={clickCompleteComponent}>
      {/* 1. RENDER AVATAR (Image or Placeholder) */}
      {item?.contact_photo ? (
        <FastImage
          source={{
            uri: item?.contact_photo,
            priority: FastImage.priority.normal,
          }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatar}>
          <FontAwesome name="user" size={18} color={theme.colors.white} />
        </View>
      )}

      {/* 2. TEXT CONTAINER */}
      <View style={styles.textContainer}>
        <Text style={styles.userText} numberOfLines={1}>
          {item.contact_full_name}
        </Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.note}
        </Text>
      </View>

      {/* 3. COMPLETION INDICATOR */}
      {name === "Missed" && (
        <View style={styles.indicatorContainer}>
          {flagManager ? (
            <Ionicons name="checkmark-circle" size={22} color={"#73f440"} />
          ) : (
            // --- CHANGE IS HERE ---
            <TouchableOpacity
              onPress={() => reminderClickHandler(item?.id)}
              // Add hitSlop to increase the touchable area around the dot
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <View style={styles.dot} />
            </TouchableOpacity>
            // --- END OF CHANGE ---
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- STYLES ARE UNCHANGED ---
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20, // This should be half of height/width for a perfect circle
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  userText: {
    ...theme.font.fontBold,
    fontSize: 15,
    color: theme.colors.white,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    ...theme.font.fontRegular,
    color: theme.colors.reminderMessageText,
    lineHeight: 18,
  },
  indicatorContainer: {
    width: 24,
    height: 24, // Explicitly set height to help center the touchable
    justifyContent: "center", // Center the child vertically
    alignItems: "center", // Center the child horizontally
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.white,
  },
});

export default ReminderItem;
