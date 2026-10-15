import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../../../../utils/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import FastImage from "react-native-fast-image";

const getInitials = (name: string) => {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
};

const getEventDate = (item: any, type: string) =>
  type === "Birthdays"
    ? item?.birthday
    : type === "Anniversary"
    ? item?.anniversary
    : type === "spouse"
    ? item?.spouse_birthday
    : item?.birthday;

const EventListItem: any = ({ item, type, cleared, onDismiss }: any) => {
  const navigation: any = useNavigation();
  const cardClickHandler = () => {
    navigation.navigate("ViewContactScreen", {
      contactId: item?.id || item?.contact,
      contactName: item?.full_name || item?.contact__full_name,
    });
  };

  const name =
    type === "Birthdays" || type === "Anniversary"
      ? item?.full_name
      : type === "spouse"
      ? `${item?.spouse_name} • Spouse of ${item?.full_name}`
      : `${item?.name || ""} • Family of ${item?.contact__full_name}`;

  const date = dayjs(getEventDate(item, type)).format("MMM D");

  return (
    <TouchableOpacity style={styles.container} onPress={cardClickHandler}>
      {item?.photo || item?.contact__photo ? (
        <FastImage
          source={{ uri: item?.photo || item?.contact__photo, priority: FastImage.priority.normal }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>{getInitials(item?.full_name || item?.name || "")}</Text>
        </View>
      )}
      <Text style={styles.eventName} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.eventDate}>{date}</Text>
      {onDismiss && (
        // Same as reminders: clearing only marks the event as seen (checkmark)
        // and keeps it in the list.
        <View style={styles.indicatorContainer}>
          {cleared ? (
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
          ) : (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onDismiss(type, item); }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <View style={styles.dot} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    marginBottom: 6,
    ...theme.elevationLight,
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: theme.colors.primary,
  },
  eventName: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: theme.colors.text,
  },
  eventDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginLeft: 8,
  },
});

export default EventListItem;
