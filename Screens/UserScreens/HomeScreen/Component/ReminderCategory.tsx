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

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_COLORS: any = {
  Today: "#3d8b6e",
  Tomorrow: "#1a6b9a",
  Upcoming: "#b07d2e",
  Missed: "#c0392b",
  "One Year Ago": "#7d5a9a",
  "Six Months Ago": "#5a7a9a",
  "One Month Ago": "#4a8a6a",
};

const ReminderCategory: any = ({ category, setReminer }: any) => {
  const [isExpanded, setIsExpanded] = useState(category.initiallyOpen || false);

  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const color = CATEGORY_COLORS[category?.name] || theme.colors.primary;
  const hasItems = category?.items?.length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpansion} style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.categoryName, { color }]}>{category?.name}</Text>
        {hasItems && (
          <View style={[styles.countBadge, { backgroundColor: color + "22" }]}>
            <Text style={[styles.countText, { color }]}>{category?.count}</Text>
          </View>
        )}
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.greyText}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.itemsContainer}>
          {hasItems ? (
            category.items.map((item: any) => (
              <ReminderItem
                key={item.id}
                item={item}
                name={category?.name}
                setReminer={setReminer}
                type={category?.type}
                accentColor={color}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Nothing here</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  countText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  itemsContainer: {},
  emptyText: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    fontStyle: "italic",
  },
});

export default ReminderCategory;
