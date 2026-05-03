import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../theme/colors';
import { useTheme } from '@/src/context/ThemeContext';

export const SignInScreen: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme,setMode } = useTheme();
  const handleSignIn = async () => {
    if (!email || !password) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await signIn({ email, password });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMode("light")
  }, []);

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>Stella</Text>
            <Text style={styles.subtitle}>لوحة التحكم الإدارية</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@stella.com"
                placeholderTextColor={colors.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mediumGray}
                secureTextEntry
                textAlign="right"
              />
            </View>

            {error && <ErrorMessage message={error} />}

            <PrimaryButton
              title="تسجيل الدخول"
              onPress={handleSignIn}
              loading={loading}
              style={styles.button}
            />

          </View>
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
    marginBottom: spacing.xxl,
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
  form: {
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.darkText,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.darkText,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  button: {
    marginTop: spacing.md,
  },
  hint: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  hintText: {
    fontSize: fontSizes.sm,
    color: colors.mediumGray,
    textAlign: 'center',
  },
});
