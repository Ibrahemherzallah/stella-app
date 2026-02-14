// src/screens/admin/AddProductScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity,ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ErrorMessage } from '../../components/ErrorMessage';
import { useTheme } from '../../context/ThemeContext';
import { createProduct, updateProduct } from '../../services/api';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import type { AdminProduct } from '../../types';
import { Camera } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context'

export const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const editProduct = (route.params as any)?.product as AdminProduct | undefined;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [karat, setKarat] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description || '');
      setKarat(editProduct.karat);
      setOriginalPrice(editProduct.originalPrice.toString());
      setDiscountedPrice(editProduct.discountedPrice.toString());
      setImageUri(editProduct.imageUri || '');
      setImageUrl(editProduct.imageUrl || '');
      setIsActive(editProduct.isActive);
    }
  }, [editProduct]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى معرض الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageUrl('');
    }
  };

  const handleSave = async () => {
    if (!name || !karat || !originalPrice || !discountedPrice) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (!imageUri && !imageUrl) {
      setError('الرجاء اختيار صورة المنتج');
      return;
    }

    const product: AdminProduct = {
      name,
      description,
      karat,
      originalPrice: parseFloat(originalPrice),
      discountedPrice: parseFloat(discountedPrice),
      imageUri,
      imageUrl,
      isActive,
    };

    try {
      setError(null);
      setLoading(true);

      if (editProduct?.id) {
        await updateProduct(editProduct.id, product);
        Alert.alert('نجح', 'تم تحديث المنتج بنجاح');
      } else {
        await createProduct(product);
        Alert.alert('نجح', 'تم إضافة المنتج بنجاح');
      }

      navigation.goBack();
    } catch (err) {
      setError('حدث خطأ أثناء حفظ المنتج');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getImageSource = () => {
    if (imageUri) {
      return { uri: imageUri };
    }
    if (imageUrl) {
      return { uri: imageUrl };
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: `${theme.background}`}}>
      <ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.darkText }]}>
            {editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </Text>
        </View>

        {error && <ErrorMessage message={error} />}

        <View style={styles.form}>
          <View style={styles.imageSection}>
            <Text style={[styles.label, { color: theme.darkText }]}>صورة المنتج *</Text>
            <TouchableOpacity
              style={[styles.imagePickerButton, { backgroundColor: theme.surface, borderColor: theme.lightGray }]}
              onPress={pickImage}
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.darkText }]}>اسم المنتج *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.darkText,
                  borderColor: theme.lightGray,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="مثال: خاتم ذهب أنيق"
              placeholderTextColor={theme.lightText}
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.darkText }]}>الوصف</Text>
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
              value={description}
              onChangeText={setDescription}
              placeholder="وصف المنتج"
              placeholderTextColor={theme.lightText}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.darkText }]}>العيار *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.darkText,
                  borderColor: theme.lightGray,
                },
              ]}
              value={karat}
              onChangeText={setKarat}
              placeholder="مثال: 21"
              placeholderTextColor={theme.lightText}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.darkText }]}>السعر الأصلي (USD) *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.darkText,
                  borderColor: theme.lightGray,
                },
              ]}
              value={originalPrice}
              onChangeText={setOriginalPrice}
              placeholder="مثال: 450"
              placeholderTextColor={theme.lightText}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.darkText }]}>السعر بعد الخصم (USD) *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  color: theme.darkText,
                  borderColor: theme.lightGray,
                },
              ]}
              value={discountedPrice}
              onChangeText={setDiscountedPrice}
              placeholder="مثال: 380"
              placeholderTextColor={theme.lightText}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          <View style={[styles.switchContainer, { backgroundColor: theme.surface }]}>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: theme.lightGray, true: theme.goldPrimary }}
              thumbColor={theme.white}
            />
            <Text style={[styles.switchLabel, { color: theme.darkText }]}>المنتج نشط</Text>
          </View>

          <PrimaryButton
            title={editProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            onPress={handleSave}
            loading={loading}
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
  form: {
    gap: spacing.md,
  },
  imageSection: {
    gap: spacing.sm,
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
