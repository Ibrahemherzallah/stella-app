import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  getTodaySettings,
  saveTodaySettings,
  listItems,
  updateItem,
  deleteItem, // ✅ make sure you export this from services/firestoreGold
} from '../../services/firestoreGold';

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
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, makingFeePerGramUsd: num } : p)));
  };

  const { finalOunceUsd, baseGramUsd } = useMemo(() => {
    const finalOunce = (settings.goldOunceUsd || 0) + (settings.premiumOunceUsd || 0);
    const baseGram = finalOunce / 31.1 || 0;
    return { finalOunceUsd: finalOunce, baseGramUsd: baseGram };
  }, [settings.goldOunceUsd, settings.premiumOunceUsd]);

  const handleSave = async () => {
    try {
      setLoading(true);

      // 1) Save global settings
      await saveTodaySettings(settings);

      // 2) Save each product's fee changes (only fee here)
      await Promise.all(
        products.map((p) => updateItem(p.id, { makingFeePerGramUsd: p.makingFeePerGramUsd }))
      );

      Alert.alert('تم الحفظ', 'تم حفظ الإعدادات والمنتجات بنجاح');
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (product: ProductConfig) => {
    Alert.alert('حذف الصنف', `هل أنت متأكد أنك تريد حذف "${product.title}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
          } catch (e) {
            console.error(e);
            Alert.alert('خطأ', 'فشل حذف الصنف');
          }
        },
      },
    ]);
  };

  const goToEdit = (productId: string) => {
    // ✅ You should have a screen named "EditGoldItem"
    // and it reads route params: { itemId }
    navigation.navigate('EditGoldItem' as never, { itemId: productId } as never);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={{ padding: spacing.md }}>
          <View style={{ marginBottom: spacing.lg }}>
            <ThemeToggle />
            <Text
              style={{
                color: theme.darkText,
                fontSize: fontSizes.xxl,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              إعدادات أسعار الذهب
            </Text>
          </View>

          {/* GLOBAL SETTINGS */}
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: theme.goldPrimary, fontSize: 18, fontWeight: '700' }}>
              إعدادات عامة
            </Text>

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>
              سعر الذهب في البورصة (أونصة / دولار)
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="numeric"
              value={String(settings.goldOunceUsd)}
              onChangeText={(v) => handleChangeField('goldOunceUsd', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>
              الزيادة على الأونصة (Premium)
            </Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="numeric"
              value={String(settings.premiumOunceUsd)}
              onChangeText={(v) => handleChangeField('premiumOunceUsd', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>USD → ILS</Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
              keyboardType="numeric"
              value={String(settings.usdToIls)}
              onChangeText={(v) => handleChangeField('usdToIls', v)}
            />

            <Text style={{ marginTop: spacing.md, color: theme.darkText }}>USD → JOD</Text>
            <TextInput
              style={[
                styles.inputBox,
                { borderColor: theme.lightGray, color: theme.darkText },
              ]}
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
            <Text style={{ color: theme.goldPrimary, fontSize: 18, fontWeight: '700' }}>
              المصنعية لكل صنف
            </Text>

            {products.map((product) => {
              const finalGramUsd = baseGramUsd + (product.makingFeePerGramUsd || 0);
              const priceUsd = finalGramUsd * (product.weightGrams || 0);
              const priceJod = priceUsd * (settings.usdToJod || 0);
              const priceIls = priceUsd * (settings.usdToIls || 0);

              return (
                <View
                  key={product.id}
                  style={[
                    styles.productCard,
                    { backgroundColor: theme.surface, borderColor: theme.lightGray },
                  ]}
                >
                  {/* Title + actions */}
                  <View style={styles.titleRow}>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={() => goToEdit(product.id)}
                        style={[styles.actionBtn, { backgroundColor: theme.lightGray }]}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.actionText, { color: theme.darkText }]}>تعديل</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteItem(product)}
                        style={[styles.actionBtn, { backgroundColor: '#ffdddd' }]}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.actionText, { color: '#b00020' }]}>حذف</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.darkText, fontWeight: '700', textAlign: 'right' }}>
                        {product.title}
                      </Text>
                      <Text style={{ color: theme.lightText, textAlign: 'right', marginTop: 4 }}>
                        الوزن: {product.weightGrams} غرام
                      </Text>
                    </View>
                  </View>

                  {/* ✅ Image */}
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={require('../../../assets/images/gold1.jpg')}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}

                  <Text style={{ color: theme.darkText, marginTop: spacing.md, textAlign: 'right' }}>
                    المصنعية لكل غرام (USD)
                  </Text>
                  <TextInput
                    style={[
                      styles.inputBox,
                      { borderColor: theme.lightGray, color: theme.darkText },
                    ]}
                    keyboardType="numeric"
                    value={String(product.makingFeePerGramUsd ?? 0)}
                    onChangeText={(v) => handleChangeProductFee(product.id, v)}
                  />

                  <View style={{ marginTop: spacing.md }}>
                    <Text style={{ color: theme.goldPrimary, fontWeight: '700', textAlign: 'right' }}>
                      السعر النهائي:
                    </Text>
                    <Text style={{ color: theme.darkText, textAlign: 'right' }}>
                      {priceUsd.toFixed(2)} $
                    </Text>
                    <Text style={{ color: theme.darkText, textAlign: 'right' }}>
                      {priceJod.toFixed(2)} JOD
                    </Text>
                    <Text style={{ color: theme.darkText, textAlign: 'right' }}>
                      {priceIls.toFixed(2)} ₪
                    </Text>
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
  inputBox: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    textAlign: 'right',
  },

  productCard: {
    marginTop: spacing.lg,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
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