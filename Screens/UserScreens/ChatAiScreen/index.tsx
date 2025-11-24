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
  Animated,
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
import Toast from "react-native-toast-message";
import FullScreenLoader from "../../Components/FullScreenLoader";

const ChatWithAI = ({ navigation, route }: any) => {
  const contactId = route?.params?.contactId || null;
  const [loading, setLoading]: any = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      reply: "How can I help you?",
      message: "",
    },
  ]);
  const placeholders = [
    "Ask something...",
    "Chat with AI...",
    "Create a contact named...",
    "Create a note for...",
    "who is spouse of...",
    "Summarize recent notes...",
  ];
  const quickOptions = [
    "Summarize recent notes",
    "Provide talking points",
    "Update Contact Profile",
  ];
  const [aiChats, setAiChats]: any = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 30,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = (text?: string) => {
    setLoading(true);
    if (!input.trim() && !text?.trim()) {
      Toast.show({
        type: "error",
        text1: "Input cannot be empty",
      });
      return;
    }
    postAiChat({
      body: {
        message: text || input,
        contactId: contactId || null,
      },
    })
      .then((res: any) => {
        setInput("");
        getChats();
      })
      .catch((err: any) => {
        console.log("err", err);
      })
      .finally(() => setLoading(false));
  };

  useFocusEffect(
    useCallback(() => {
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

  const handleQuickOptionPress = (text: string) => {
    setInput(text);

    handleSend(text);
  };

  return (
    <DefaultBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        {loading && <FullScreenLoader />}
        <View style={{ flex: 1, paddingTop: 60 }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
            >
              <Feather
                name="chevron-left"
                size={24}
                color={theme.colors.white}
              />
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

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            style={{ marginBottom: 10 }}
            data={aiChats.length > 0 ? aiChats : messages}
            renderItem={renderItem}
            keyExtractor={(item) => item?.id}
            contentContainerStyle={styles.chatArea}
            showsVerticalScrollIndicator={false}
          />

          {/* Quick Options */}
          {contactId && aiChats.length === 0 && (
            <View style={styles.quickOptionsContainer}>
              {quickOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.quickOption}
                  onPress={() => handleQuickOptionPress(opt)}
                >
                  <Text style={styles.quickOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Input Bar - stays above keyboard */}
      <View style={styles.inputContainer}>
        <View style={{ position: "relative", width: "80%" }}>
          {!input && (
            <Animated.Text
              style={{
                position: "absolute",
                zIndex: 2,
                top: 18,
                left: 25,
                color: "#ccc",
                fontSize: 16,
                transform: [{ translateY }],
                opacity: opacity,
              }}
            >
              {placeholders[placeholderIndex]}
            </Animated.Text>
          )}

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
          />
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSend("")}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 18,
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
  quickOptionsContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    marginBottom: 120,
  },
  quickOption: {
    backgroundColor: "#2c2c2c",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    width: "100%",
  },

  quickOptionText: {
    color: "#fff",
    fontSize: 14,
    ...theme.font.fontMedium,
    textAlign: "center",
  },
});

export default ChatWithAI;
