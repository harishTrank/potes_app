import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";
import { deleteNotes } from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";
import { useGetNotesApi } from "../../../hooks/Others/query";
import FastImage from "react-native-fast-image";
import { useNavigation } from "@react-navigation/native";

const AllNotesScreen: any = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const contactIdFilter = route.params?.contactId;
  const allNotesApiHandler: any = useGetNotesApi({
    query: {
      id: contactIdFilter,
    },
  });

  useEffect(() => {
    return navigation.addListener("focus", () => {
      allNotesApiHandler.refetch();
    });
  }, [contactIdFilter, navigation]);

  const handleSearchPress = () =>
    navigation.navigate("SearchResultScreen", { searchQuery: "" });

  const handleEditNote = (note: any) => {
    navigation.navigate("CreateNoteScreen", {
      note,
      type: "edit",
    });
  };

  const handleDeleteNote = (noteId: any) => {
    Alert.alert("Delete Note", `Are you sure you want to delete this note?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          deleteNotes({
            query: {
              id: noteId,
            },
          })
            ?.then((res: any) => {
              allNotesApiHandler?.refetch();;
              Toast.show({
                type: "success",
                text1: "Note deleted successfully.",
              });
            })
            ?.catch((err: any) => console.log("err", err));
        },
        style: "destructive",
      },
    ]);
  };

  if (allNotesApiHandler?.isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : insets.top },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnlogoImg}
            onPress={() => navigation.navigate("DrawerNavigation")}
          >
            <Image source={ImageModule.logo} style={styles.logoImg} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSearchPress}
            style={styles.iconButton}
          >
            <Feather name="search" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>
              {route.params?.contactName
                ? `Notes for ${route.params.contactName}`
                : "All Notes"}
            </Text>

            {allNotesApiHandler?.data.length === 0 ? (
              <Text style={styles.noNotesText}>No notes found.</Text>
            ) : (
              (route?.params?.noteId
                ? allNotesApiHandler?.data?.filter(
                    (obj: any) => obj.id === route?.params?.noteId
                  )
                : allNotesApiHandler?.data
              ).map((note: any, index: number) => (
                <View
                  key={note.id}
                  style={[
                    styles.noteItemContainer,
                    index === allNotesApiHandler?.data.length - 1 &&
                      styles.lastNoteItemContainer,
                  ]}
                >
                  <View style={styles.noteHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ViewContactScreen", {
                          contactId: note.contact,
                          contactName: note.contact_full_name,
                        })
                      }
                      style={styles.contactInfo}
                    >
                      <View style={styles.noteAvatarPlaceholder}>
                        {note.contact_photo ? (
                          <FastImage
                            style={styles.avatarImageInList}
                            source={{
                              uri: note.contact_photo,
                              priority: FastImage.priority.normal,
                            }}
                          />
                        ) : (
                          <Feather
                            name="user"
                            size={16}
                            color={theme.colors.secondary}
                          />
                        )}
                      </View>
                      <Text style={styles.contactName}>
                        {note.contact_full_name}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note.id)}
                        style={styles.actionIcon}
                      >
                        <Feather
                          name="trash-2"
                          size={18}
                          color={theme.colors.grey}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEditNote(note)}
                        style={styles.actionIcon}
                      >
                        <Feather
                          name="edit-2"
                          size={18}
                          color={theme.colors.grey}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {note?.reminder && (
                    <View style={styles.reminderInfo}>
                      <Feather
                        name="bell"
                        size={14}
                        color={theme.colors.secondary}
                      />
                      <Text style={styles.reminderDateText}>
                        {dayjs(note.reminder).format("MM-DD-YYYY")}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.noteContent}>{note.note}</Text>
                  <Text style={styles.noteDate}>
                    Note created at <Feather name="clock" size={13} />{" "}
                    {dayjs(note?.created_date).format("MM-DD-YYYY")}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logoImg: { width: "100%", height: 40, resizeMode: "contain" },
  btnlogoImg: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 40,
  },
  iconButton: {
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contentScrollView: { flex: 1, marginTop: 10 },
  notesCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  cardTitle: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.black,
    marginBottom: 15,
  },
  noteItemContainer: {
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey,
  },
  lastNoteItemContainer: { borderBottomWidth: 0, marginBottom: 0 },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  contactInfo: { flexDirection: "row", alignItems: "center", width: "75%" },
  noteAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  avatarImageInList: { width: "100%", height: "100%" },
  contactName: {
    fontSize: 15,
    ...theme.font.fontSemiBold,
    color: theme.colors.black,
  },
  noteActions: { flexDirection: "row" },
  actionIcon: { padding: 5, marginLeft: 10 },
  noteDate: {
    fontSize: 12,
    ...theme.font.fontRegular,
    color: theme.colors.grey,
    marginBottom: 5,
    textAlign: "right",
  },
  noteContent: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  reminderDateText: {
    fontSize: 12,
    ...theme.font.fontMedium,
    color: theme.colors.secondary,
    marginLeft: 5,
  },
  noNotesText: {
    textAlign: "center",
    color: theme.colors.grey,
    paddingVertical: 30,
    fontSize: 16,
  },
});

export default AllNotesScreen;
