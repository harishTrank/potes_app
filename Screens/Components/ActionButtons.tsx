import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import theme from "../../utils/theme";

interface ActionButtonsProps {
  onCreateContactPress: () => void;
  onCreateNotePress: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreateContactPress,
  onCreateNotePress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onCreateContactPress}>
        <Feather name="plus" size={20} color={theme.colors.white} />
        <Text style={styles.buttonText}>Create contact</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onCreateNotePress}>
        <Feather name="plus" size={20} color={theme.colors.white} />
        <Text style={styles.buttonText}>Create note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 15,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
    marginLeft: 8,
  },
});

export default ActionButtons;
