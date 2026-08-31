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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import theme from "../../../utils/theme";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { postAiChat } from "../../../store/Services/Others";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import TypingIndicator from "./Components/TypingIndicator";
import { useAtom } from "jotai";
import { userProfileGlobal } from "../../../jotaiStore";
import { SideMenuModal } from "../../Components/SideMenuModal";

const renderInlineSegments = (text: string, textStyle: any) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  if (parts.length === 1)
    return (
      <Text selectable style={textStyle}>
        {text}
      </Text>
    );
  return (
    <Text selectable style={textStyle}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <Text key={i} selectable style={[textStyle, { fontFamily: "Poppins-SemiBold" }]}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          <Text key={i} selectable>
            {part}
          </Text>
        ),
      )}
    </Text>
  );
};

const renderMarkdown = (text: string, textStyle: any): React.ReactNode[] => {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return <View key={index} style={{ height: 5 }} />;

    const bulletMatch = trimmed.match(/^[*•-]\s*(.*)$/);
    if (bulletMatch) {
      const indentPx = line.length - line.trimStart().length > 0 ? 14 : 0;
      return (
        <View
          key={index}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 3,
            paddingLeft: indentPx,
          }}
        >
          <View style={styles.bulletDot} />
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

const formatNoteDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// The backend's `ui.message` is only a one-line summary (e.g. "The last note
// for X was added on Aug 31"). When the response also carries the actual
// note records in `payload.notes`, append their content so the chat shows
// the real notes instead of just the summary line.
const buildChatReply = (res: any): string => {
  const intro = res?.ui?.message || res?.response || "";
  const notes = res?.payload?.notes;
  if (!Array.isArray(notes) || notes.length === 0) return intro;

  const noteBlocks = notes.map((note: any) => {
    const header = [note?.contact_name, formatNoteDate(note?.created_date)]
      .filter(Boolean)
      .join(" — ");
    return header ? `* **${header}**\n${note?.note || ""}` : note?.note || "";
  });

  return [intro, ...noteBlocks].filter(Boolean).join("\n\n");
};

const GLOBAL_QUICK_ACTIONS = [
  { label: "Who to follow up?", icon: "people-outline" },
  { label: "Birthdays this week", icon: "gift-outline" },
  { label: "Summarize notes", icon: "document-text-outline" },
  { label: "Neglected contacts", icon: "person-outline" },
];

// Suggestions shown when the AI is opened from a single contact's profile,
// scoped to that contact rather than the whole directory.
const CONTACT_QUICK_ACTIONS = [
  { label: "Suggest a follow-up", icon: "chatbubble-ellipses-outline" },
  { label: "Summarize notes", icon: "document-text-outline" },
  { label: "Draft a message", icon: "mail-outline" },
  { label: "Relationship summary", icon: "person-outline" },
];

interface ChatBodyProps {
  contactId: string | null;
  topInset?: number;
  bottomInset?: number;
  onClose: () => void;
  closeIconName?: string;
  // True when rendered inside the AI overlay sheet rather than as a full
  // navigator screen. The overlay is mounted outside the tab/drawer
  // navigator tree, so it has no NavigationContext available — the side
  // menu (which calls useNavigation()) can't be rendered there.
  embedded?: boolean;
}

const ChatBody = ({
  contactId,
  topInset = 0,
  bottomInset = 0,
  onClose,
  closeIconName = "arrow-left",
  embedded = false,
}: ChatBodyProps) => {
  const [loading, setLoading]: any = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [aiChats, setAiChats]: any = useState([]);
  const [input, setInput] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [userProfile]: any = useAtom(userProfileGlobal);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const sessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const sessionKey = contactId || "global";
    if (sessionKeyRef.current !== sessionKey) {
      sessionKeyRef.current = sessionKey;
      setAiChats([]);
      setHasStartedChat(false);
      setConversationId(null);
      setInput("");
    }
  }, [contactId]);

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
    setAiChats((prev: any) => [
      ...prev,
      { id: tempId, message: userMessage, reply: null },
    ]);
    setLoading(true);

    postAiChat({
      body: {
        message: userMessage,
        // Only scope the first turn to the launching contact so the AI can
        // still answer general questions about other contacts once the
        // conversation is underway.
        contact_id: conversationId ? null : contactId || null,
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
            reply: buildChatReply(res),
          },
        ]);
        setConversationId(res?.meta?.conversation_id);
      })
      .catch(() => {
        setAiChats((prev: any) => prev.filter((c: any) => c.id !== tempId));
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again.",
        });
      })
      .finally(() => setLoading(false));
  };

  const copyReplyToClipboard = async (reply: string) => {
    await Clipboard.setStringAsync(reply);
    Toast.show({ type: "success", text1: "Copied to clipboard" });
  };

  const renderItem = ({ item }: any) => {
    if (item.typing) return <TypingIndicator />;
    return (
      <>
        {item?.message && (
          <View style={[styles.messageRow, styles.userRow]}>
            <View style={[styles.bubble, styles.userBubble]}>
              <Text selectable style={styles.userBubbleText}>
                {item.message}
              </Text>
            </View>
          </View>
        )}
        {item?.reply && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={styles.aiAvatarDot}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={12}
                color={theme.colors.primary}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.bubble, styles.aiBubble]}
              onLongPress={() => copyReplyToClipboard(item.reply)}
            >
              {renderMarkdown(item.reply, styles.aiBubbleText)}
              <TouchableOpacity
                style={styles.copyButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => copyReplyToClipboard(item.reply)}
              >
                <Feather name="copy" size={12} color={theme.colors.greyText} />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  const chatData = loading
    ? [...aiChats, { id: "typing-indicator", typing: true }]
    : aiChats;

  const firstName = userProfile?.first_name || "there";
  const quickActions = contactId ? CONTACT_QUICK_ACTIONS : GLOBAL_QUICK_ACTIONS;

  return (
    <>
      {!embedded && (
        <SideMenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.container, { paddingTop: topInset }]}>
          {/* Header */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose} style={styles.menuBtn}>
                <Feather
                  name={closeIconName as any}
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <View style={styles.aiHeaderCenter}>
                <View style={styles.aiDot} />
                <Text style={styles.aiHeaderTitle}>AI Assistant</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                {keyboardVisible && (
                  <TouchableOpacity
                    onPress={() => Keyboard.dismiss()}
                    style={styles.menuBtn}
                  >
                    <Feather
                      name="chevron-down"
                      size={20}
                      color={theme.colors.greyText}
                    />
                  </TouchableOpacity>
                )}
                {hasStartedChat && (
                  <TouchableOpacity
                    onPress={() => {
                      setAiChats([]);
                      setHasStartedChat(false);
                      setConversationId(null);
                    }}
                    style={styles.menuBtn}
                  >
                    <Feather
                      name="refresh-ccw"
                      size={18}
                      color={theme.colors.greyText}
                    />
                  </TouchableOpacity>
                )}
                {!embedded && (
                  <TouchableOpacity
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuBtn}
                  >
                    <Feather
                      name="menu"
                      size={22}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>

          {!hasStartedChat && aiChats.length === 0 ? (
            // Greeting Screen
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.greetingSection}>
                <Text style={styles.greetingTitle}>Hello, {firstName}.</Text>
                <Text style={styles.greetingSubtitle}>
                  How can I help you manage your connections today?
                </Text>

                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.label}
                      style={styles.quickActionCard}
                      onPress={() => handleSend(action.label)}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          ) : (
            // Chat View
            <FlatList
              ref={flatListRef}
              style={styles.flatList}
              data={chatData}
              renderItem={renderItem}
              keyExtractor={(item) => item?.id}
              contentContainerStyle={styles.chatArea}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: 10 + bottomInset }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about contacts or notes."
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
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatList: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  aiHeaderCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  aiHeaderTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  greetingSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  greetingTitle: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    lineHeight: 20,
    marginBottom: 18,
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
  aiBubbleText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  copyButtonText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
  },
  userBubbleText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.white,
    lineHeight: 20,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.greyText,
    marginRight: 8,
    marginTop: 7,
  },
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

export default ChatBody;
