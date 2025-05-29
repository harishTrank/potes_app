import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import theme from "../../../../utils/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ReminderItem: any = ({ item }: any) => {
  return (
    <View style={styles.container}>
      {item?.contact_photo ? (
        <Image source={{ uri: item?.contact_photo }} style={styles.userImage} />
      ) : (
        <FontAwesome
          name="user-circle-o"
          style={styles.userIcon}
          size={22}
          color={theme.colors.white}
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.messageText} numberOfLines={1}>
          <Text style={styles.userText}>{item.contact_full_name}:</Text>{" "}
          {item.note}
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
  userImage: {
    height: 30,
    width: 30,
    borderRadius: 15,
    padding: 4,
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
