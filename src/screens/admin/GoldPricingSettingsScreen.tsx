import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { PrimaryButton } from '../../components/PrimaryButton';
import { getTodaySettings, saveTodaySettings, listItems, updateItem, } from '../../services/firestoreGold';

type ProductConfig = {
  id: string;
  title: string;
  weightGrams: number;
  makingFeePerGramUsd: number;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
};

type GoldPricingSettings = {
  goldOunceUsd: number;
  premiumOunceUsd: number;
  usdToIls: number;
  usdToJod: number;
};

const EMPTY_SETTINGS: GoldPricingSettings = {
  goldOunceUsd: 0,
  premiumOunceUsd: 0,
  usdToIls: 0,
  usdToJod: 0,
};

export const GoldPricingSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [settings, setSettings] = useState<GoldPricingSettings>(EMPTY_SETTINGS);
  const [products, setProducts] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setInitialLoading(true);
      const [s, items] = await Promise.all([getTodaySettings(), listItems()]);
      if (s) setSettings(s);
      setProducts(items);
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'فشل تحميل البيانات من Firebase');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChangeField = (field: keyof GoldPricingSettings, value: string) => {
    const num = parseFloat(value) || 0;
    setSettings((prev) => ({ ...prev, [field]: num }));
  };

  const handleChangeProductFee = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, makingFeePerGramUsd: num } : p))
    );
  };

  const finalOunceUsd = settings.goldOunceUsd + settings.premiumOunceUsd;
  const baseGramUsd = finalOunceUsd / 31.1 || 0;

  const handleSave = async () => {
    try {
      setLoading(true);

      // 1) Save global settings
      await saveTodaySettings(settings);

      // 2) Save each product's fee changes (only fee here)
      await Promise.all(
        products.map((p) =>
          updateItem(p.id, { makingFeePerGramUsd: p.makingFeePerGramUsd })
        )
      );

      Alert.alert('تم الحفظ', 'تم حفظ الإعدادات والمنتجات بنجاح');
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: spacing.lg }}>
          <Text style={{ color: theme.darkText }}>جارٍ التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("products is : " ,products )
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ padding: spacing.md }}>
          <View style={{ marginBottom: spacing.lg }}>
            <ThemeToggle />
            <Text style={{ color: theme.darkText, fontSize: fontSizes.xxl, fontWeight: '700',textAlign: 'center' }}>
              إعدادات أسعار الذهب
            </Text>
          </View>

          {/* GLOBAL SETTINGS */}
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: theme.goldPrimary, fontSize: 18, fontWeight: '700' }}>إعدادات عامة</Text>

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>سعر الذهب في البورصة (أونصة / دولار)</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
              keyboardType="numeric"
              value={String(settings.goldOunceUsd)}
              onChangeText={(v) => handleChangeField('goldOunceUsd', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>الزيادة على الأونصة (Premium)</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
              keyboardType="numeric"
              value={String(settings.premiumOunceUsd)}
              onChangeText={(v) => handleChangeField('premiumOunceUsd', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>USD → ILS</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
              keyboardType="numeric"
              value={String(settings.usdToIls)}
              onChangeText={(v) => handleChangeField('usdToIls', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>USD → JOD</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
              keyboardType="numeric"
              value={String(settings.usdToJod)}
              onChangeText={(v) => handleChangeField('usdToJod', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.lightText }}>
              السعر النهائي للأونصة = {finalOunceUsd.toFixed(2)}$
            </Text>
            <Text style={{ color: theme.lightText }}>
              سعر الغرام الأساسي ≈ {baseGramUsd.toFixed(2)}$
            </Text>
          </View>

          {/* PRODUCTS */}
          <View style={{ marginTop: spacing.xl }}>
            <Text style={{ color: theme.goldPrimary, fontSize: 18, fontWeight: '700' }}>المصنعية لكل صنف</Text>

            {products.map((product) => {
              const finalGramUsd = baseGramUsd + product.makingFeePerGramUsd;
              const priceUsd = finalGramUsd * product.weightGrams;
              const priceJod = priceUsd * settings.usdToJod;
              const priceIls = priceUsd * settings.usdToIls;

              return (
                <View key={product.id} style={{ marginTop: spacing.lg, padding: 14, borderRadius: 14, backgroundColor: theme.surface }}>
                  <Text style={{ color: theme.darkText, fontWeight: '700', textAlign: 'right' }}>
                    {product.title}
                  </Text>
                  <Text style={{ color: theme.lightText, textAlign: 'right', marginTop: 4 }}>
                    الوزن: {product.weightGrams} غرام
                  </Text>

                  <Text style={{ color: theme.darkText, marginTop: spacing.md, textAlign: 'right' }}>
                    المصنعية لكل غرام (USD)
                  </Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
                    keyboardType="numeric"
                    value={String(product.makingFeePerGramUsd)}
                    onChangeText={(v) => handleChangeProductFee(product.id, v)}
                  />

                  <View style={{ marginTop: spacing.md }}>
                    <Text style={{ color: theme.goldPrimary, fontWeight: '700', textAlign: 'right' }}>السعر النهائي:</Text>
                    <Text style={{ color: theme.darkText, textAlign: 'right' }}>{priceUsd.toFixed(2)} $</Text>
                    <Text style={{ color: theme.darkText, textAlign: 'right' }}>{priceJod.toFixed(2)} JOD</Text>
                    <Text style={{ color: theme.darkText, textAlign: 'right' }}>{priceIls.toFixed(2)} ₪</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* BUTTONS */}
          <View style={{ marginTop: spacing.xl }}>
            <PrimaryButton
              title="إضافة صنف جديد"
              onPress={() => navigation.navigate('AddGoldItem' as never)}
            />
            <View style={{ height: 12 }} />
            <PrimaryButton
              title={loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              onPress={handleSave}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'right',
    fontSize: fontSizes.md,
  },
  infoText: {
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  productBlock: {
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#ddd3',
    paddingTop: spacing.md,
  },
  productTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  previewText: {
    fontSize: fontSizes.sm,
    textAlign: 'right',
  },
});
