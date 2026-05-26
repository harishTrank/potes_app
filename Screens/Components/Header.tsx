import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../utils/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAtom } from "jotai";
import { apiCallBackGlobal, searchValueGlobal, userProfileGlobal } from "../../jotaiStore";
import { viewProfileApi } from "../../store/Services/Others";
import FastImage from "react-native-fast-image";

const UserAvatar = ({ userProfile }: any) => {
  if (userProfile?.profile_pic) {
    return (
      <FastImage
        style={styles.avatarImage}
        source={{ uri: userProfile.profile_pic, priority: FastImage.priority.normal }}
      />
    );
  }
  const initials = [userProfile?.first_name?.[0], userProfile?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U";
  return (
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
};

const Header: any = ({ menu = true, directory = false, showSearch = false }: any) => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const [searchVal, setSearchVal]: any = useAtom(searchValueGlobal);
  const [userProfile, setUserProfile]: any = useAtom(userProfileGlobal);
  const [globalCall]: any = useAtom(apiCallBackGlobal);

  useEffect(() => {
    viewProfileApi()
      .then((res: any) => setUserProfile(res))
      .catch(() => {});
  }, [globalCall]);

  const onBackPress = () => navigation.goBack();
  const onProfilePress = () => navigation.navigate("UserProfileScreen");

  const onPressSearch = () => {
    if (searchVal?.length > 0) {
      if (route?.name === "SearchResultScreen") {
        navigation.replace("SearchResultScreen", { searchQuery: searchVal });
      } else {
        navigation.navigate("SearchResultScreen", { searchQuery: searchVal });
      }
      setSearchVal("");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={menu ? () => navigation.navigate("DrawerNavigation") : onBackPress}
          style={styles.sideButton}
        >
          <Feather
            name={menu ? "menu" : "arrow-left"}
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.logoBlock}>
          <Text style={styles.logoText}>POTES</Text>
          <Text style={styles.logoSub}>people notes</Text>
        </View>

        <TouchableOpacity onPress={onProfilePress} style={styles.sideButton}>
          <UserAvatar userProfile={userProfile} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchRow}>
          <Feather name="search" size={18} color={theme.colors.searchPlaceholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts, notes..."
            placeholderTextColor={theme.colors.searchPlaceholder}
            value={searchVal}
            onChangeText={setSearchVal}
            onSubmitEditing={onPressSearch}
            returnKeyType="search"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBlock: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: theme.colors.greyText,
    marginTop: -4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.avatarBg,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: theme.colors.white,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    marginTop: 10,
    paddingHorizontal: 14,
    height: 44,
    ...theme.elevationLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.colors.searchText,
  },
});

export default Header;
