import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
  Keyboard,
  KeyboardEvent,
  Platform,
  LayoutAnimation,
} from "react-native";
import { useAtom } from "jotai";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../utils/theme";
import { aiAssistantOverlayGlobal } from "../../jotaiStore";
import DefaultBackground from "./DefaultBackground";
import ChatBody from "../UserScreens/ChatAiScreen/ChatBody";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.88);

// Mounted once above the navigator (see navigation/index.tsx) so the AI
// assistant can be opened from any screen as an overlay instead of a
// full navigation push, keeping the caller's screen state intact underneath.
export const AIAssistantSheet = () => {
  const [overlay, setOverlay] = useAtom(aiAssistantOverlayGlobal);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const close = () => setOverlay({ visible: false, contactId: null });

  // The sheet is a fixed-height panel anchored to the bottom of a transparent
  // Modal, so a KeyboardAvoidingView inside it can't work out the real overlap
  // (it measures its frame relative to the sheet, not the screen) and whether
  // the Modal window itself resizes for the keyboard varies on Android. Track
  // the keyboard here in screen coordinates instead and lift/shrink the whole
  // sheet so the chat input always sits just above the keyboard.
  const rootHeightRef = useRef(SCREEN_HEIGHT);
  const keyboardTopRef = useRef<number | null>(null);
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);
  const [rootHeight, setRootHeight] = useState(SCREEN_HEIGHT);

  const updateOverlap = (animate = true) => {
    const top = keyboardTopRef.current;
    const overlap =
      top == null ? 0 : Math.max(0, Math.round(rootHeightRef.current - top));
    setKeyboardOverlap((prev) => {
      if (prev !== overlap && animate && Platform.OS === "ios") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      return overlap;
    });
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      keyboardTopRef.current = e.endCoordinates.screenY;
      updateOverlap();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = null;
      updateOverlap();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const keyboardOpen = keyboardOverlap > 0;
  const sheetHeight = Math.min(
    SHEET_HEIGHT,
    rootHeight - keyboardOverlap - insets.top,
  );

  useEffect(() => {
    if (overlay.visible) {
      translateY.setValue(SHEET_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 14,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [overlay.visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 1.2) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 14,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={overlay.visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View
        style={[styles.root, { paddingBottom: keyboardOverlap }]}
        onLayout={(e) => {
          rootHeightRef.current = e.nativeEvent.layout.height;
          setRootHeight(e.nativeEvent.layout.height);
          // If the Modal window resized for the keyboard, the overlap shrinks
          // accordingly, so recompute against the new height.
          updateOverlap(false);
        }}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={close}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <View style={styles.handleBar} />
          </View>
          <DefaultBackground style={styles.body}>
            <ChatBody
              contactId={overlay.contactId}
              bottomInset={keyboardOpen ? 0 : insets.bottom}
              closeIconName="x"
              onClose={close}
              embedded
            />
          </DefaultBackground>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: theme.colors.lightBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: theme.colors.lightBackground,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.grey,
  },
  body: { flex: 1 },
});
