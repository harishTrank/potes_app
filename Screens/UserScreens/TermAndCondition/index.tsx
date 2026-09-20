import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";
import { staticDataApi } from "../../../store/Services/Others";

type TermAndConditionNavigationProp = {
  goBack: () => void;
  navigate: (screen: string) => void;
};

interface TermAndConditionProps {
  navigation: TermAndConditionNavigationProp;
}

// The Terms content is served from the backend and currently references
// "[Privacy Policy] (coming soon)" as plain text, plus an "Address: (coming
// soon)" line with no real address. Detect the bracketed marker and render
// it as a tappable link to the in-app PrivacyPolicyScreen (which already
// exists), drop the "Address: (coming soon)" line entirely, and drop the
// now-inaccurate "(coming soon)" qualifier elsewhere — all regardless of
// when/whether the backend copy is updated.
const renderTermsContent = (content: string, onPressPrivacyPolicy: () => void) => {
  const cleanedContent = content
    .replace(/^[ \t]*Address:\s*\(coming soon\)\s*\n?/gim, "")
    .replace(/\s*\(coming soon\)/gi, "");
  const parts = cleanedContent.split(/(\[privacy policy\])/gi);
  return parts.map((part, i) =>
    /^\[privacy policy\]$/i.test(part) ? (
      <Text key={i} style={styles.linkText} onPress={onPressPrivacyPolicy}>
        Privacy Policy
      </Text>
    ) : (
      <Text key={i}>{part}</Text>
    ),
  );
};

const TermAndCondition: React.FC<TermAndConditionProps> = ({
  navigation,
}: any) => {
  const insets = useSafeAreaInsets();
  const [apiResponse, setApiResponse]: any = useState({});

  useEffect(() => {
    staticDataApi({
      query: {
        topic: "terms",
      },
    })
      ?.then((res: any) => {
        setApiResponse(res?.data);
      })
      ?.catch((err: any) => console.log("err", err));
  }, []);

  const handleSearchPress = () => {
    navigation.navigate("SearchResultScreen", { searchQuery: "" });
  };

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : insets.top },
        ]}
      >
        {/* <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View> */}

        <View style={styles.titleBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Terms and Conditions</Text>
        </View>

        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.contentText}>
            {apiResponse?.content
              ? renderTermsContent(apiResponse.content, () =>
                  navigation.navigate("PrivacyPolicyScreen"),
                )
              : null}
          </Text>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  titleBar: {
    flexDirection: "row",
    // gap: 10,
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    paddingVertical: 15,
    // paddingHorizontal: 20,
    marginHorizontal: 15,
    marginTop: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  titleText: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.white,
  },
  contentScrollView: {
    flex: 1,
    marginHorizontal: 15,
    backgroundColor: theme.colors.secondary,
    marginBottom: 70,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  contentContainer: {
    padding: 10,
  },
  contentText: {
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.white,
    textAlign: "left",
    lineHeight: 24,
    paddingHorizontal: 5,
  },
  linkText: {
    ...theme.font.fontSemiBold,
    color: theme.colors.primaryLight,
    textDecorationLine: "underline",
  },
  logoImg: {
    resizeMode: "contain",
    width: "100%",
    height: 40,
  },
  btnlogoImg: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 40,
  },
});

export default TermAndCondition;
