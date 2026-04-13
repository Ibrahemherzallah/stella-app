import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import PhoneInput from 'react-native-phone-number-input';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { auth } from "../services/firebase";

import {
  colors,
  spacing,
  borderRadius,
  fontSizes,
  fontWeights
} from '../theme/colors';

export const SignInScreen: React.FC = () => {
  const { setMode } = useTheme();
  const { sendPhoneOTP, verifyOTP } = useAuth();

  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recaptchaVerifier = useRef(null);
  const phoneRef = useRef<PhoneInput>(null);

  useEffect(() => {
    setMode("light");
  }, []);

  // SEND OTP
  const handleSendOTP = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!formattedPhone) {
        setError("الرجاء إدخال رقم هاتف صحيح");
        return;
      }

      await sendPhoneOTP(formattedPhone, recaptchaVerifier.current);
      setStep("code");
    } catch (e: any) {
      setError(e.message || "فشل إرسال الكود");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOTP = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!code) {
        setError("الرجاء إدخال رمز التحقق");
        return;
      }

      await verifyOTP(code);
    } catch (e: any) {
      setError(e.message || "رمز غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.logo}>Stella</Text>
            <Text style={styles.subtitle}>لوحة التحكم الإدارية</Text>

            <Text style={styles.stepText}>
              {step === "phone"
                ? "أدخل رقم الهاتف"
                : "أدخل رمز التحقق"}
            </Text>
          </View>

          {/* RECAPTCHA */}
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={auth.app.options}
          />

          {/* ERROR */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* STEP 1: PHONE */}
          {step === "phone" ? (
            <View style={styles.form}>

              <PhoneInput
                ref={phoneRef}
                defaultCode="PS"
                layout="first"
                value={phone}
                onChangeText={setPhone}
                onChangeFormattedText={(text) => setFormattedPhone(text)}
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.phoneTextContainer}
              />

              <PrimaryButton
                title={loading ? "جاري الإرسال..." : "إرسال الكود"}
                onPress={handleSendOTP}
                disabled={loading}
              />
            </View>
          ) : (
            /* STEP 2: OTP */
            <View style={styles.form}>

              <TextInput
                style={styles.otpInput}
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
              />

              <PrimaryButton
                title={loading ? "جاري التحقق..." : "تأكيد الكود"}
                onPress={handleVerifyOTP}
                disabled={loading}
              />
            </View>
          )}

          {/* LOADING OVERLAY */}
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.goldPrimary} />
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  logo: {
    fontSize: fontSizes.xxxl * 1.5,
    fontWeight: fontWeights.bold,
    color: colors.goldPrimary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.darkText,
    fontWeight: fontWeights.medium,
  },

  stepText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.mediumGray,
  },

  form: {
    gap: spacing.lg,
  },

  phoneContainer: {
    width: '100%',
    borderRadius: borderRadius.md,
  },

  phoneTextContainer: {
    borderRadius: borderRadius.md,
  },

  otpInput: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: spacing.md,
  },

  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});