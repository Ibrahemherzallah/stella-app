import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { PrimaryButton } from '../../components/PrimaryButton';
import { getTodaySettings, saveTodaySettings, listItems, updateItem, deleteItem,GoldItem } from '../../services/goldSettingsService';

// type GoldItem = {
//   id: string;
//   title: string;
//   weightGrams: number;
//   makingFeePerGramUsd: number;
//   imageUrl?: string;
//   order?: number;
//   isActive?: boolean;
// };
// export type GoldItem = {
//   id: string;
//   title: string;
//   imageUrl?: string;
//   weightGrams: number;
//   makingFeePerGramUsd: number;
//   isActive: boolean;
//   order: number;
//   updatedAt?: any;
// };

type GoldPricingSettingsForm = {
  goldOunceUsd: string;
  premiumOunceUsd: string;
  usdToIls: string;
  usdToJod: string;
};

type ProductFeeForm = Record<string, string>;

type FirestoreGoldPricingSettings = {
  goldOunceUsd: number;
  premiumOunceUsd: number;
  usdToIls: number;
  usdToJod: number;
};

const EMPTY_SETTINGS: GoldPricingSettingsForm = {
  goldOunceUsd: '',
  premiumOunceUsd: '',
  usdToIls: '',
  usdToJod: '',
};

const toStrSettings = (
  s: FirestoreGoldPricingSettings
): GoldPricingSettingsForm => ({
  goldOunceUsd: String(s.goldOunceUsd ?? ''),
  premiumOunceUsd: String(s.premiumOunceUsd ?? ''),
  usdToIls: String(s.usdToIls ?? ''),
  usdToJod: String(s.usdToJod ?? ''),
});

const parseNum = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const sanitizeDecimal = (value: string) => {
  let v = value.replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');

  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
  }

  return v;
};

export const GoldPricingSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [settings, setSettings] = useState<GoldPricingSettingsForm>(EMPTY_SETTINGS);
  const [products, setProducts] = useState<GoldItem[]>([]);
  const [productFees, setProductFees] = useState<ProductFeeForm>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setInitialLoading(true);

      const [savedSettings, items] = await Promise.all([
        getTodaySettings(),
        listItems(),
      ]);

      if (savedSettings) {
        setSettings(toStrSettings(savedSettings as FirestoreGoldPricingSettings));
      } else {
        setSettings(EMPTY_SETTINGS);
      }

      setProducts(items);

      const feesMap: ProductFeeForm = {};
      items.forEach((item) => {
        feesMap[item.id] = String(item.makingFeePerGramUsd ?? '');
      });
      setProductFees(feesMap);
    } catch (error) {
      console.error('loadAll error:', error);
      Alert.alert('خطأ', 'فشل تحميل البيانات من Firebase');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChangeField = (field: keyof GoldPricingSettingsForm, value: string) => {
    const sanitized = sanitizeDecimal(value);
    setSettings((prev) => ({
      ...prev,
      [field]: sanitized,
    }));
  };

  const handleChangeProductFee = (id: string, value: string) => {
    const sanitized = sanitizeDecimal(value);

    setProductFees((prev) => ({
      ...prev,
      [id]: sanitized,
    }));

    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
            ...product,
            makingFeePerGramUsd: parseNum(sanitized),
          }
          : product
      )
    );
  };

  const goldOunceUsdNum = useMemo(
    () => parseNum(settings.goldOunceUsd),
    [settings.goldOunceUsd]
  );

  const premiumOunceUsdNum = useMemo(
    () => parseNum(settings.premiumOunceUsd),
    [settings.premiumOunceUsd]
  );

  const usdToIlsNum = useMemo(
    () => parseNum(settings.usdToIls),
    [settings.usdToIls]
  );

  const usdToJodNum = useMemo(
    () => parseNum(settings.usdToJod),
    [settings.usdToJod]
  );

  const { finalOunceUsd, baseGramUsd } = useMemo(() => {
    const finalOunce = goldOunceUsdNum + premiumOunceUsdNum;
    const baseGram = finalOunce > 0 ? finalOunce / 31.1 : 0;

    return {
      finalOunceUsd: finalOunce,
      baseGramUsd: baseGram,
    };
  }, [goldOunceUsdNum, premiumOunceUsdNum]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await saveTodaySettings({
        goldOunceUsd: goldOunceUsdNum,
        premiumOunceUsd: premiumOunceUsdNum,
        usdToIls: usdToIlsNum,
        usdToJod: usdToJodNum,
      });

      await Promise.all(
        products.map((product) =>
          updateItem(product.id, {
            makingFeePerGramUsd: product.makingFeePerGramUsd,
          })
        )
      );

      await loadAll();

      Alert.alert('تم الحفظ', 'تم حفظ الإعدادات والمنتجات بنجاح');
    } catch (error) {
      console.error('handleSave error:', error);
      Alert.alert('خطأ', 'فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (product: GoldItem) => {
    Alert.alert(
      'حذف الصنف',
      `هل أنت متأكد أنك تريد حذف "${product.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
              setProductFees((prev) => {
                const next = { ...prev };
                delete next[product.id];
                return next;
              });
            } catch (error) {
              console.error('deleteItem error:', error);
              Alert.alert('خطأ', 'فشل حذف الصنف');
            }
          },
        },
      ]
    );
  };

  const goToEdit = (productId: string) => {
    // @ts-ignore
    navigation.navigate('AddGoldItem' as never, { itemId: productId } as never);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.darkText }}>جارٍ التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: spacing.md }}>
          <View style={styles.headerBlock}>
            <ThemeToggle />
            <Text
              style={[
                styles.screenTitle,
                { color: theme.darkText },
              ]}
            >
              إعدادات أسعار الذهب
            </Text>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: theme.goldPrimary }]}>
              إعدادات عامة
            </Text>

            <Text style={[styles.label, { color: theme.darkText }]}>
              سعر الذهب في البورصة (أونصة / دولار)
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="decimal-pad"
              value={settings.goldOunceUsd}
              onChangeText={(v) => handleChangeField('goldOunceUsd', v)}
              placeholder="مثال: 3025.50"
              placeholderTextColor={theme.lightText}
            />

            <Text style={[styles.label, { color: theme.darkText }]}>
              الزيادة على الأونصة (Premium)
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="decimal-pad"
              value={settings.premiumOunceUsd}
              onChangeText={(v) => handleChangeField('premiumOunceUsd', v)}
              placeholder="مثال: 25"
              placeholderTextColor={theme.lightText}
            />

            <Text style={[styles.label, { color: theme.darkText }]}>
              USD → ILS
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="decimal-pad"
              value={settings.usdToIls}
              onChangeText={(v) => handleChangeField('usdToIls', v)}
              placeholder="مثال: 3.67"
              placeholderTextColor={theme.lightText}
            />

            <Text style={[styles.label, { color: theme.darkText }]}>
              USD → JOD
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="decimal-pad"
              value={settings.usdToJod}
              onChangeText={(v) => handleChangeField('usdToJod', v)}
              placeholder="مثال: 0.71"
              placeholderTextColor={theme.lightText}
            />

            <Text style={[styles.helperText, { color: theme.lightText }]}>
              السعر النهائي للأونصة = {finalOunceUsd.toFixed(2)} $
            </Text>
            <Text style={[styles.helperText, { color: theme.lightText }]}>
              سعر الغرام الأساسي ≈ {baseGramUsd.toFixed(2)} $
            </Text>
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: theme.goldPrimary }]}>
              المصنعية لكل صنف
            </Text>

            {products.map((product) => {
              const finalGramUsd = baseGramUsd + (product.makingFeePerGramUsd || 0);
              const priceUsd = finalGramUsd * (product.weightGrams || 0);
              const priceJod = priceUsd * usdToJodNum;
              const priceIls = priceUsd * usdToIlsNum;

              return (
                <View
                  key={product.id}
                  style={[
                    styles.productCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.lightGray,
                    },
                  ]}
                >
                  <View style={styles.titleRow}>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={() => goToEdit(product.id)}
                        style={[
                          styles.actionBtn,
                          { backgroundColor: theme.lightGray },
                        ]}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.actionText, { color: theme.darkText }]}>
                          تعديل
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteItem(product)}
                        style={[
                          styles.actionBtn,
                          { backgroundColor: '#ffdddd' },
                        ]}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.actionText, { color: '#b00020' }]}>
                          حذف
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.productTitle,
                          { color: theme.darkText },
                        ]}
                      >
                        {product.title}
                      </Text>
                      <Text
                        style={[
                          styles.productSubtitle,
                          { color: theme.lightText },
                        ]}
                      >
                        الوزن: {product.weightGrams} غرام
                      </Text>
                    </View>
                  </View>

                  <Image source={ product.imageUrl ? { uri: product.imageUrl } : require('../../../assets/images/gold1.jpg') }
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  <Text style={[styles.label, { color: theme.darkText }]}>
                    المصنعية لكل غرام (USD)
                  </Text>
                  <TextInput
                    style={[
                      styles.inputBox,
                      { borderColor: theme.lightGray, color: theme.darkText },
                    ]}
                    keyboardType="decimal-pad"
                    value={productFees[product.id] ?? ''}
                    onChangeText={(v) => handleChangeProductFee(product.id, v)}
                    placeholder="مثال: 4.5"
                    placeholderTextColor={theme.lightText}
                  />

                  <View style={{ marginTop: spacing.md }}>
                    <Text
                      style={[
                        styles.finalPriceTitle,
                        { color: theme.goldPrimary },
                      ]}
                    >
                      السعر النهائي:
                    </Text>
                    <Text style={[styles.finalPriceText, { color: theme.darkText }]}>
                      {priceUsd.toFixed(2)} $
                    </Text>
                    <Text style={[styles.finalPriceText, { color: theme.darkText }]}>
                      {priceJod.toFixed(2)} JOD
                    </Text>
                    <Text style={[styles.finalPriceText, { color: theme.darkText }]}>
                      {priceIls.toFixed(2)} ₪
                    </Text>
                  </View>
                </View>
              );
            })}

            {products.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.lightText }]}>
                لا توجد أصناف حالياً.
              </Text>
            ) : null}
          </View>

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

// const styles = StyleSheet.create({
//   loadingContainer: {
//     padding: spacing.lg,
//   },
//   headerBlock: {
//     marginBottom: spacing.lg,
//   },
//   screenTitle: {
//     fontSize: fontSizes.xxl,
//     fontWeight: fontWeights.bold,
//     textAlign: 'center',
//     marginTop: spacing.sm,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: fontWeights.bold,
//     textAlign: 'right',
//     marginBottom: spacing.md,
//   },
//   label: {
//     marginTop: spacing.md,
//     marginBottom: spacing.xs,
//     textAlign: 'right',
//     fontSize: fontSizes.md,
//   },
//   inputBox: {
//     borderWidth: 1,
//     borderRadius: borderRadius.md,
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     fontSize: fontSizes.md,
//     textAlign: 'right',
//   },
//   helperText: {
//     marginTop: spacing.sm,
//     textAlign: 'right',
//     fontSize: fontSizes.sm,
//   },
//   productCard: {
//     marginTop: spacing.md,
//     borderWidth: 1,
//     borderRadius: borderRadius.lg,
//     padding: spacing.md,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: spacing.sm,
//   },
//   actionsRow: {
//     flexDirection: 'row',
//     gap: spacing.sm,
//   },
//   actionBtn: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs,
//     borderRadius: borderRadius.md,
//   },
//   actionText: {
//     fontSize: fontSizes.sm,
//     fontWeight: fontWeights.medium,
//   },
//   productTitle: {
//     fontWeight: fontWeights.bold,
//     textAlign: 'right',
//     fontSize: fontSizes.md,
//   },
//   productSubtitle: {
//     textAlign: 'right',
//     marginTop: 4,
//     fontSize: fontSizes.sm,
//   },
//   productImage: {
//     width: '100%',
//     height: 170,
//     borderRadius: borderRadius.md,
//     marginTop: spacing.md,
//   },
//   finalPriceTitle: {
//     fontWeight: fontWeights.bold,
//     textAlign: 'right',
//     marginBottom: spacing.xs,
//   },
//   finalPriceText: {
//     textAlign: 'right',
//     marginTop: 2,
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: spacing.lg,
//     fontSize: fontSizes.md,
//   },
// });
const styles = StyleSheet.create({
  inputBox: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    textAlign: 'right',
  },

  loadingContainer: {
    padding: spacing.lg,
  },

  productTitle: {
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    fontSize: fontSizes.md,
  },
  productSubtitle: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: fontSizes.sm,
  },

  headerBlock: {
    marginBottom: spacing.lg,
  },

  finalPriceTitle: {
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  finalPriceText: {
    textAlign: 'right',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: fontSizes.md,
  },

  helperText: {
    marginTop: spacing.sm,
    textAlign: 'right',
    fontSize: fontSizes.sm,
  },

  productCard: {
    marginTop: spacing.lg,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },

  screenTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginBottom: spacing.md,
  },

  label: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'right',
    fontSize: fontSizes.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  actionText: {
    fontWeight: '700',
    fontSize: 13,
  },

  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 10,
  },
});