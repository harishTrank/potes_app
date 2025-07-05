import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import theme from "../../../../utils/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { completeTaskApi } from "../../../../store/Services/Others";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const ReminderItem: any = ({ item, name, setReminer, type }: any) => {
  const [flagManager, setFlagManager]: any = useState(item?.completed);
  const navigation: any = useNavigation();

  const reminderClickHandler = (note_id: any) => {
    completeTaskApi({
      query: {
        note_id,
      },
    })
      ?.then(() => {
        if (name === "Today") {
          setFlagManager(true);
        } else if (name === "Missed") {
          setReminer((oldVal: any) => {
            return {
              ...oldVal,
              missed: oldVal.missed.filter((item: any) => item.id !== note_id),
            };
          });
        }
        Toast.show({
          type: "success",
          text1: "Done",
        });
      })
      ?.catch((err: any) => console.log("err", err));
  };

  const clickCompleteComponent = () => {
    if (type === "memories") {
      navigation.navigate("ViewContactScreen", {
        contactId: item.contact,
        contactName: item.contact_full_name,
      });
    } else {
      navigation.navigate("AllNotesScreen", {
        contactId: item.contact,
        noteId: item.id,
      });
    }
  };
  return (
    <TouchableOpacity style={styles.container} onPress={clickCompleteComponent}>
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
          <Text style={styles.userText}>{item.contact_full_name.length < 10 ? item.contact_full_name : `${item.contact_full_name?.slice(0,10)}... `}:</Text>{" "}
          {item.note}
        </Text>
      </View>
      {(name === "Today" || name === "Missed") &&
        (flagManager ? (
          <Ionicons name="checkmark-circle" size={20} color={"#73f440"} />
        ) : (
          <TouchableOpacity onPress={() => reminderClickHandler(item?.id)}>
            <View style={styles.dot} />
          </TouchableOpacity>
        ))}
    </TouchableOpacity>
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
    height: 24,
    width: 24,
    borderRadius: 12,
    margin: 4,
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    marginRight: 3,
  },
});

export default ReminderItem;
