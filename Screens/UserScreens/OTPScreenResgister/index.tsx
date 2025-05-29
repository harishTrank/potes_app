import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Alert,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import theme from "../../../utils/theme";
import Toast from "react-native-toast-message";
import DefaultBackground from "../../Components/DefaultBackground";
import { registerApi, verifyOtp } from "../../../store/Services/Auth";
import FullScreenLoader from "../../Components/FullScreenLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { height, width } = Dimensions.get("window");
const OTP_LENGTH = 4;

const OTPScreenResgister = ({ navigation, route }: any) => {
  const emailFromPreviousScreen =
    route?.params?.values?.username || "your username";

  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [loading, setLoading]: any = useState(false);

  const handleResendCode = () => {
    setResendDisabled(true);
    setLoading(true);
    registerApi({
      body: {
        first_name: route?.params?.values.firstName,
        last_name: route?.params?.values.lastName,
        username: route?.params?.values.username,
        email: route?.params?.values.email,
        password: route?.params?.values.password,
        password2: route?.params?.values.confirmPassword,
      },
    })
      ?.then((res: any) => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: res.msg,
        });
      })
      ?.catch((err: any) => {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: err?.data?.error,
        });
      });
  };

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendDisabled, countdown]);

  const handleOtpChange = (text: string) => {
    const newOtp = text.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    setOtpCode(newOtp);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleContinue = () => {
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert("Incomplete OTP", `Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    Keyboard.dismiss();
    setIsSubmitting(true);
    verifyOtp({
      body: {
        username: emailFromPreviousScreen,
        otp: otpCode,
      },
    })
      ?.then(async (res: any) => {
        setIsSubmitting(false);
        Toast.show({
          type: "success",
          text1: res?.msg,
        });
        await AsyncStorage.setItem("accessToken", res?.token?.access);
        navigation.navigate("DrawerNavigation");
        setLoading(false);
      })
      ?.catch((err: any) => {
        setIsSubmitting(false);
        Toast.show({
          type: "error",
          text1: err?.data?.error,
        });
      });
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      const digit = otpCode[i] || "";
      const isCurrent = i === otpCode.length;
      const isLastFilled =
        i === OTP_LENGTH - 1 && otpCode.length === OTP_LENGTH;
      const isFocusedStyle = isInputFocused && (isCurrent || isLastFilled);

      boxes.push(
        <View
          key={i}
          style={[
            styles.otpInputBox,
            isFocusedStyle && styles.otpInputBoxHighlighted,
          ]}
        >
          <Text style={styles.otpDigit}>{digit}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <DefaultBackground>
      <SafeAreaView style={styles.safeArea}>
        {loading && <FullScreenLoader />}
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical={false}
          >
            <TextInput
              ref={inputRef}
              value={otpCode}
              onChangeText={handleOtpChange}
              maxLength={OTP_LENGTH}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              style={styles.hiddenInput}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              caretHidden
              autoFocus={true}
            />

            <View style={styles.contentContainer}>
              <Text style={styles.screenTitle}>Enter the OTP</Text>
              <Text style={styles.subtitle}>
                We've sent a password recover OTP{"\n"}to{" "}
                {emailFromPreviousScreen}
              </Text>

              <Pressable onPress={focusInput} style={styles.otpBoxContainer}>
                {renderOtpBoxes()}
              </Pressable>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't get the OTP? </Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={resendDisabled}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      resendDisabled && styles.resendLinkDisabled,
                    ]}
                  >
                    {resendDisabled
                      ? `Resend Code in ${countdown}s`
                      : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (isSubmitting || otpCode.length !== OTP_LENGTH) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={isSubmitting || otpCode.length !== OTP_LENGTH}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.footerText}>
                Didn't get any email? Check your spam{"\n"}folder or try again
                with a valid email.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DefaultBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.1,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.1,
  },
  screenTitle: {
    fontSize: 26,
    color: theme.colors.black,
    ...theme.font.fontSemiBold,
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.lightBackground,
    ...theme.font.fontRegular,
    textAlign: "center",
    marginBottom: height * 0.05,
    lineHeight: 22,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
    minHeight: 50,
  },
  otpInputBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.colors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  otpDigit: {
    fontSize: 20,
    color: theme.colors.black,
    ...theme.font.fontMedium,
  },
  otpInputBoxHighlighted: {
    borderColor: theme.colors.white,
    borderWidth: 1.5,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: height * 0.06,
  },
  resendText: {
    fontSize: 14,
    color: theme.colors.lightBackground,
    ...theme.font.fontRegular,
  },
  resendLink: {
    fontSize: 14,
    color: theme.colors.secondary,
    ...theme.font.fontBold,
  },
  resendLinkDisabled: {
    color: theme.colors.lightBackground,
  },
  continueButton: {
    backgroundColor: theme.colors.lightBackground,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  continueButtonText: {
    fontSize: 18,
    color: theme.colors.white,
    ...theme.font.fontMedium,
    textTransform: "none",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.greyText,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.lightBackground,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginTop: height * 0.1,
  },
});

export default OTPScreenResgister;
