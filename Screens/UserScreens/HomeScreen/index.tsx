import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [reminder, setReminer]: any = useState({});
  const [birthday, setBirthday]: any = useState({});
  const [memories, setMemories]: any = useState({});
  const handleProfilePress = () => console.log("Profile pressed");

  useEffect(() => {
    showReminders()
      .then((res: any) => {
        setReminer(res?.reminders);
      })
      ?.catch((err: any) => console.log("err", err));

    showBirthdays()
      .then((res: any) => {
        setBirthday(res);
      })
      ?.catch((err: any) => console.log("err", err));

    yearsAgo()
      .then((res: any) => {
        setMemories(res);
      })
      ?.catch((err: any) => console.log("err", err));
  }, []);

  return (
    <DefaultBackground>
      <View style={styles.flexContainer}>
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
              }}
            />
            <ReminderCategory
              category={{
                items: reminder?.tomorrow,
                initiallyOpen: false,
                name: "Tomorrow",
                count: reminder?.tomorrow?.length,
              }}
            />
            <ReminderCategory
              category={{
                items: reminder?.upcoming,
                initiallyOpen: false,
                name: "Upcoming",
                count: reminder?.upcoming?.length,
              }}
            />
            <ReminderCategory
              category={{
                items: reminder?.missed,
                initiallyOpen: false,
                name: "Missed",
                count: reminder?.missed?.length,
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
              }}
            />
            <ReminderCategory
              category={{
                items: memories?.six_month,
                initiallyOpen: false,
                name: "Six Months Ago",
                count: memories?.six_month?.length,
              }}
            />
            <ReminderCategory
              category={{
                items: memories?.one_month,
                initiallyOpen: false,
                name: "One Month Ago",
                count: memories?.one_month?.length,
              }}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Events</Text>
            <View style={styles.eventData}>
              <Text style={styles.smallHead}>Birthdays</Text>
              {birthday?.birthdays?.map((item: any) => (
                <EventListItem item={item} key={item?.id} type={"Birthdays"} />
              ))}

              <Text style={styles.smallHead}>Anniversary</Text>
              {birthday?.anniversary?.map((item: any) => (
                <EventListItem
                  item={item}
                  key={item?.id}
                  type={"Anniversary"}
                />
              ))}

              <Text style={styles.smallHead}>Spouse's Birthdays</Text>
              {birthday?.spouse_birthday?.map((item: any) => (
                <EventListItem item={item} key={item?.id} type={"spouse"} />
              ))}

              <Text style={styles.smallHead}>Child's Birthdays</Text>
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
    paddingTop: 5,
  },
  eventData: {
    paddingHorizontal: 15,
  },
});

export default HomeScreen;
