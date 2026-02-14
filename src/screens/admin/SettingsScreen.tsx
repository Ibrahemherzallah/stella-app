// src/screens/admin/SettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert,ScrollView, TouchableOpacity, } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';
import { getSettings, updateSettings } from '../../services/api';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import type { Settings } from '../../types';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { SafeAreaView } from 'react-native-safe-area-context'

export const SettingsScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const [buyMargin, setBuyMargin] = useState('');
  const [sellMargin, setSellMargin] = useState('');
  const [makingFee, setMakingFee] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const data = await getSettings();
      setBuyMargin(data.buyMargin.toString());
      setSellMargin(data.sellMargin.toString());
      setMakingFee(data.makingFeePerGram.toString());
      setRulesText(data.rulesText);
      setWhatsapp(data.socialMedia.whatsapp);
      setInstagram(data.socialMedia.instagram);
      setTiktok(data.socialMedia.tiktok);
      setFacebook(data.socialMedia.facebook);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الإعدادات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const settings: Settings = {
      buyMargin: parseFloat(buyMargin),
      sellMargin: parseFloat(sellMargin),
      makingFeePerGram: parseFloat(makingFee),
      rulesText,
      socialMedia: {
        whatsapp,
        instagram,
        tiktok,
        facebook,
      },
    };

    try {
      setError(null);
      setSaving(true);
      await updateSettings(settings);
      Alert.alert('نجح', 'تم حفظ الإعدادات بنجاح');
    } catch (err) {
      setError('حدث خطأ أثناء حفظ الإعدادات');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };


  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: `${theme.background}`}}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
          <ScrollView>
            <View style={styles.header}>
              <ThemeToggle />
              <Text style={[styles.title, { color: theme.darkText }]}>الإعدادات</Text>
            </View>

            {error && <ErrorMessage message={error} />}

            <View style={styles.form}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.goldPrimary }]}>
                قواعد الذهب
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.darkText }]}>
                  نص القواعد والملاحظات
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.surface,
                      color: theme.darkText,
                      borderColor: theme.lightGray,
                    },
                  ]}
                  value={rulesText}
                  onChangeText={setRulesText}
                  placeholder="مثال: سعر الذهب يتغير يومياً حسب السوق العالمي..."
                  placeholderTextColor={theme.lightText}
                  multiline
                  numberOfLines={5}
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.goldPrimary }]}>
                روابط السوشيال ميديا
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.darkText }]}>WhatsApp</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      color: theme.darkText,
                      borderColor: theme.lightGray,
                    },
                  ]}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  placeholder="https://wa.me/201234567890"
                  placeholderTextColor={theme.lightText}
                  keyboardType="url"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.darkText }]}>Instagram</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      color: theme.darkText,
                      borderColor: theme.lightGray,
                    },
                  ]}
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="https://instagram.com/stella_gold"
                  placeholderTextColor={theme.lightText}
                  keyboardType="url"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.darkText }]}>TikTok</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      color: theme.darkText,
                      borderColor: theme.lightGray,
                    },
                  ]}
                  value={tiktok}
                  onChangeText={setTiktok}
                  placeholder="https://tiktok.com/@stella_gold"
                  placeholderTextColor={theme.lightText}
                  keyboardType="url"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.darkText }]}>Facebook</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      color: theme.darkText,
                      borderColor: theme.lightGray,
                    },
                  ]}
                  value={facebook}
                  onChangeText={setFacebook}
                  placeholder="https://facebook.com/stella_gold"
                  placeholderTextColor={theme.lightText}
                  keyboardType="url"
                  textAlign="right"
                />
              </View>
            </View>

            <PrimaryButton
              title="حفظ الإعدادات"
              onPress={handleSave}
              loading={saving}
              style={styles.button}
            />

            <PrimaryButton title="تسجيل الخروج" onPress={handleSignOut} variant="outline" />
          </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  themeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  themeButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    textAlign: 'right',
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: spacing.md,
  },
});
