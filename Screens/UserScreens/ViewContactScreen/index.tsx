import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import DefaultBackground from "../../Components/DefaultBackground";
import theme from "../../../utils/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ImageModule from "../../../ImageModule";
import { deleteContactApi } from "../../../store/Services/Others";
import FullScreenLoader from "../../Components/FullScreenLoader"; // Assuming you have this
import dayjs from "dayjs";
import Toast from "react-native-toast-message";
import { useProfileContactApi } from "../../../hooks/Others/query";
import FastImage from "react-native-fast-image";
import { useNavigation } from "@react-navigation/native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CollapsibleSection: any = ({ title, children, isOpen, onPress }: any) => {
  return (
    <View style={styles.collapsibleSection}>
      <TouchableOpacity onPress={onPress} style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Feather
          name={isOpen ? "minus" : "plus"}
          size={20}
          color={theme.colors.white}
        />
      </TouchableOpacity>
      {isOpen && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// --- Display Field Component ---
interface InfoDisplayFieldProps {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}
const InfoDisplayField: React.FC<InfoDisplayFieldProps> = ({
  label,
  value,
  children,
}) => {
  const hasValue = value !== null && value !== undefined && value.trim() !== "";
  if (!hasValue && !children) return null;
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}:</Text>
      {hasValue && <Text style={styles.infoValue}>{value}</Text>}
      {children}
    </View>
  );
};

// --- Main Screen Component ---
const ViewContactScreen: any = ({ navigation, route }: any) => {
  const { contactId, contactName: nameFromRoute } = route?.params || {};
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [areAllSectionsOpen, setAreAllSectionsOpen] = useState(false);
  const apiResponse: any = useProfileContactApi({ query: { id: contactId } });
  const scrollViewRef: any = useRef(null);

  const initialSectionStates = {
    personal: true,
    spouse: false,
    children: false,
    employment: false,
    education: false,
    interests: false,
    others: false,
  };
  const [sectionOpenState, setSectionOpenState] =
    useState(initialSectionStates);

  const toggleSection = (sectionName: keyof typeof initialSectionStates) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionOpenState((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };
  const toggleAllSections = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newState = !areAllSectionsOpen;
    setSectionOpenState({
      personal: newState,
      spouse: newState,
      children: newState,
      employment: newState,
      education: newState,
      interests: newState,
      others: newState,
    });
    setAreAllSectionsOpen(newState);
  };

  useEffect(() => {
    return navigation.addListener("focus", () => {
      apiResponse?.refetch();
    });
  }, [contactId, navigation]);

  const handleSearchPress = () => console.log("Search pressed on View Contact");
  const handleDelete = () =>
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${
        apiResponse?.data?.full_name || "this contact"
      }?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: () => {
            setLoading(true);
            deleteContactApi({
              query: {
                id: apiResponse?.data?.id,
              },
            })
              ?.then((res: any) => {
                Toast.show({
                  type: "success",
                  text1: res?.msg,
                });
                setLoading(false);
                navigation.goBack();
              })
              ?.catch(() => setLoading(false));
          },
          style: "destructive",
        },
      ]
    );
  const handleEdit = () =>
    navigation.navigate("CreateContantScreen", {
      contactData: apiResponse?.data,
      type: "edit",
    });
  const handleAddNote = () =>
    navigation.navigate("CreateNoteScreen", {
      contactId: apiResponse?.data?.id,
      contactName: apiResponse?.data?.full_name,
      type: "AddNote",
    });
  const handleViewAllNotes = () =>
    navigation.navigate("AllNotesScreen", {
      contactId: apiResponse?.data?.id,
    });

  if (loading || apiResponse?.isLoading) {
    return <FullScreenLoader />;
  }
  if (!apiResponse?.data) {
    return (
      <DefaultBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Contact not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.allNotesLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </DefaultBackground>
    );
  }

  return (
    <DefaultBackground>
      <StatusBar style="light" />
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : insets.top },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButtonSmall}
          >
            <Feather name="chevron-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity
              style={styles.btnlogoImg}
              onPress={() => navigation.navigate("DrawerNavigation")}
            >
              <Image source={ImageModule.logo} style={styles.logoImgSmall} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSearchPress}
            style={styles.iconButtonSmall}
          >
            <Feather name="search" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
            <Feather name="trash-2" size={18} color={theme.colors.white} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
            <Feather name="edit-2" size={18} color={theme.colors.white} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleAddNote}>
            <Feather name="file-plus" size={18} color={theme.colors.white} />
            <Text style={styles.actionText}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={toggleAllSections}
          >
            <Feather
              name={areAllSectionsOpen ? "minimize-2" : "maximize-2"}
              size={18}
              color={theme.colors.white}
            />
            <Text style={styles.actionText}>
              {areAllSectionsOpen ? "Collapse -" : "Expand +"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
        >
          <View style={styles.mainInfoCard}>
            <View style={styles.avatarDisplaySection}>
              {apiResponse?.data.photo ? (
                <FastImage
                  source={{
                    uri: apiResponse?.data.photo,
                    priority: FastImage.priority.normal,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather
                    name="user"
                    size={50}
                    color={theme.colors.secondary}
                  />
                </View>
              )}
              <Text style={styles.userName}>{apiResponse?.data.full_name}</Text>
            </View>

            <CollapsibleSection
              title="Personal Information"
              isOpen={sectionOpenState.personal}
              onPress={() => toggleSection("personal")}
            >
              <InfoDisplayField
                label="Name"
                value={apiResponse?.data.full_name}
              />
              <InfoDisplayField
                label="Description"
                value={apiResponse?.data.description}
              />
              <InfoDisplayField
                label="Birthday"
                value={
                  apiResponse?.data.birthday
                    ? dayjs(apiResponse?.data.birthday).format("MM-DD-YYYY")
                    : "-"
                }
              />
              <InfoDisplayField
                label="Email"
                value={apiResponse?.data.email || "-"}
              />
              <InfoDisplayField
                label="Number"
                value={apiResponse?.data.phone}
              />
              <InfoDisplayField
                label="Anniversary"
                value={
                  apiResponse?.data.anniversary
                    ? dayjs(apiResponse?.data.anniversary).format("MM-DD-YYYY")
                    : "-"
                }
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Spouse Details"
              isOpen={sectionOpenState.spouse}
              onPress={() => toggleSection("spouse")}
            >
              {apiResponse?.data?.spouse_name ||
              apiResponse?.data?.spouse_birthday ||
              apiResponse?.data?.spouse_details ? (
                <View style={styles.arrayItemCard}>
                  <InfoDisplayField
                    label="Spouse Name"
                    value={apiResponse?.data.spouse_name || "-"}
                  />
                  <InfoDisplayField
                    label="Spouse Birthday"
                    value={
                      apiResponse?.data.spouse_birthday
                        ? dayjs(apiResponse?.data.spouse_birthday).format(
                            "MM-DD-YYYY"
                          )
                        : "-"
                    }
                  />
                  <InfoDisplayField
                    label="Spouse Details"
                    value={apiResponse?.data.spouse_details || "-"}
                  />
                </View>
              ) : (
                <Text style={styles.noArrayItemsText}>
                  No spouse details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Children Details"
              isOpen={sectionOpenState.children}
              onPress={() => toggleSection("children")}
            >
              {apiResponse?.data.children?.map((child: any, index: any) => (
                <View key={child.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>Child {index + 1}</Text>
                  <InfoDisplayField label="Name" value={child.name} />
                  <InfoDisplayField
                    label="Birthday"
                    value={dayjs(child.birthday).format("MM-DD-YYYY")}
                  />
                  <InfoDisplayField label="Details" value={child.details} />
                </View>
              ))}
              {(!apiResponse?.data.children ||
                apiResponse?.data.children.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No children details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Employment Details"
              isOpen={sectionOpenState.employment}
              onPress={() => toggleSection("employment")}
            >
              {apiResponse?.data.previous_employers?.map(
                (job: any, index: any) => (
                  <View key={job.id} style={styles.arrayItemCard}>
                    <Text style={styles.arrayItemTitle}>
                      Employment {index + 1}
                    </Text>
                    <InfoDisplayField label="Employer" value={job.name} />
                    <InfoDisplayField label="Details" value={job.details} />
                  </View>
                )
              )}
              {(!apiResponse?.data.previous_employers ||
                apiResponse?.data.previous_employers.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No employment details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Education Details"
              isOpen={sectionOpenState.education}
              onPress={() => toggleSection("education")}
            >
              {apiResponse?.data.universities?.map((edu: any, index: any) => (
                <View key={edu.id} style={styles.arrayItemCard}>
                  <Text style={styles.arrayItemTitle}>
                    Education {index + 1}
                  </Text>
                  <InfoDisplayField label="Institution" value={edu.name} />
                  <InfoDisplayField label="Details" value={edu.details} />
                </View>
              ))}
              {(!apiResponse?.data.universities ||
                apiResponse?.data.universities.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No education details added.
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Interests"
              isOpen={sectionOpenState.interests}
              onPress={() => toggleSection("interests")}
            >
              {apiResponse?.data.interests?.map((interest: any) => (
                <Text key={interest.id} style={styles.interestItemValue}>
                  • {interest.name}
                </Text>
              ))}
              {(!apiResponse?.data.interests ||
                apiResponse?.data.interests.length === 0) && (
                <Text style={styles.noArrayItemsText}>No interests added.</Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              title="Others (Custom Fields)"
              isOpen={sectionOpenState.others}
              onPress={() => toggleSection("others")}
            >
              {apiResponse?.data.custom_fields?.map((field: any) => (
                <InfoDisplayField
                  key={field.id || field.title}
                  label={field.title}
                >
                  {field.values.map((val: any, idx: any) => (
                    <Text key={idx} style={styles.infoValue}>
                      • {val}
                    </Text>
                  ))}
                </InfoDisplayField>
              ))}
              {(!apiResponse?.data.custom_fields ||
                apiResponse?.data.custom_fields.length === 0) && (
                <Text style={styles.noArrayItemsText}>
                  No custom fields added.
                </Text>
              )}
            </CollapsibleSection>
          </View>

          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Notes</Text>
              {apiResponse?.data.contact_notes?.length && (
                <TouchableOpacity onPress={handleViewAllNotes}>
                  <Text style={styles.allNotesLink}>
                    All notes{" "}
                    <Feather
                      name="arrow-right-circle"
                      size={14}
                      color={theme.colors.primary}
                    />
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {apiResponse?.data.contact_notes?.map((note: any) => (
              <View key={note.id} style={styles.noteItem}>
                <Text style={styles.noteDate}>
                  {note?.reminder && <Feather name="bell" size={13} />}
                  {note.reminder
                    ? ` ${dayjs(note.reminder).format("MM-DD-YYYY")}`
                    : ""}
                </Text>
                <Text style={styles.noteContent} numberOfLines={2}>
                  {note.note}
                </Text>
                <Text style={styles.noteCreationDate}>
                  Note created at <Feather name="clock" size={13} />{" "}
                  {dayjs(note?.created_date).format("MM-DD-YYYY")}
                </Text>
              </View>
            ))}
            {(!apiResponse?.data.contact_notes ||
              apiResponse?.data.contact_notes.length === 0) && (
              <Text style={styles.noNotesText}>
                No notes yet for this contact.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  // ... (Most styles remain the same, check for consistency with new data)
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iconButtonSmall: {
    backgroundColor: theme.colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: { alignItems: "center", flex: 1, marginHorizontal: 10 },
  headerContactName: {
    fontSize: 20,
    ...theme.font.fontBold,
    color: theme.colors.white,
    textAlign: "center",
  },
  logoImgSmall: {
    width: "80%",
    resizeMode: "contain",
  },
  btnlogoImg: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 40,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 15,
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 5,
    marginBottom: 15,
  },
  actionItem: { alignItems: "center", paddingHorizontal: 5 },
  actionText: {
    color: theme.colors.white,
    fontSize: 11,
    ...theme.font.fontMedium,
    marginTop: 3,
  },
  contentScrollView: { flex: 1 },
  mainInfoCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  avatarDisplaySection: { alignItems: "center", paddingVertical: 20 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  // userName under avatar was removed as name is in header
  collapsibleSection: { borderTopWidth: 1, borderTopColor: theme.colors.grey },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 16,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
  },
  sectionContent: { paddingBottom: 15, paddingHorizontal: 20 },
  infoField: { marginBottom: 12 },
  infoLabel: {
    fontSize: 13,
    ...theme.font.fontMedium,
    color: theme.colors.grey /* Changed to grey */,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.white,
  },
  arrayItemCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  arrayItemTitle: {
    fontSize: 14,
    ...theme.font.fontSemiBold,
    color: theme.colors.white,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey,
    paddingBottom: 3,
  },
  interestItemValue: {
    fontSize: 15,
    ...theme.font.fontRegular,
    color: theme.colors.white,
    marginLeft: 5,
    marginBottom: 5,
  },
  notesCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 18,
    ...theme.font.fontBold,
    color: theme.colors.black,
  },
  allNotesLink: {
    fontSize: 14,
    ...theme.font.fontSemiBold,
    color: theme.colors.primary,
  },
  noteItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey,
  }, // Changed separator to grey
  noteDate: {
    fontSize: 12,
    ...theme.font.fontSemiBold,
    color: theme.colors.secondary,
    marginBottom: 3,
  },
  noteContent: {
    fontSize: 14,
    ...theme.font.fontRegular,
    color: theme.colors.text,
    marginBottom: 4,
  },
  noteCreationDate: {
    fontSize: 11,
    ...theme.font.fontRegular,
    color: theme.colors.grey,
    textAlign: "right",
  },
  noNotesText: {
    textAlign: "center",
    color: theme.colors.grey,
    paddingVertical: 10,
  },
  noArrayItemsText: {
    color: theme.colors.grey,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  }, // Ensure primary is defined
  errorText: {
    color: theme.colors.white,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  userName: {
    ...theme.font.fontBold,
    fontSize: 15,
    color: theme.colors.white,
    paddingHorizontal: 5,
    marginTop: 5,
  },
});

export default ViewContactScreen;
