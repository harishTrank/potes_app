import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from "@notifee/react-native";
import { showReminders } from "../store/Services/Others";

// Android has no API to set a launcher badge directly (notifee.setBadgeCount is
// iOS-only). Launchers (Samsung One UI, Pixel, etc.) derive the badge from the
// app's active notifications, using the notification "number" as the count -
// the same mechanism WhatsApp uses. So on Android we keep a single silent
// summary notification whose badgeCount mirrors the active reminder count.
const BADGE_CHANNEL_ID = "active-reminders";
const BADGE_NOTIFICATION_ID = "active-reminders-badge";

let channelReady: Promise<string> | null = null;
let lastCount: number | null = null;
let settingsPromptShown = false;

const ensureChannel = () => {
  if (!channelReady) {
    channelReady = notifee
      .createChannel({
        id: BADGE_CHANNEL_ID,
        name: "Active reminders",
        description: "Shows the number of active reminders on the app icon",
        importance: AndroidImportance.LOW,
        badge: true,
        vibration: false,
      })
      .catch((e) => {
        channelReady = null;
        throw e;
      });
  }
  return channelReady;
};

// Same rule as the "N active" pill on the Home screen.
export const countActiveReminders = (reminders: any) => {
  const pending = (list: any[]) =>
    (list || []).filter((item: any) => !item?.completed).length;
  return (
    pending(reminders?.today) +
    pending(reminders?.tomorrow) +
    (reminders?.missed?.length || 0)
  );
};

const isAuthorized = async () => {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

const openSettingsPrompt = () => {
  if (settingsPromptShown) return;
  settingsPromptShown = true;
  Alert.alert(
    "Turn on notifications",
    "Allow notifications for Potes so the app icon can show your active reminder count.",
    [
      { text: "Not now", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => notifee.openNotificationSettings().catch(() => {}),
      },
    ],
  );
};

// Asks for notification permission (required on Android 13+ for the badge).
// If the user already blocked it, the system dialog no longer appears, so we
// offer to open the app's notification settings instead.
export const ensureBadgePermission = async () => {
  try {
    if (await isAuthorized()) {
      if (Platform.OS === "android") {
        await ensureChannel();
        if (await notifee.isChannelBlocked(BADGE_CHANNEL_ID)) {
          openSettingsPrompt();
          return false;
        }
      }
      return true;
    }
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      return true;
    }
    openSettingsPrompt();
    return false;
  } catch (e) {
    console.log("Failed to check notification permission", e);
    return false;
  }
};

export const updateAppBadge = async (rawCount: number, force = false) => {
  const count = Math.max(0, Math.round(Number(rawCount) || 0));
  if (!force && count === lastCount) return;

  try {
    if (Platform.OS === "ios") {
      await notifee.setBadgeCount(count);
      lastCount = count;
      return;
    }
    if (Platform.OS !== "android") return;

    if (count === 0) {
      await notifee.cancelNotification(BADGE_NOTIFICATION_ID);
      lastCount = count;
      return;
    }

    // Without permission the notification is silently dropped; leave lastCount
    // unset so the badge is posted as soon as permission is granted.
    if (!(await isAuthorized())) return;

    const channelId = await ensureChannel();
    await notifee.displayNotification({
      id: BADGE_NOTIFICATION_ID,
      title: "Reminders",
      body: `You have ${count} active reminder${count === 1 ? "" : "s"}`,
      android: {
        channelId,
        badgeCount: count,
        onlyAlertOnce: true,
        autoCancel: false,
        pressAction: { id: "default" },
      },
    });
    lastCount = count;
  } catch (e) {
    console.log("Failed to update app badge", e);
  }
};

// Fetches reminders and re-posts the badge. Used on app launch and whenever
// the app comes back to the foreground (e.g. after enabling notifications).
export const refreshAppBadge = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    const res: any = await showReminders();
    if (res?.reminders) {
      await updateAppBadge(countActiveReminders(res.reminders), true);
    }
  } catch (e) {
    console.log("Failed to refresh app badge", e);
  }
};

export const clearAppBadge = async () => {
  lastCount = null;
  try {
    if (Platform.OS === "ios") await notifee.setBadgeCount(0);
    else await notifee.cancelNotification(BADGE_NOTIFICATION_ID);
  } catch (e) {}
};
