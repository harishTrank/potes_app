import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "../../../../utils/theme";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import FastImage from "react-native-fast-image";

const getInitials = (name: string) => {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
};

const EventListItem: any = ({ item, type, onDismiss }: any) => {
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
      ? `${item?.spouse_name} (${item?.full_name}'s Spouse)`
      : `${item?.name || ""} (${item?.contact__full_name}'s Family)`;

  const date = dayjs(
    type === "Birthdays"
      ? item.birthday
      : type === "Anniversary"
      ? item?.anniversary
      : type === "spouse"
      ? item?.spouse_birthday
      : item?.birthday
  ).format("MMM D");

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
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onDismiss(type, item?.id); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.dismissBtn}
        >
          <Feather name="x" size={15} color={theme.colors.greyText} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dismissBtn: {
    marginLeft: 6,
    padding: 2,
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
