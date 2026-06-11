import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';

import {
  createRegularProduct,
  updateRegularProduct,
  getRegularProductById,
} from '../../services/firestoreProducts';
import { uploadProductImage } from '../../services/storageProducts';

type RouteParams = {
  productId?: string;
};

const sanitizeDecimal = (value: string) => {
  let v = value.replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
  }
  return v;
};

const parseNum = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export const AddRegularProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();

  const { productId } = (route.params as RouteParams) || {};
  const isEdit = useMemo(() => !!productId, [productId]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [karat, setKarat] = useState('');
  const [showKaratDropdown, setShowKaratDropdown] = useState(false);
  const [weightGrams, setWeightGrams] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadProduct = async (id: string) => {
    try {
      setInitialLoading(true);
      setError(null);

      const product = await getRegularProductById(id);

      setName(product.name ?? '');
      setDescription(product.description ?? '');
      setKarat(String(product.karat ?? ''));
      setWeightGrams(String(product.weightGrams ?? ''));
      setPrice(String(product.priceIls ?? ''));
      setImageUrl(product.imageUrl ?? '');
      setImageUri('');
      setIsActive(product.isActive ?? true);
    } catch (err) {
      console.error('loadProduct error:', err);
      setError('فشل تحميل بيانات المنتج');
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى معرض الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('pickImage error:', err);
      Alert.alert('خطأ', 'تعذر اختيار الصورة');
    }
  };

  const handleSave = async () => {
    if (
      !name.trim() ||
      !karat.trim() ||
      !weightGrams.trim() ||
      !price.trim()
    ) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (!imageUri && !imageUrl) {
      setError('الرجاء اختيار صورة المنتج');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      let finalImageUrl = imageUrl;
      if (imageUri) {
        finalImageUrl = await uploadProductImage(imageUri);
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        karat: karat.trim(),
        weightGrams: parseNum(weightGrams),
        priceIls: parseNum(price),
        imageUrl: finalImageUrl,
        isActive,
      };

      if (isEdit && productId) {
        await updateRegularProduct(productId, payload);
        Alert.alert('نجح', 'تم تحديث المنتج بنجاح');
      } else {
        await createRegularProduct(payload);
        Alert.alert('نجح', 'تم إضافة المنتج بنجاح');
      }

      navigation.goBack();
    } catch (err) {
      console.error('handleSave error:', err);
      setError('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const getImageSource = () => {
    if (imageUri) return { uri: imageUri };
    if (imageUrl) return { uri: imageUrl };
    return null;
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.darkText }}>جارٍ تحميل بيانات المنتج...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.darkText }]}>
              {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </Text>
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.form}>

            {/* Image Picker */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.darkText }]}>صورة المنتج *</Text>
              <TouchableOpacity
                style={[
                  styles.imagePickerButton,
                  { backgroundColor: theme.surface, borderColor: theme.lightGray },
                ]}
                onPress={pickImage}
                activeOpacity={0.85}
              >
                {getImageSource() ? (
                  <Image source={getImageSource()!} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Camera size={40} color={theme.lightText} />
                    <Text style={[styles.imagePlaceholderText, { color: theme.lightText }]}>
                      اختيار صورة من الجهاز
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.darkText }]}>اسم المنتج *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.darkText, borderColor: theme.lightGray }]}
                value={name}
                onChangeText={setName}
                placeholder="مثال: خاتم ذهب أنيق"
                placeholderTextColor={theme.lightText}
                textAlign="right"
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.darkText }]}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.darkText, borderColor: theme.lightGray }]}
                value={description}
                onChangeText={setDescription}
                placeholder="وصف المنتج (اختياري)"
                placeholderTextColor={theme.lightText}
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>

            {/* Karat Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.darkText }]}>العيار *</Text>
              <TouchableOpacity
                onPress={() => setShowKaratDropdown(!showKaratDropdown)}
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.lightGray, justifyContent: 'center' }]}
              >
                <Text style={{ color: karat ? theme.darkText : theme.lightText, textAlign: 'right' }}>
                  {karat || 'اختر العيار'}
                </Text>
              </TouchableOpacity>

              {showKaratDropdown && (
                <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.lightGray }]}>
                  {['18', '21', '22', '24'].map((k, index, arr) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => { setKarat(k); setShowKaratDropdown(false); }}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: theme.lightGray, borderBottomWidth: index < arr.length - 1 ? 1 : 0 },
                      ]}
                    >
                      <Text style={{ color: theme.darkText, textAlign: 'right' }}>{k}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Weight */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.darkText }]}>الوزن (غرام) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.darkText, borderColor: theme.lightGray }]}
                value={weightGrams}
                onChangeText={(v) => setWeightGrams(sanitizeDecimal(v))}
                placeholder="مثال: 3.5"
                placeholderTextColor={theme.lightText}
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>

            {/* Price */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.darkText }]}>السعر (ILS) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.darkText, borderColor: theme.lightGray }]}
                value={price}
                onChangeText={(v) => setPrice(sanitizeDecimal(v))}
                placeholder="مثال: 4500"
                placeholderTextColor={theme.lightText}
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>

            {/* Active Switch */}
            <View style={[styles.switchContainer, { backgroundColor: theme.surface }]}>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: theme.lightGray, true: theme.goldPrimary }}
                thumbColor={theme.white}
              />
              <Text style={[styles.switchLabel, { color: theme.darkText }]}>
                المنتج نشط
              </Text>
            </View>

            <PrimaryButton
              title={
                loading
                  ? isEdit ? 'جارٍ حفظ التعديلات...' : 'جارٍ إضافة المنتج...'
                  : isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'
              }
              onPress={handleSave}
              disabled={loading}
              style={styles.button}
            />

            <PrimaryButton
              title="إلغاء"
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
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
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: spacing.md,
  },
  imagePickerButton: {
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  switchLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  button: {
    marginTop: spacing.md,
  },
});
