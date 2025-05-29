import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import theme from "../../utils/theme";

const { height: screenHeight } = Dimensions.get("window");

const DropDownComponent = ({
  data,
  value,
  setValue,
  placeholder,
  style,
  search,
  placeholderStyle,
  fieldKey,
  objectSave,
}: any) => {
  return (
    <Dropdown
      style={[styles.mainDroper, style]}
      placeholderStyle={[styles.placeholderText, placeholderStyle]} // Use a slightly different style for placeholder if needed
      placeholder={placeholder}
      selectedTextStyle={styles.textStyle} // This is the style for the selected item's text
      search={search}
      searchPlaceholder="Search..."
      inputSearchStyle={styles.inputSearch}
      iconColor={theme.colors.black} // Use theme color
      data={data}
      maxHeight={screenHeight * 0.3}
      labelField={fieldKey}
      valueField={fieldKey} // The value prop should match a value from this field
      value={value} // This should be the actual value (e.g., item[fieldKey]), not the whole item object
      renderItem={(item: any, index: any) => {
        return (
          <View
            key={`${fieldKey}-${index}-${item[fieldKey]}`}
            style={styles.dropCardItem}
          >
            <Text style={styles.textStyle}>{item[fieldKey]}</Text>
          </View>
        );
      }}
      onChange={(item: any) => {
        if (objectSave) {
          setValue(item);
        } else {
          setValue(item[fieldKey]); // This sets the raw value
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  mainDroper: {
    height: 50, // Increased height to accommodate text and padding
    borderWidth: 1, // Common border width
    borderRadius: 8, // Common border radius
    paddingHorizontal: 15, // Horizontal padding
    // The Dropdown component itself will usually vertically center the text
    // if enough height is provided. Avoid excessive vertical padding here.
    borderColor: "#E5E6EA",
    marginVertical: 10, // Slightly increased margin for better spacing
    backgroundColor: theme.colors.white, // Assuming a white background
  },
  textStyle: {
    // For selected text and item text
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.black,
    // textAlignVertical: 'center', // Might help in some cases, but Dropdown usually handles it
  },
  placeholderText: {
    // Can be slightly different, e.g., lighter color
    fontSize: 16,
    ...theme.font.fontRegular,
    color: theme.colors.grey, // Example: using a grey color for placeholder
  },
  inputSearch: {
    height: 40,
    ...theme.font.fontSemiBold,
    fontSize: 15,
    borderRadius: 5,
    borderColor: "#E5E6EA", // Added border to search input for consistency
  },
  dropCardItem: {
    paddingHorizontal: 15, // Consistent horizontal padding with mainDroper
    paddingVertical: 12, // Sufficient vertical padding for items in the list
  },
});

export default DropDownComponent;
