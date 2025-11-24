import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import theme from "../../utils/theme";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const ActionButtons: any = () => {
  const navigation: any = useNavigation();

  const onCreateContactPress = () => navigation.navigate("CreateContantScreen");
  const onCreateNotePress = () => navigation.navigate("CreateNoteScreen");
  const onAiChatPress = () => navigation.navigate("ChatAiScreen");
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onCreateContactPress}>
        <Feather name="plus" size={20} color={theme.colors.white} />
        <Text style={styles.buttonText}>Create Contact</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.Aibutton} onPress={onAiChatPress}>
        <MaterialCommunityIcons
          name="star-four-points"
          size={20}
          color={theme.colors.white}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onCreateNotePress}>
        <Feather name="plus" size={20} color={theme.colors.white} />
        <Text style={styles.buttonText}>Create Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: "center",
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
    // marginLeft: 2,
  },

  Aibutton: {
    width: 50,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    marginHorizontal: 5,
  },
});

export default ActionButtons;
