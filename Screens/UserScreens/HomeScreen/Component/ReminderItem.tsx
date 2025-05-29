import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../../../utils/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export interface ReminderItemData {
  id: string;
  user: string;
  message: string;
}

interface ReminderItemProps {
  item: ReminderItemData;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ item }) => {
  return (
    <View style={styles.container}>
      <FontAwesome
        name="user-circle-o"
        style={styles.userIcon}
        size={22}
        color={theme.colors.white}
      />
      <View style={styles.textContainer}>
        <Text style={styles.messageText} numberOfLines={1}>
          <Text style={styles.userText}>{item.user}:</Text> {item.message}
        </Text>
      </View>
      <View style={styles.dot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  userIcon: {
    padding: 4,
    borderRadius: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  userText: {
    ...theme.font.fontBold,
    color: theme.colors.white,
  },
  messageText: {
    fontSize: 14,
    ...theme.font.fontRegular,
    color: theme.colors.reminderMessageText,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.white,
  },
});

export default ReminderItem;
