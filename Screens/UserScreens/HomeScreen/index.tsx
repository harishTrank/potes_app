import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReminderCategory from "./Component/ReminderCategory";
import ActionButtons from "../../Components/ActionButtons";
import Header from "../../Components/Header";
import EventListItem from "./Component/EventListItem";
import {
  showBirthdays,
  showReminders,
  yearsAgo,
} from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader";
import notifee from "@notifee/react-native";
const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [reminder, setReminer]: any = useState({});
  const [birthday, setBirthday]: any = useState({});
  const [memories, setMemories]: any = useState({});
  const [loading, setLoading]: any = useState(false);

  const { width, height } = Dimensions.get("window");
  const position: any = React.useRef(
    new Animated.ValueXY({ x: width - 80, y: height - 120 })
  ).current;
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.min(
          Math.max(gestureState.dx + position.x._offset, 0),
          width - 60
        );
        const safeHeight = height - insets.bottom;
        const newY = Math.min(
          Math.max(gestureState.dy + position.y._offset, 0),
          safeHeight - 60
        );
        position.setValue({
          x: newX - position.x._offset,
          y: newY - position.y._offset,
        });
      },
      onPanResponderRelease: () => {
        position.flattenOffset();
      },
    })
  ).current;

  const handleProfilePress = () => console.log("Profile pressed");

  const homeScreenDataManager = useCallback(async () => {
    setLoading(true);

    try {
      const results: any = await Promise.allSettled([
        showReminders(),
        showBirthdays(),
        yearsAgo(),
      ]);
      if (results[0].status === "fulfilled") {
        setReminer(results[0].value?.reminders);
      } else {
        console.error("Error fetching reminders:", results[0].reason);
      }
      if (results[1].status === "fulfilled") {
        setBirthday(results[1].value);
      } else {
        console.error("Error fetching birthdays:", results[1].reason);
      }
      if (results[2].status === "fulfilled") {
        setMemories(results[2].value);
      } else {
        console.error("Error fetching memories:", results[2].reason);
      }
    } catch (error) {
      console.error("A critical error occurred during data fetching:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      homeScreenDataManager();
    });
  }, [navigation]);

  const globalCount =
    reminder?.today?.length +
    reminder?.missed?.length +
    birthday?.birthdays?.length +
    birthday?.anniversary?.length +
    birthday?.spouse_birthday?.length +
    birthday?.child_birthday?.length;

  const safeCount = Math.max(0, Number(globalCount) || 0);

  useEffect(() => {
    notifee.setBadgeCount(safeCount);
  }, [safeCount]);

  return (
    <DefaultBackground>
      {loading && <FullScreenLoader />}
      <View style={styles.flexContainer}>
        {/* <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.aiButton,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate("ChatAiScreen")}>
            <View style={styles.aiButtonInner}>
              <Text style={styles.aiButtonText}>AI</Text>
            </View>
          </TouchableOpacity>
        </Animated.View> */}

        <Header onProfilePress={handleProfilePress} />
        <ScrollView
          style={styles.scrollableContent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <ActionButtons />

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <ReminderCategory
              category={{
                items: reminder?.today,
                initiallyOpen: true,
                name: "Today",
                count: reminder?.today?.length,
                type: "Reminders",
              }}
            />
            <ReminderCategory
              category={{
                items: reminder?.tomorrow,
                initiallyOpen: false,
                name: "Tomorrow",
                count: reminder?.tomorrow?.length,
                type: "Reminders",
              }}
            />
            <ReminderCategory
              category={{
                items: reminder?.upcoming,
                initiallyOpen: false,
                name: "Upcoming",
                count: reminder?.upcoming?.length,
                type: "Reminders",
              }}
            />
            <ReminderCategory
              category={{
                items: reminder?.missed,
                initiallyOpen: false,
                name: "Missed",
                count: reminder?.missed?.length,
                type: "Reminders",
              }}
              setReminer={setReminer}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Memories</Text>
            <ReminderCategory
              category={{
                items: memories?.year,
                initiallyOpen: true,
                name: "One Year Ago",
                count: memories?.year?.length,
                type: "memories",
              }}
            />
            <ReminderCategory
              category={{
                items: memories?.six_month,
                initiallyOpen: false,
                name: "Six Months Ago",
                count: memories?.six_month?.length,
                type: "memories",
              }}
            />
            <ReminderCategory
              category={{
                items: memories?.one_month,
                initiallyOpen: false,
                name: "One Month Ago",
                count: memories?.one_month?.length,
                type: "memories",
              }}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Events</Text>
            <View style={styles.eventData}>
              <Text style={styles.smallHead}>{`${
                birthday?.birthdays?.length === 0 ? "No " : ""
              }Birthdays`}</Text>
              {birthday?.birthdays?.map((item: any) => (
                <EventListItem item={item} key={item?.id} type={"Birthdays"} />
              ))}
            </View>

            <View style={styles.eventData}>
              <Text style={styles.smallHead}>{`${
                birthday?.anniversary?.length === 0 ? "No " : ""
              }Anniversary`}</Text>
              {birthday?.anniversary?.map((item: any) => (
                <EventListItem
                  item={item}
                  key={item?.id}
                  type={"Anniversary"}
                />
              ))}
            </View>

            <View style={styles.eventData}>
              <Text style={styles.smallHead}>{`${
                birthday?.spouse_birthday?.length === 0 ? "No " : ""
              }Spouse's Birthdays`}</Text>
              {birthday?.spouse_birthday?.map((item: any) => (
                <EventListItem item={item} key={item?.id} type={"spouse"} />
              ))}
            </View>

            <View style={styles.eventData}>
              <Text style={styles.smallHead}>{`${
                birthday?.child_birthday?.length === 0 ? "No " : ""
              }Family Member's Birthdays`}</Text>
              {birthday?.child_birthday?.map((item: any) => (
                <EventListItem item={item} key={item?.id} type={"child"} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    position: "relative",
  },
  scrollableContent: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 22,
    ...theme.font.fontBold,
    color: theme.colors.white,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  smallHead: {
    flex: 1,
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.reminderMessageText,
    paddingTop: 12,
    paddingBottom: 10,
  },
  eventData: {
    borderBottomColor: theme.colors.grey, // Assuming 'grey' is a subtle separator in your theme
    borderBottomWidth: 0.5,
    paddingHorizontal: 15,
  },
  aiButton: {
    position: "absolute",
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
    borderWidth: 2,
    borderColor: "#fff",
  },
  aiButtonInner: {
    height: 45,
    width: 45,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 16,
    ...theme.font.fontBold,
    textAlign: "center",
  },
});

export default HomeScreen;
