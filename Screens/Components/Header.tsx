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
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAtom } from "jotai";
import { userProfileGlobal } from "../../jotaiStore";
import { viewProfileApi } from "../../store/Services/Others";

const Header: any = ({ menu = true }: any) => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const [searchVal, setSearchVal]: any = useState("");
  const [searchValOnClick, setSearchValOnClick]: any = useState("");
  const [userProfile, setUserProfile]: any = useAtom(userProfileGlobal);

  useEffect(() => {
    viewProfileApi()
      .then((res: any) => {
        setUserProfile(res);
      })
      ?.catch((err: any) => console.log("err", err));
  }, []);

  const onMenuPress = () => {
    navigation.toggleDrawer();
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  const onProfilePress = () => navigation.navigate("UserProfileScreen");

  const onPressSearchhandler = () => {
    setSearchValOnClick(searchVal);
  };

  useEffect(() => {
    if (searchValOnClick && searchValOnClick?.length > 0) {
      navigation.navigate("SearchResultScreen");
    }
  }, [searchValOnClick]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Image source={ImageModule.logo} style={styles.logoImg} />
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
            <Image
              source={{ uri: userProfile?.profile_pic }}
              style={styles.profilePic}
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
