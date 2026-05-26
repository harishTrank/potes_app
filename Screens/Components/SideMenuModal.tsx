import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import theme from "../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const MENU_WIDTH = Dimensions.get("window").width * 0.75;

const MENU_ITEMS = [
  { label: "Home", icon: "home", navigate: "HomeScreen" },
  { label: "Contacts", icon: "users", navigate: "DirectoryScreen" },
  { label: "About Us", icon: "info", navigate: "AboutUsScreen" },
  { label: "Contact Us", icon: "phone", navigate: "ContactUsScreen" },
  { label: "Privacy Policy", icon: "shield", navigate: "PrivacyPolicyScreen" },
];

interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SideMenuModal = ({ visible, onClose }: SideMenuModalProps) => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -MENU_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleNav = (item: any) => {
    onClose();
    setTimeout(() => navigation.navigate(item.navigate), 250);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
          },
        },
      ]);
    }, 250);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            { paddingTop: insets.top + 10, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerLogo}>POTES</Text>
              <Text style={styles.drawerSub}>people notes</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Menu Items */}
          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => handleNav(item)}
              >
                <View style={styles.menuIconWrap}>
                  <Feather name={item.icon as any} size={19} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.grey} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={19} color={theme.colors.red} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: theme.colors.white,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  drawerLogo: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  drawerSub: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginTop: -4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.lightCard,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  menuList: { flex: 1, paddingHorizontal: 12 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: theme.colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 14,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: theme.colors.red,
  },
});
