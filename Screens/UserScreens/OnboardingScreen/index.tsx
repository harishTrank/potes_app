import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "../../../utils/theme";

const { width, height } = Dimensions.get("window");

interface OnboardingScreenProps {
  navigation: { navigate: (screen: string) => void };
}

const CreateNoteMock = () => (
  <View style={styles.mockCard}>
    <View style={styles.mockCardHeader}>
      <Text style={styles.mockCardTitle}>Create Note</Text>
      <Feather name="more-horizontal" size={18} color={theme.colors.greyText} />
    </View>
    <View style={styles.mockContactRow}>
      <View style={styles.mockAvatar}>
        <Text style={styles.mockAvatarText}>MC</Text>
      </View>
      <Text style={styles.mockContactName}>Maya Chen</Text>
    </View>
    <Text style={styles.mockNoteText}>
      Contract review — she's starting a new marketing role next month.
      Mentioned she's leaning back into half marathon training this fall.
    </Text>
    <View style={styles.mockSendButton}>
      <Text style={styles.mockSendButtonText}>SEND NOTE</Text>
    </View>
  </View>
);

const ReminderRow = ({ label, name, detail }: { label: string; name: string; detail: string }) => (
  <View style={styles.mockListRow}>
    <View style={styles.mockDot} />
    <View style={{ flex: 1 }}>
      <Text style={styles.mockRowLabel}>{label}</Text>
      <Text style={styles.mockRowTitle}>{name}</Text>
      <Text style={styles.mockRowDetail}>{detail}</Text>
    </View>
  </View>
);

const RemindersMock = () => (
  <View style={styles.mockCard}>
    <View style={styles.mockCardHeader}>
      <Text style={styles.mockCardTitle}>Reminders</Text>
      <Feather name="bell" size={18} color={theme.colors.greyText} />
    </View>
    <ReminderRow label="Today" name="Rich Chen" detail="Coffee catch-up" />
    <ReminderRow label="Tomorrow" name="Jordan Lee" detail="Follow up on intro" />
    <View style={styles.mockDivider} />
    <View style={styles.mockCardHeader}>
      <Text style={styles.mockCardTitle}>Events</Text>
      <Feather name="calendar" size={18} color={theme.colors.greyText} />
    </View>
    <ReminderRow label="Upcoming" name="Alex Rivera" detail="Birthday · Jul 20" />
  </View>
);

const ChatMock = () => (
  <View style={styles.mockCard}>
    <View style={styles.mockCardHeader}>
      <Text style={styles.mockCardTitle}>Ask Potes</Text>
      <Feather name="message-circle" size={18} color={theme.colors.greyText} />
    </View>
    <View style={styles.mockChatBubbleLeft}>
      <Text style={styles.mockChatTextLeft}>When did I last talk to Maya?</Text>
    </View>
    <View style={styles.mockChatBubbleRight}>
      <Text style={styles.mockChatTextRight}>
        Three weeks ago, over coffee — she mentioned a new marketing role.
      </Text>
    </View>
  </View>
);

const slides = [
  {
    key: "notes",
    Mock: CreateNoteMock,
    title: "Remember what matters",
    description:
      "Every conversation becomes a searchable note — jot down what you talked about, where you met, and what you want to remember, so that nothing important slips through the cracks.",
  },
  {
    key: "reminders",
    Mock: RemindersMock,
    title: "Never miss a moment",
    description:
      "Reminders surface who to follow up with — today, tomorrow, or down the road — while Events keeps birthdays and anniversaries on your radar automatically.",
  },
  {
    key: "chat",
    Mock: ChatMock,
    title: "Ask, and Potes remembers",
    description:
      "Just ask what you need to know. Potes searches every note and reminder you've saved to bring the right answer back in seconds.",
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLastSlide = activeIndex === slides.length - 1;

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.navigate("LoginScreen");
  };

  const handleNext = () => {
    if (isLastSlide) {
      finishOnboarding();
      return;
    }
    const nextIndex = activeIndex + 1;
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setActiveIndex(nextIndex);
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.topRow}>
        {!isLastSlide ? (
          <TouchableOpacity onPress={finishOnboarding} hitSlop={10}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {slides.map(({ key, Mock, title, description }) => (
          <View key={key} style={styles.slide}>
            <Mock />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {isLastSlide ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  topRow: {
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 15,
    color: theme.colors.white,
    ...theme.font.fontMedium,
  },
  slide: {
    width,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.02,
  },
  mockCard: {
    width: "100%",
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 18,
    ...theme.elevationHeavy,
  },
  mockCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mockCardTitle: {
    fontSize: 15,
    color: theme.colors.text,
    ...theme.font.fontSemiBold,
  },
  mockContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  mockAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  mockAvatarText: {
    color: theme.colors.white,
    fontSize: 13,
    ...theme.font.fontSemiBold,
  },
  mockContactName: {
    fontSize: 14,
    color: theme.colors.text,
    ...theme.font.fontMedium,
  },
  mockNoteText: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.reminderMessageText,
    ...theme.font.fontRegular,
    marginBottom: 16,
  },
  mockSendButton: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mockSendButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    ...theme.font.fontSemiBold,
  },
  mockListRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  mockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  mockRowLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    ...theme.font.fontSemiBold,
    marginBottom: 2,
  },
  mockRowTitle: {
    fontSize: 14,
    color: theme.colors.text,
    ...theme.font.fontMedium,
  },
  mockRowDetail: {
    fontSize: 12,
    color: theme.colors.greyText,
    ...theme.font.fontRegular,
  },
  mockDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  mockChatBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.lightCard,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: "85%",
  },
  mockChatTextLeft: {
    fontSize: 13,
    color: theme.colors.text,
    ...theme.font.fontRegular,
  },
  mockChatBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 10,
    maxWidth: "85%",
  },
  mockChatTextRight: {
    fontSize: 13,
    color: theme.colors.white,
    ...theme.font.fontRegular,
  },
  title: {
    fontSize: 24,
    color: theme.colors.white,
    ...theme.font.fontSemiBold,
    textAlign: "center",
    marginTop: height * 0.05,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.white,
    opacity: 0.85,
    ...theme.font.fontRegular,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.white,
    width: 20,
  },
  nextButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: width * 0.08,
    marginTop: 24,
    marginBottom: 24,
  },
  nextButtonText: {
    fontSize: 16,
    color: theme.colors.secondary,
    ...theme.font.fontSemiBold,
  },
});

export default OnboardingScreen;
