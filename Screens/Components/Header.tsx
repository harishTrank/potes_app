import React from "react";
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

const Header: any = () => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const onMenuPress = () => {
    navigation.toggleDrawer();
  };

  const onProfilePress = () => navigation.navigate("UserProfileScreen");

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Image source={ImageModule.logo} style={styles.logoImg} />
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <Feather name="menu" size={28} color={theme.colors.black} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={theme.colors.searchPlaceholder}
          />
          <Feather
            name="search"
            size={22}
            color={theme.colors.black}
            style={styles.searchIcon}
          />
        </View>
        <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
          <FontAwesome
            name="user-circle-o"
            size={30}
            color={theme.colors.black}
          />
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
