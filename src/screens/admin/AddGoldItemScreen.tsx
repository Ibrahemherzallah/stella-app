import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/colors';
import { PrimaryButton } from '../../components/PrimaryButton';

import {
  createItem,
  updateItem,
  uploadItemImage,
  getItemById, // ✅ you must add this in services
} from '../../services/firestoreGold';

type RouteParams = {
  itemId?: string;
};

const sanitizeDecimal = (value: string) => {
  let v = value.replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
  }
  return v;
};

export const AddGoldItemScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const { itemId } = (route.params || {}) as RouteParams;

  const isEdit = useMemo(() => !!itemId, [itemId]);

  const [title, setTitle] = useState('');
  const [weightGrams, setWeightGrams] = useState('1');
  const [makingFee, setMakingFee] = useState('0');
  const [type, setType] = useState<'sell' | 'buy'>('sell');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(undefined);
  const [karat, setKarat] = useState<'21' | '24'>('21');
  const [showKaratDropdown, setShowKaratDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);

  // ✅ load item when editing
  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) return;

      try {
        setLoadingItem(true);
        const item = await getItemById(itemId);
        console.log("The ite m is: ", item)
        setTitle(item.title ?? '');
        setWeightGrams(String(item.weightGrams ?? ''));
        setMakingFee(String(item.makingFeePerGramUsd ?? 0));
        setKarat(item.karat === '24' ? '24' : '21');
        setType(item.karat === '24' ? 'buy' : item.type === 'buy' ? 'buy' : 'sell');
        setExistingImageUrl(item.imageUrl);
        setLocalImageUri(null);
      } catch (e) {
        console.error(e);
        Alert.alert('خطأ', 'فشل تحميل بيانات الصنف');
      } finally {
        setLoadingItem(false);
      }
    };

    loadItem();
  }, [itemId]);

  useEffect(() => {
    if (karat === '24') {
      setType('buy');
      setShowTypeDropdown(false);
    }
  }, [karat]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('صلاحيات', 'الرجاء السماح للوصول للصور');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!res.canceled) {
      setLocalImageUri(res.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم الصنف');
      return;
    }

    try {
      setSaving(true);

      let finalImageUrl = existingImageUrl;
      if (localImageUri) {
        finalImageUrl = await uploadItemImage(localImageUri);
      }

      const payload = {
        title: title.trim(),
        weightGrams: parseFloat(sanitizeDecimal(weightGrams)) || 0,
        makingFeePerGramUsd: parseFloat(sanitizeDecimal(makingFee)) || 0,
        imageUrl: finalImageUrl,
        karat,
        type: karat === '24' ? 'buy' : type,
        isActive: true,
      };

      if (isEdit && itemId) {
        await updateItem(itemId, payload);
        Alert.alert('تم', 'تم تعديل الصنف بنجاح');
      } else {
        await createItem(payload);
        Alert.alert('تم', 'تم إضافة الصنف بنجاح');

        setTitle('');
        setWeightGrams('1');
        setMakingFee('0');
        setType('sell');
        setLocalImageUri(null);
        setExistingImageUrl(undefined);
      }

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', isEdit ? 'فشل تعديل الصنف' : 'فشل إضافة الصنف');
    } finally {
      setSaving(false);
    }
  };

  const previewUri = localImageUri || existingImageUrl;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: spacing.md }}>
          <Text style={{ color: theme.darkText, fontSize: 22, fontWeight: '700', textAlign: 'right' }}>
            {isEdit ? 'تعديل الصنف' : 'إضافة صنف جديد'}
          </Text>

          {loadingItem ? (
            <Text style={{ marginTop: spacing.md, color: theme.darkText, textAlign: 'right' }}>
              جاري تحميل بيانات الصنف...
            </Text>
          ) : null}

          <Text style={{ marginTop: spacing.lg, color: theme.darkText, textAlign: 'right' }}>اسم الصنف</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={{
              borderWidth: 1,
              borderColor: theme.lightGray,
              padding: 12,
              borderRadius: 10,
              color: theme.darkText,
              marginTop: 6,
              textAlign: 'right',
            }}
          />

          <Text style={{ marginTop: spacing.md, color: theme.darkText, textAlign: 'right' }}>الوزن (غرام)</Text>
          <TextInput
            value={weightGrams}
            onChangeText={(v) => setWeightGrams(sanitizeDecimal(v))}
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: theme.lightGray,
              padding: 12,
              borderRadius: 10,
              color: theme.darkText,
              marginTop: 6,
              textAlign: 'right',
            }}
          />

          <Text style={{ marginTop: spacing.md, color: theme.darkText, textAlign: 'right' }}>
            المصنعية لكل غرام (JOD)
          </Text>
          <TextInput
            value={makingFee}
            onChangeText={(v) => setMakingFee(sanitizeDecimal(v))}
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: theme.lightGray,
              padding: 12,
              borderRadius: 10,
              color: theme.darkText,
              marginTop: 6,
              textAlign: 'right',
            }}
          />
          <Text
            style={{
              marginTop: spacing.md,
              color: theme.darkText,
              textAlign: 'right',
            }}
          >
            العيار
          </Text>

          <View style={{ marginTop: 6 }}>
            <TouchableOpacity
              onPress={() => setShowKaratDropdown(!showKaratDropdown)}
              style={{
                borderWidth: 1,
                borderColor: theme.lightGray,
                borderRadius: 10,
                padding: 14,
                backgroundColor: theme.surface,
              }}
            >
              <Text style={{ color: theme.darkText, textAlign: 'right' }}>
                {karat === '24' ? '24' : '21'}
              </Text>
            </TouchableOpacity>

            {showKaratDropdown && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: theme.lightGray,
                  borderRadius: 10,
                  marginTop: 6,
                  backgroundColor: theme.surface,
                  overflow: 'hidden',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setKarat('21');
                    setShowKaratDropdown(false);
                  }}
                  style={{
                    padding: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.lightGray,
                  }}
                >
                  <Text style={{ color: theme.darkText, textAlign: 'right' }}>21</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setKarat('24');
                    setShowKaratDropdown(false);
                  }}
                  style={{
                    padding: 14,
                  }}
                >
                  <Text style={{ color: theme.darkText, textAlign: 'right' }}>24</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {karat === '21' ? (
            <>
              <Text
                style={{
                  marginTop: spacing.md,
                  color: theme.darkText,
                  textAlign: 'right',
                }}
              >
                النوع
              </Text>

              <View style={{ marginTop: 6 }}>
                <TouchableOpacity
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.lightGray,
                    borderRadius: 10,
                    padding: 14,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Text style={{ color: theme.darkText, textAlign: 'right' }}>
                    {type === 'sell' ? 'بيع' : 'شراء'}
                  </Text>
                </TouchableOpacity>

                {showTypeDropdown && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.lightGray,
                      borderRadius: 10,
                      marginTop: 6,
                      backgroundColor: theme.surface,
                      overflow: 'hidden',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setType('sell');
                        setShowTypeDropdown(false);
                      }}
                      style={{
                        padding: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.lightGray,
                      }}
                    >
                      <Text style={{ color: theme.darkText, textAlign: 'right' }}>بيع</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setType('buy');
                        setShowTypeDropdown(false);
                      }}
                      style={{
                        padding: 14,
                      }}
                    >
                      <Text style={{ color: theme.darkText, textAlign: 'right' }}>شراء</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : null}

          <TouchableOpacity
            onPress={pickImage}
            style={{
              marginTop: spacing.lg,
              borderWidth: 1,
              borderColor: theme.lightGray,
              padding: 12,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: theme.surface,
            }}
          >
            <Text style={{ color: theme.darkText }}>
              {previewUri ? 'تغيير الصورة' : 'اختيار صورة'}
            </Text>
          </TouchableOpacity>

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{ width: '100%', height: 220, borderRadius: 14, marginTop: spacing.md }}
            />
          ) : null}

          <View style={{ marginTop: spacing.xl }}>
            <PrimaryButton
              title={saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديل' : 'حفظ الصنف'}
              onPress={handleSave}
              disabled={saving || loadingItem}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};