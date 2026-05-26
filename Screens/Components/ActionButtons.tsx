import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import theme from "../../utils/theme";
import { useNavigation } from "@react-navigation/native";

const ActionButtons: any = () => {
  const navigation: any = useNavigation();

  const onCreateContactPress = () => navigation.navigate("CreateContantScreen");
  const onCreateNotePress = () => navigation.navigate("CreateNoteScreen");
  const onAiChatPress = () => navigation.navigate("ChatAiScreen");

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.primaryBtn} onPress={onCreateContactPress}>
        <Feather name="user-plus" size={16} color={theme.colors.white} />
        <Text style={styles.primaryBtnText}> Contact</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlineBtn} onPress={onCreateNotePress}>
        <Feather name="file-text" size={16} color={theme.colors.primary} />
        <Text style={styles.outlineBtnText}> Note</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.aiBtn} onPress={onAiChatPress}>
        <MaterialCommunityIcons name="star-four-points" size={16} color={theme.colors.primary} />
        <Text style={styles.outlineBtnText}>AI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
  },
  primaryBtnText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.white,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  outlineBtnText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.primary,
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
});

export default ActionButtons;
