import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import theme from "../../../../utils/theme"; // Adjust this path to your global theme file
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const EventListItem: any = ({ item, type }: any) => {
  const navigation: any = useNavigation();
  const cardClickHandler = () => {
    navigation.navigate("ViewContactScreen", {
      contactId: item?.id,
      contactName: item?.full_name,
    });
  };
  return (
    <TouchableOpacity style={styles.container} onPress={cardClickHandler}>
      {item?.photo ? (
        <Image source={{ uri: item?.photo }} style={styles.profilePic} />
      ) : (
        <FontAwesome name="user-circle" size={24} color={theme.colors.white} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.eventText}>
          {type === "Birthdays" || type === "Anniversary"
            ? item?.full_name
            : type === "spouse"
            ? `${item?.spouse_name}\n(${item?.full_name}'s Spouse)`
            : `${item?.name}\n(${item?.contact__full_name}'s Child)`}
        </Text>
      </View>
      <Text style={styles.eventDate}>
        {type === "Birthdays"
          ? item.birthday
          : type === "Anniversary"
          ? item?.anniversary
          : type === "spouse"
          ? item?.spouse_birthday
          : item?.birthday}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey, // Assuming 'grey' is a subtle separator in your theme
  },
  profilePic: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  textContainer: {
    flex: 1, // Allow primary text to take available space and truncate if needed
    marginRight: 10,
  },
  eventText: {
    fontSize: 15,
    ...theme.font.fontMedium, // Assuming you have fontMedium in your theme
    color: theme.colors.white, // Assuming white text on dark card
    marginLeft: 5,
  },
  eventDate: {
    fontSize: 14,
    ...theme.font.fontRegular, // Assuming fontRegular
    color: theme.colors.grey, // Assuming lightGrey or a similar color for dates
  },
});

export default EventListItem;
