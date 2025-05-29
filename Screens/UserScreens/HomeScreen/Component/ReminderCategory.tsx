import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import ReminderItem from "./ReminderItem";
import theme from "../../../../utils/theme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReminderCategory: any = ({ category }: any) => {
  const [isExpanded, setIsExpanded] = useState(category.initiallyOpen || false);

  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpansion} style={styles.header}>
        <Text style={styles.categoryName}>{category?.name}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{category?.count}</Text>
        </View>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.colors.reminderMessageText}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.itemsContainer}>
          {category?.items?.map((item: any) => (
            <ReminderItem key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey, // Subtle separator
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.reminderMessageText,
  },
  countBadge: {
    backgroundColor: theme.colors.categoryCountBadgeBackground,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
  },
  countText: {
    fontSize: 12,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  itemsContainer: {},
});

export default ReminderCategory;
