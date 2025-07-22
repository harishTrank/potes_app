import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../utils/theme";
import ImageModule from "../../ImageModule";
import { useNavigation, useRoute } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAtom } from "jotai";
import {
  apiCallBackGlobal,
  searchValueGlobal,
  userProfileGlobal,
} from "../../jotaiStore";
import { viewProfileApi } from "../../store/Services/Others";
import FastImage from 'react-native-fast-image';

const Header: any = ({ menu = true }: any) => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const [searchVal, setSearchVal]: any = useAtom(searchValueGlobal);
  const [userProfile, setUserProfile]: any = useAtom(userProfileGlobal);
  const [globalCall]: any = useAtom(apiCallBackGlobal);

  useEffect(() => {
    viewProfileApi()
      .then((res: any) => {
        setUserProfile(res);
      })
      ?.catch((err: any) => console.log("err", err));
  }, [globalCall]);

  const onMenuPress = () => {
    navigation.toggleDrawer();
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  const onProfilePress = () => navigation.navigate("UserProfileScreen");

  const onPressSearchhandler = () => {
    if (searchVal?.length > 0) {
      if (route?.name === "SearchResultScreen") {
        navigation.replace("SearchResultScreen", { searchQuery: searchVal });
        setSearchVal("");
      } else {
        navigation.navigate("SearchResultScreen", { searchQuery: searchVal });
        setSearchVal("");
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={() => navigation.navigate("DrawerNavigation")}>
        <Image source={ImageModule.logo} style={styles.logoImg} />
      </TouchableOpacity>
      <View style={styles.searchRow}>
        {menu ? (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <Feather name="menu" size={28} color={theme.colors.black} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <Ionicons
              name="arrow-back-circle"
              size={28}
              color={theme.colors.black}
            />
          </TouchableOpacity>
        )}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={theme.colors.searchPlaceholder}
            value={searchVal}
            onChangeText={(val: any) => setSearchVal(val)}
            focusable
            autoFocus
          />
          <TouchableOpacity onPress={onPressSearchhandler}>
            <Feather
              name="search"
              size={22}
              color={theme.colors.black}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
          {userProfile?.profile_pic ? (
            <FastImage
              style={styles.profilePic}
              source={{
                uri: userProfile?.profile_pic,
                priority: FastImage.priority.normal,
              }}
            />
          ) : (
            <FontAwesome
              name="user-circle-o"
              size={30}
              color={theme.colors.black}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  profilePic: {
    height: 40,
    width: 40,
    borderRadius: 20,
    objectFit: "cover",
  },
  logoImg: {
    width: "100%",
    height: 40,
    objectFit: "contain",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.searchText,
    marginRight: 10,
  },
  searchIcon: {},
});

export default Header;
