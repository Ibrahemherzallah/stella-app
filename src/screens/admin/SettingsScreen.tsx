// src/screens/admin/SettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert,ScrollView, TouchableOpacity, } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';
// import { getSettings, updateSettings } from '../../services/api';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import type { Settings } from '../../types';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { SafeAreaView } from 'react-native-safe-area-context'
import { getPublicSettings, savePublicSettings, getRulesList, saveRulesList, } from '../../services/goldSettingsService';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { theme } = useTheme();

  const [rules, setRules] = useState<string[]>(['']);
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      setLoading(true);

      const [settingsData, rulesData] = await Promise.all([
        getPublicSettings(),
        getRulesList(),
      ]);

      setWhatsapp(settingsData.socialMedia.whatsapp);
      setInstagram(settingsData.socialMedia.instagram);
      setTiktok(settingsData.socialMedia.tiktok);
      setFacebook(settingsData.socialMedia.facebook);

      setRules(rulesData.length > 0 ? rulesData : ['']);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleRuleChange = (index: number, value: string) => {
    setRules((prev) => prev.map((rule, i) => (i === index ? value : rule)));
  };

  const handleAddRule = () => {
    setRules((prev) => [...prev, '']);
  };

  const handleDeleteRule = (index: number) => {
    setRules((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSaving(true);

      await Promise.all([
        savePublicSettings({
          socialMedia: {
            whatsapp: whatsapp.trim(),
            instagram: instagram.trim(),
            tiktok: tiktok.trim(),
            facebook: facebook.trim(),
          },
        }),
        saveRulesList(rules),
      ]);

      Alert.alert('نجح', 'تم حفظ الإعدادات بنجاح');
      await fetchSettings();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ الإعدادات');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <ThemeToggle />
            <Text style={[styles.title, { color: theme.darkText }]}>الإعدادات</Text>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.goldPrimary }]}>
                قواعد الذهب
              </Text>

              {rules.map((rule, index) => (
                <View key={index} style={styles.ruleBlock}>
                  <Text style={[styles.label, { color: theme.darkText }]}>
                    القاعدة {index + 1}
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
                    value={rule}
                    onChangeText={(value) => handleRuleChange(index, value)}
                    placeholder="اكتب القاعدة هنا"
                    placeholderTextColor={theme.lightText}
                    multiline
                    numberOfLines={3}
                    textAlign="right"
                  />

                  <TouchableOpacity
                    onPress={() => handleDeleteRule(index)}
                    style={styles.deleteRuleButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteRuleText}>حذف القاعدة</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <PrimaryButton
                title="إضافة قاعدة جديدة"
                onPress={handleAddRule}
                variant="outline"
                style={styles.addRuleButton}
              />
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
                  placeholder="https://instagram.com/your_page"
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
                  placeholder="https://facebook.com/your_page"
                  placeholderTextColor={theme.lightText}
                  keyboardType="url"
                  textAlign="right"
                />
              </View>

              <PrimaryButton
                title={'تغيير كلمة المرور'}
                onPress={() => navigation.navigate('ChangePassword' as never)}
                style={styles.button}
              />
            </View>

            <PrimaryButton
              title={saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              onPress={handleSave}
              loading={saving}
              style={styles.button}
            />

            <PrimaryButton
              title="تسجيل الخروج"
              onPress={handleSignOut}
              variant="outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.md,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  ruleBlock: {
    marginBottom: spacing.md,
  },
  deleteRuleButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  deleteRuleText: {
    color: '#c62828',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  addRuleButton: {
    marginTop: spacing.sm,
  },
  button: {
    marginBottom: spacing.md,
  },
});