import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { staticDataApi } from "../../../store/Services/Others";

const PrivacyPolicyScreen: React.FC<any> = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [apiResponse, setApiResponse]: any = useState({});

  useEffect(() => {
    staticDataApi({ query: { topic: "privacy-policy" } })
      ?.then((res: any) => setApiResponse(res?.data))
      ?.catch((err: any) => console.log("err", err));
  }, []);

  return (
    <DefaultBackground>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{apiResponse?.content}</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: theme.colors.text,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  contentCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contentText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: theme.colors.text,
    lineHeight: 24,
  },
});

export default PrivacyPolicyScreen;
