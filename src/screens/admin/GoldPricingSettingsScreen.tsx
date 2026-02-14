// src/screens/admin/GoldPricingSettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeToggle } from '@/src/components/ThemeToggle';

// TODO: implement these in your api.ts
// import { getGoldPricingSettings, saveGoldPricingSettings } from '../../services/api';

type ProductConfig = {
  id: string;
  title: string;
  weightGrams: number;
  makingFeePerGramUsd: number;
};

type GoldPricingSettings = {
  goldOunceUsd: number;
  premiumOunceUsd: number;
  usdToIls: number;
  usdToJod: number;
  products: ProductConfig[];
};

// some initial hard-coded configs – you can load them from backend instead
const DEFAULT_SETTINGS: GoldPricingSettings = {
  goldOunceUsd: 5000,
  premiumOunceUsd: 0,
  usdToIls: 3.7,
  usdToJod: 0.71,
  products: [
    {
      id: '21k_buy_with_making',
      title: 'سعر الذهب عيار 21 للشراء مع مصنعية',
      weightGrams: 1,
      makingFeePerGramUsd: 2,
    },
    {
      id: '21k_buy_without_making',
      title: 'سعر الذهب عيار 21 للشراء بدون مصنعية',
      weightGrams: 1,
      makingFeePerGramUsd: 0,
    },
    {
      id: '21k_sell_without_making',
      title: 'سعر الذهب عيار 21 للبيع بدون مصنعية',
      weightGrams: 1,
      makingFeePerGramUsd: 1,
    },
    {
      id: 'rashadi_7g',
      title: 'ليرة رشادي 7 غم مختوم وزارة',
      weightGrams: 7,
      makingFeePerGramUsd: 1.5,
    },
    {
      id: 'english_8g',
      title: 'ليرة انجليزي 8 غم مختوم وزارة',
      weightGrams: 8,
      makingFeePerGramUsd: 1.5,
    },
    {
      id: 'ounce_31_1g',
      title: 'اونصة محلي 31.1 غم مختوم وزارة',
      weightGrams: 31.1,
      makingFeePerGramUsd: 2,
    },
  ],
};

export const GoldPricingSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<GoldPricingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // If you have backend, load initial settings here
  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       setLoading(true);
  //       const remote = await getGoldPricingSettings();
  //       setSettings(remote);
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   load();
  // }, []);

  const handleChangeField = (field: keyof GoldPricingSettings, value: string) => {
    const num = parseFloat(value) || 0;
    setSettings(prev => ({ ...prev, [field]: num }));
  };

  const handleChangeProductFee = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setSettings(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === id ? { ...p, makingFeePerGramUsd: num } : p
      ),
    }));
  };

  const finalOunceUsd = settings.goldOunceUsd + settings.premiumOunceUsd;
  const baseGramUsd = finalOunceUsd / 31.1 || 0;

  const handleSave = async () => {
    try {
      setLoading(true);
      // await saveGoldPricingSettings(settings);
      Alert.alert('تم الحفظ', 'تم حفظ إعدادات أسعار الذهب بنجاح');
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: `${theme.background}`}}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.headerRow}>
          <ThemeToggle />
          <Text style={[styles.title, { color: theme.darkText }]}>
            إعدادات أسعار الذهب
          </Text>
        </View>


        {/* GLOBAL SETTINGS */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, shadowColor: theme.darkText },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.goldPrimary }]}>
            إعدادات عامة
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.darkText }]}>
              سعر الذهب في البورصة (أونصة / دولار)
            </Text>
            <TextInput
              style={[styles.input, { color: theme.darkText, borderColor: theme.lightGray }]}
              keyboardType="numeric"
              value={String(settings.goldOunceUsd)}
              onChangeText={v => handleChangeField('goldOunceUsd', v)}
            />
          </View>

          {/*<View style={styles.field}>*/}
          {/*  <Text style={[styles.label, { color: theme.darkText }]}>*/}
          {/*    الزيادة فوق سعر البورصة (أونصة / دولار)*/}
          {/*  </Text>*/}
          {/*  <TextInput*/}
          {/*    style={[styles.input, { color: theme.darkText, borderColor: theme.lightGray }]}*/}
          {/*    keyboardType="numeric"*/}
          {/*    value={String(settings.premiumOunceUsd)}*/}
          {/*    onChangeText={v => handleChangeField('premiumOunceUsd', v)}*/}
          {/*  />*/}
          {/*</View>*/}

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={[styles.label, { color: theme.darkText }]}>
                سعر الدولار مقابل الشيكل (USD → ILS)
              </Text>
              <TextInput
                style={[styles.input, { color: theme.darkText, borderColor: theme.lightGray }]}
                keyboardType="numeric"
                value={String(settings.usdToIls)}
                onChangeText={v => handleChangeField('usdToIls', v)}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={[styles.label, { color: theme.darkText }]}>
                سعر الدولار مقابل الدينار (USD → JOD)
              </Text>
              <TextInput
                style={[styles.input, { color: theme.darkText, borderColor: theme.lightGray }]}
                keyboardType="numeric"
                value={String(settings.usdToJod)}
                onChangeText={v => handleChangeField('usdToJod', v)}
              />
            </View>
          </View>

          <Text style={[styles.infoText, { color: theme.lightText }]}>
            السعر النهائي للأونصة = سعر البورصة + الزيادة = {finalOunceUsd.toFixed(2)}$
          </Text>
          <Text style={[styles.infoText, { color: theme.lightText }]}>
            سعر الغرام الأساسي (بدون مصنعية) ≈ {baseGramUsd.toFixed(2)}$
          </Text>
        </View>

        {/* PER PRODUCT MAKING FEES */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, shadowColor: theme.darkText },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.goldPrimary }]}>
            المصنعية لكل صنف
          </Text>

          {settings.products.map(product => {
            const finalGramUsd =
              baseGramUsd + product.makingFeePerGramUsd;
            const priceUsd = finalGramUsd * product.weightGrams;
            const priceJod = priceUsd * settings.usdToJod;
            const priceIls = priceUsd * settings.usdToIls;

            return (
              <View key={product.id} style={styles.productBlock}>
                <Text style={[styles.productTitle, { color: theme.darkText }]}>
                  {product.title}
                </Text>

                <Text style={[styles.infoText, { color: theme.lightText }]}>
                  الوزن: {product.weightGrams} غرام
                </Text>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: theme.darkText }]}>
                    المصنعية لكل غرام (بالدولار)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.darkText, borderColor: theme.lightGray }]}
                    keyboardType="numeric"
                    value={String(product.makingFeePerGramUsd)}
                    onChangeText={v => handleChangeProductFee(product.id, v)}
                  />
                </View>

                <View style={styles.previewRow}>
                  <Text style={[styles.previewText, { color: theme.goldPrimary }]}>
                    السعر النهائي:
                  </Text>
                  <View>
                    <Text style={[styles.previewText, { color: theme.darkText }]}>
                      {priceUsd.toFixed(2)} $
                    </Text>
                    <Text style={[styles.previewText, { color: theme.darkText }]}>
                      {priceJod.toFixed(2)} JOD
                    </Text>
                    <Text style={[styles.previewText, { color: theme.darkText }]}>
                      {priceIls.toFixed(2)} ₪
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <PrimaryButton
          title={loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          onPress={handleSave}
          disabled={loading}
        />
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
