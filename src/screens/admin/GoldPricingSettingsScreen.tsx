import React, { useEffect,useCallback, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { PrimaryButton } from '../../components/PrimaryButton';
import { getTodaySettings, saveTodaySettings, listItems, updateItem, deleteItem,GoldItem } from '../../services/goldSettingsService';
import { useFocusEffect, useRoute } from '@react-navigation/native';


type GoldPricingSettingsForm = {
  goldOunceUsd: string;
  premiumSellOunceUsd: string;
  premiumBuyOunceUsd: string;
  usdToIls: string;
  usdToJod: string;
};

type ProductFeeForm = Record<string, string>;

const EMPTY_SETTINGS: GoldPricingSettingsForm = {
  goldOunceUsd: '',
  premiumSellOunceUsd: '',
  premiumBuyOunceUsd: '',
  usdToIls: '',
  usdToJod: '',
};

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
  const route = useRoute();
  const [settings, setSettings] = useState<GoldPricingSettingsForm>(EMPTY_SETTINGS);
  const [products, setProducts] = useState<GoldItem[]>([]);
  const [productFees, setProductFees] = useState<ProductFeeForm>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [premiumSellMode, setPremiumSellMode] = useState<'increase' | 'decrease'>('increase');
  const [premiumBuyMode, setPremiumBuyMode] = useState<'increase' | 'decrease'>('increase');

  const loadAll = async () => {
    try {
      setInitialLoading(true);

      const [savedSettings, items] = await Promise.all([
        getTodaySettings(),
        listItems(),
      ]);

      if (savedSettings) {
        const premiumSellValue = Number(savedSettings.premiumSellOunceUsd ?? 0);
        const premiumBuyValue = Number(savedSettings.premiumBuyOunceUsd ?? 0);

        setSettings({
          goldOunceUsd: String(savedSettings.goldOunceUsd ?? ''),
          premiumSellOunceUsd: String(Math.abs(premiumSellValue)),
          premiumBuyOunceUsd: String(Math.abs(premiumBuyValue)),
          usdToIls: String(savedSettings.usdToIls ?? ''),
          usdToJod: String(savedSettings.usdToJod ?? ''),
        });

        setPremiumSellMode(premiumSellValue < 0 ? 'decrease' : 'increase');
        setPremiumBuyMode(premiumBuyValue < 0 ? 'decrease' : 'increase');
      } else {
        setSettings(EMPTY_SETTINGS);
        setPremiumSellMode('increase');
        setPremiumBuyMode('increase');
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
  console.log("the products is : ", products);
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

  const premiumSellRawNum = useMemo(
    () => parseNum(settings.premiumSellOunceUsd),
    [settings.premiumSellOunceUsd]
  );

  const premiumBuyRawNum = useMemo(
    () => parseNum(settings.premiumBuyOunceUsd),
    [settings.premiumBuyOunceUsd]
  );

  const premiumSellOunceUsdNum = useMemo(
    () => (premiumSellMode === 'decrease' ? -premiumSellRawNum : premiumSellRawNum),
    [premiumSellRawNum, premiumSellMode]
  );

  const premiumBuyOunceUsdNum = useMemo(
    () => (premiumBuyMode === 'decrease' ? -premiumBuyRawNum : premiumBuyRawNum),
    [premiumBuyRawNum, premiumBuyMode]
  );

  const usdToIlsNum = useMemo(
    () => parseNum(settings.usdToIls),
    [settings.usdToIls]
  );

  const usdToJodNum = useMemo(
    () => parseNum(settings.usdToJod),
    [settings.usdToJod]
  );

  const { finalSellOunceUsd, finalBuyOunceUsd, baseGramUsdSell, baseGramUsdBuy, baseGramUsdBuy24,baseGramUsdBuy22, finalBuyOunceUsd24 } = useMemo(() => {
    const finalSellOunce = goldOunceUsdNum + premiumSellOunceUsdNum;

    const finalBuyOunce = goldOunceUsdNum + premiumBuyOunceUsdNum;


    const finalBuyOunce24 = goldOunceUsdNum + premiumBuyOunceUsdNum;


    const baseGramSell = finalSellOunce > 0 ? (finalSellOunce / 31.1) * 0.87 : 0;
    const baseGramBuy = finalBuyOunce > 0 ? (finalBuyOunce / 31.1) * 0.885 : 0;
    const baseGramBuy24 = finalBuyOunce > 0 ? (finalBuyOunce / 31.1) : 0;
    const baseGramBuy22 = finalBuyOunce > 0 ? (finalBuyOunce / 31.1) * 0.920 : 0;

    return {
      finalSellOunceUsd: finalSellOunce,
      finalBuyOunceUsd: finalBuyOunce,
      finalBuyOunceUsd24: finalBuyOunce24,
      baseGramUsdSell: baseGramSell,
      baseGramUsdBuy: baseGramBuy,
      baseGramUsdBuy24: baseGramBuy24,
      baseGramUsdBuy22: baseGramBuy22
    };
  }, [goldOunceUsdNum, premiumSellOunceUsdNum, premiumBuyOunceUsdNum]);


  const handleSave = async () => {
    const goldValue = parseFloat(settings.goldOunceUsd);
    const premiumSellValue = parseFloat(settings.premiumSellOunceUsd);
    const premiumBuyValue = parseFloat(settings.premiumBuyOunceUsd);
    const ilsValue = parseFloat(settings.usdToIls);
    const jodValue = parseFloat(settings.usdToJod);

    if (
      isNaN(goldValue) ||
      isNaN(premiumSellValue) ||
      isNaN(premiumBuyValue) ||
      isNaN(ilsValue) ||
      isNaN(jodValue)
    ) {
      Alert.alert('خطأ', 'الرجاء إدخال أرقام صحيحة في جميع الحقول');
      return;
    }

    if (premiumSellValue < 0 || premiumSellValue > 1000) {
      Alert.alert('خطأ', 'قيمة Premium البيع يجب أن تكون بين 0 و 1000');
      return;
    }

    if (premiumBuyValue < 0 || premiumBuyValue > 1000) {
      Alert.alert('خطأ', 'قيمة Premium الشراء يجب أن تكون بين 0 و 1000');
      return;
    }

    const signedPremiumSell =
      premiumSellMode === 'decrease' ? -premiumSellValue : premiumSellValue;
    console.log("signedPremiumSell is : " , signedPremiumSell)

    const signedPremiumBuy =
      premiumBuyMode === 'decrease' ? -premiumBuyValue : premiumBuyValue;
    console.log("signedPremiumBuy is : " , signedPremiumBuy)

    try {
      setLoading(true);

      await saveTodaySettings({
        goldOunceUsd: goldValue,
        premiumSellOunceUsd: signedPremiumSell,
        premiumBuyOunceUsd: signedPremiumBuy,
        usdToIls: ilsValue,
        usdToJod: jodValue,
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

  const toNumber = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };


  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

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

            <Text style={[styles.label, { color: theme.darkText, marginTop: 16 }]}>
              تعديل سعر البيع على الأونصة
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="decimal-pad"
              value={settings.premiumSellOunceUsd}
              onChangeText={(v) =>
                handleChangeField('premiumSellOunceUsd', sanitizeDecimal(v))
              }
              placeholder="مثال: 25"
              placeholderTextColor={theme.lightText}
            />

            <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setPremiumSellMode('increase')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor:
                    premiumSellMode === 'increase' ? theme.goldPrimary : theme.lightGray,
                  backgroundColor:
                    premiumSellMode === 'increase' ? theme.goldPrimary : theme.surface,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: premiumSellMode === 'increase' ? '#fff' : theme.darkText,
                    fontWeight: '600',
                  }}
                >
                  زيادة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPremiumSellMode('decrease')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor:
                    premiumSellMode === 'decrease' ? theme.goldPrimary : theme.lightGray,
                  backgroundColor:
                    premiumSellMode === 'decrease' ? theme.goldPrimary : theme.surface,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: premiumSellMode === 'decrease' ? '#fff' : theme.darkText,
                    fontWeight: '600',
                  }}
                >
                  نقصان
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: theme.lightText, fontSize: 12, textAlign: 'right', marginTop: 6 }}>
              أدخل قيمة تعديل سعر البيع ثم اختر هل هي زيادة أو نقصان
            </Text>

            <Text style={[styles.label, { color: theme.darkText, marginTop: 18 }]}>
              تعديل سعر الشراء على الأونصة
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="decimal-pad"
              value={settings.premiumBuyOunceUsd}
              onChangeText={(v) =>
                handleChangeField('premiumBuyOunceUsd', sanitizeDecimal(v))
              }
              placeholder="مثال: 25"
              placeholderTextColor={theme.lightText}
            />

            <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setPremiumBuyMode('increase')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor:
                    premiumBuyMode === 'increase' ? theme.goldPrimary : theme.lightGray,
                  backgroundColor:
                    premiumBuyMode === 'increase' ? theme.goldPrimary : theme.surface,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: premiumBuyMode === 'increase' ? '#fff' : theme.darkText,
                    fontWeight: '600',
                  }}
                >
                  زيادة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPremiumBuyMode('decrease')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor:
                    premiumBuyMode === 'decrease' ? theme.goldPrimary : theme.lightGray,
                  backgroundColor:
                    premiumBuyMode === 'decrease' ? theme.goldPrimary : theme.surface,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: premiumBuyMode === 'decrease' ? '#fff' : theme.darkText,
                    fontWeight: '600',
                  }}
                >
                  نقصان
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: theme.lightText, fontSize: 12, textAlign: 'right', marginTop: 6 }}>
              أدخل قيمة تعديل سعر الشراء ثم اختر هل هي زيادة أو نقصان
            </Text>
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
              {/*السعر النهائي للأونصة = {finalOunceUsd.toFixed(2)} $*/}
            </Text>
            <Text style={[styles.helperText, { color: theme.lightText }]}>
              سعر الغرام الأساسي بيع ≈ {baseGramUsdSell.toFixed(2)} $
            </Text>
            <Text style={[styles.helperText, { color: theme.lightText }]}>
              سعر الغرام الأساسي شراء≈ {baseGramUsdBuy.toFixed(2)} $
            </Text>
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: theme.goldPrimary }]}>
              كل الأصناف
            </Text>

            {products.map((product) => {
              const withJODMaking = product.makingFeePerGramUsd / toNumber(settings?.usdToJod);
              const finalGramUsd = product.type === "sell" ? baseGramUsdSell + (withJODMaking || 0) : baseGramUsdBuy + (withJODMaking || 0);
              const finalGramUsd24 = product.karat === "24" ? baseGramUsdBuy24 + (withJODMaking || 0) : 0;
              const finalGramUsd22 = product.karat === "22" ? baseGramUsdBuy22 + (withJODMaking || 0) : 0;
              const priceUsd = product.karat === "24" ? finalGramUsd24 * (product.weightGrams || 0) : product.karat === "22" ? finalGramUsd22 * (product.weightGrams || 0) : finalGramUsd * (product.weightGrams || 0);
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
                    المصنعية لكل غرام (JOD)
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