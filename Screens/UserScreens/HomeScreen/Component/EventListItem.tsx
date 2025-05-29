import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import theme from "../../../../utils/theme"; // Adjust this path to your global theme file

export interface EventListItemData {
  id: string;
  icon: keyof typeof Feather.glyphMap; // Name of the Feather icon
  text: string; // Main descriptive text of the event
  date: string; // Date of the event (e.g., "05-29-2025")
  type?: string; // Optional: To differentiate event types further if needed
}

interface EventListItemProps {
  item: EventListItemData;
}

const EventListItem: React.FC<EventListItemProps> = ({ item }) => {
  return (
    <View style={styles.container}>
      <Feather
        name={item.icon}
        size={18}
        color={theme.colors.white}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.eventText}>{item.text}</Text>
      </View>
      <Text style={styles.eventDate}>{item.date}</Text>
    </View>
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
  icon: {
    marginRight: 12,
    opacity: 0.9,
  },
  textContainer: {
    flex: 1, // Allow primary text to take available space and truncate if needed
    marginRight: 10,
  },
  eventText: {
    fontSize: 15,
    ...theme.font.fontMedium, // Assuming you have fontMedium in your theme
    color: theme.colors.white, // Assuming white text on dark card
  },
  eventDate: {
    fontSize: 14,
    ...theme.font.fontRegular, // Assuming fontRegular
    color: theme.colors.grey, // Assuming lightGrey or a similar color for dates
  },
});

export default EventListItem;
