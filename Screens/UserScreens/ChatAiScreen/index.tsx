import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import theme from "../../../utils/theme";
import DefaultBackground from "../../Components/DefaultBackground";
import Feather from "@expo/vector-icons/Feather";
import ImageModule from "../../../ImageModule";
import {
  deleteAiChat,
  getAiChat,
  postAiChat,
} from "../../../store/Services/Others";
import { useFocusEffect } from "@react-navigation/native";

const ChatWithAI = ({ navigation }: any) => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      reply: "I'm Potes AI, how may I help you?",
      message: "",
    },
  ]);
  const [aiChats, setAiChats]: any = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const getChats = () => {
    getAiChat().then((res: any) => {
      setAiChats(res);
    });
  };

  useEffect(() => {
    getChats();
  }, []);

  const handleSend = () => {
    postAiChat({
      body: {
        message: input,
      },
    })
      .then((res: any) => {
        setInput("");
        getChats();
      })
      .catch((err: any) => {
        console.log("err", err);
      });
  };

  useFocusEffect(
    useCallback(() => {
      console.log("Chat screen opened");
      return () => {
        deleteAiChat();
      };
    }, [])
  );
  const renderItem = ({ item }: any) => (
    <>
      {item?.message && (
        <View style={[styles.messageContainer, styles.userMessageContainer]}>
          <View style={[styles.bubble, styles.userBubble]}>
            <Text style={styles.messageText}>{item?.message}</Text>
          </View>
        </View>
      )}
      {item?.reply && (
        <View style={[styles.messageContainer, styles.aiMessageContainer]}>
          <View style={[styles.bubble, styles.aiBubble]}>
            <Text style={styles.messageText}>{item?.reply}</Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <DefaultBackground>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: 60 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150}
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
            onPress={() =>
              navigation.navigate("SearchResultScreen", { searchQuery: "" })
            }
            style={styles.iconButton}
          >
            <Feather name="search" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatListRef}
          style={{ marginBottom: 120 }}
          data={aiChats.length > 0 ? aiChats : messages}
          renderItem={renderItem}
          keyExtractor={(item) => item?.id}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#ccc"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatArea: {
    padding: 15,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "flex-end",
  },
  aiMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  dp: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginHorizontal: 6,
  },
  bubble: {
    maxWidth: "70%",
    borderRadius: 15,
    padding: 10,
  },
  aiBubble: {
    backgroundColor: theme.colors.secondary,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
    ...theme.font.fontMedium,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingBottom: 50,
  },
  input: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 20,
    color: "#fff",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 25,
    marginLeft: 8,
  },
  sendText: {
    color: "#fff",
    fontSize: 14,
    ...theme.font.fontSemiBold,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  logoImg: { width: "100%", height: 40, objectFit: "contain" },
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
});

export default ChatWithAI;
