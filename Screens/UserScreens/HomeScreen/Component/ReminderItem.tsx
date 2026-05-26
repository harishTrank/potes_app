import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../../../../utils/theme";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { completeTaskApi } from "../../../../store/Services/Others";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import { useAtom } from "jotai";
import { homeNoteEditGlobal } from "../../../../jotaiStore";

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

const ReminderItem = ({ item, name, setReminer, type, accentColor }: any) => {
  const [flagManager, setFlagManager] = useState(item?.completed);
  const [, setGlobalNoteFlag]: any = useAtom(homeNoteEditGlobal);
  const navigation: any = useNavigation();

  const reminderClickHandler = (note_id: any) => {
    completeTaskApi({ query: { note_id } })
      ?.then(() => {
        if (name === "Today") {
          setFlagManager(true);
          setReminer((oldVal: any) => ({
            ...oldVal,
            today: oldVal?.today?.map((i: any) =>
              i?.id === note_id ? { ...i, completed: true } : i
            ),
          }));
        } else if (name === "Missed") {
          setReminer((oldVal: any) => ({
            ...oldVal,
            missed: oldVal.missed.filter((i: any) => i.id !== note_id),
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
      setGlobalNoteFlag(true);
      navigation.navigate("AllNotesScreen", {
        contactId: item.contact,
        noteId: item.id,
      });
    }
  };

  const color = accentColor || theme.colors.primary;

  return (
    <TouchableOpacity style={[styles.container, { borderLeftColor: color }]} onPress={clickCompleteComponent}>
      {item?.contact_photo ? (
        <FastImage
          source={{ uri: item?.contact_photo, priority: FastImage.priority.normal }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: color + "33" }]}>
          <Text style={[styles.avatarInitials, { color }]}>
            {getInitials(item.contact_full_name)}
          </Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.contact_full_name}
        </Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.note}
        </Text>
      </View>

      {(name === "Missed" || name === "Today") && (
        <View style={styles.indicatorContainer}>
          {flagManager ? (
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
          ) : (
            <TouchableOpacity
              onPress={() => reminderClickHandler(item?.id)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <View style={[styles.dot, { borderColor: color }]} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderLeftWidth: 3,
    backgroundColor: theme.colors.white,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 8,
    ...theme.elevationLight,
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    height: 36,
    width: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  userName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    lineHeight: 16,
  },
  indicatorContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
});

export default ReminderItem;
