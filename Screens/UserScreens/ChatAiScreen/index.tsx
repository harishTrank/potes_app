import React from "react";
import DefaultBackground from "../../Components/DefaultBackground";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatBody from "./ChatBody";

const ChatWithAI = ({ navigation, route }: any) => {
  const contactId = route?.params?.contactId || null;
  const insets = useSafeAreaInsets();

  return (
    <DefaultBackground>
      <ChatBody
        contactId={contactId}
        topInset={insets.top + 6}
        closeIconName="arrow-left"
        onClose={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate("HomeScreen")
        }
      />
    </DefaultBackground>
  );
};

export default ChatWithAI;
