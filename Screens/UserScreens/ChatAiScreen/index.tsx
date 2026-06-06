import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import theme from "../../../utils/theme";
import DefaultBackground from "../../Components/DefaultBackground";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { postAiChat } from "../../../store/Services/Others";
import Toast from "react-native-toast-message";
import TypingIndicator from "./Components/TypingIndicator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAtom } from "jotai";
import { userProfileGlobal } from "../../../jotaiStore";
import { SideMenuModal } from "../../Components/SideMenuModal";

const renderInlineSegments = (text: string, textStyle: any) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  if (parts.length === 1) return <Text style={textStyle}>{text}</Text>;
  return (
    <Text style={textStyle}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <Text key={i} style={[textStyle, { fontFamily: "Poppins-SemiBold" }]}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
};

const renderMarkdown = (text: string, textStyle: any): React.ReactNode[] => {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return <View key={index} style={{ height: 5 }} />;

    const bulletMatch = trimmed.match(/^[*-]\s+(.*)$/);
    if (bulletMatch) {
      const indentPx = (line.length - line.trimStart().length) > 0 ? 14 : 0;
      return (
        <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 3, paddingLeft: indentPx }}>
          <Text style={[textStyle, { marginRight: 5 }]}>{"•"}</Text>
          {renderInlineSegments(bulletMatch[1], textStyle)}
        </View>
      );
    }

    return (
      <View key={index} style={{ marginBottom: 2 }}>
        {renderInlineSegments(line, textStyle)}
      </View>
    );
  });
};

const QUICK_ACTIONS = [
  { label: "Who to follow up?", icon: "people-outline" },
  { label: "Birthdays this week", icon: "gift-outline" },
  { label: "Summarize notes", icon: "document-text-outline" },
  { label: "Neglected contacts", icon: "person-remove-outline" },
];

const ChatWithAI = ({ navigation, route }: any) => {
  const contactId = route?.params?.contactId || null;
  const insets = useSafeAreaInsets();
  const [loading, setLoading]: any = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [aiChats, setAiChats]: any = useState([]);
  const [input, setInput] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [userProfile]: any = useAtom(userProfileGlobal);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [aiChats]);

  const handleSend = (text?: string) => {
    const userMessage = text || input;
    if (!userMessage.trim()) {
      Toast.show({ type: "error", text1: "Message cannot be empty" });
      return;
    }
    setInput("");
    setHasStartedChat(true);

    const tempId = Date.now().toString();
    setAiChats((prev: any) => [...prev, { id: tempId, message: userMessage, reply: null }]);
    setLoading(true);

    postAiChat({
      body: {
        message: userMessage,
        contact_id: contactId || null,
        query: userMessage,
        conversation_id: conversationId || null,
      },
    })
      .then((res: any) => {
        setAiChats((prev: any) => [
          ...prev,
          {
            id: res?.id || Date.now().toString(),
            message: null,
            reply: res?.ui?.message || res?.response,
          },
        ]);
        setConversationId(res?.meta?.conversation_id);
      })
      .catch(() => {
        setAiChats((prev: any) => prev.filter((c: any) => c.id !== tempId));
        Toast.show({ type: "error", text1: "Something went wrong. Please try again." });
      })
      .finally(() => setLoading(false));
  };

  const renderItem = ({ item }: any) => {
    if (item.typing) return <TypingIndicator />;
    return (
      <>
        {item?.message && (
          <View style={[styles.messageRow, styles.userRow]}>
            <View style={[styles.bubble, styles.userBubble]}>
              <Text style={styles.userBubbleText}>{item.message}</Text>
            </View>
          </View>
        )}
        {item?.reply && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={styles.aiAvatarDot}>
              <MaterialCommunityIcons name="star-four-points" size={12} color={theme.colors.primary} />
            </View>
            <View style={[styles.bubble, styles.aiBubble]}>
              {renderMarkdown(item.reply, styles.aiBubbleText)}
            </View>
          </View>
        )}
      </>
    );
  };

  const chatData = loading
    ? [...aiChats, { id: "typing-indicator", typing: true }]
    : aiChats;

  const firstName = userProfile?.first_name || "there";

  return (
    <DefaultBackground>
      <SideMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
              <Feather name="menu" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.aiHeaderCenter}>
              <View style={styles.aiDot} />
              <Text style={styles.aiHeaderTitle}>AI Assistant</Text>
            </View>
            {hasStartedChat ? (
              <TouchableOpacity onPress={() => { setAiChats([]); setHasStartedChat(false); setConversationId(null); }} style={styles.menuBtn}>
                <Feather name="refresh-ccw" size={18} color={theme.colors.greyText} />
              </TouchableOpacity>
            ) : (
              <View style={styles.menuBtn} />
            )}
          </View>

          {!hasStartedChat && aiChats.length === 0 ? (
            // Greeting Screen
            <View style={styles.greetingSection}>
              <Text style={styles.greetingTitle}>Hello, {firstName}.</Text>
              <Text style={styles.greetingSubtitle}>How can I help you manage your connections today?</Text>

              <View style={styles.quickActionsGrid}>
                {QUICK_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={styles.quickActionCard}
                    onPress={() => handleSend(action.label)}
                  >
                    <Ionicons name={action.icon as any} size={18} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            // Chat View
            <FlatList
              ref={flatListRef}
              data={chatData}
              renderItem={renderItem}
              keyExtractor={(item) => item?.id}
              contentContainerStyle={styles.chatArea}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={styles.textInput}
            placeholder='Ask me anything... (e.g., "Draft an'
            placeholderTextColor={theme.colors.searchPlaceholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
          >
            <Feather name="arrow-up" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  aiHeaderCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  aiHeaderTitle: { fontSize: 16, fontFamily: "Poppins-SemiBold", color: theme.colors.text },
  greetingSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  greetingTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 6,
  },
  greetingSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    lineHeight: 22,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevationLight,
  },
  quickActionText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: theme.colors.text,
  },
  chatArea: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "flex-end",
  },
  userRow: { justifyContent: "flex-end" },
  aiRow: { justifyContent: "flex-start", gap: 8 },
  aiAvatarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubbleText: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.text, lineHeight: 20 },
  userBubbleText: { fontSize: 14, fontFamily: "Poppins-Regular", color: theme.colors.white, lineHeight: 20 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.lightCard,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
});

export default ChatWithAI;
