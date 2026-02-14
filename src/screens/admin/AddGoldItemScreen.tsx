import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../../context/ThemeContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { spacing } from '../../theme/colors';
import { createItem, uploadItemImage } from '../../services/firestoreGold';

export const AddGoldItemScreen: React.FC = () => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [weightGrams, setWeightGrams] = useState('1');
  const [makingFee, setMakingFee] = useState('0');
  const [order, setOrder] = useState('0');

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('صلاحيات', 'الرجاء السماح للوصول للصور');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ works on older versions
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

      let imageUrl: string | undefined = undefined;
      if (localImageUri) {
        imageUrl = await uploadItemImage(localImageUri);
      }

      await createItem({
        title: title.trim(),
        weightGrams: parseFloat(weightGrams) || 0,
        makingFeePerGramUsd: parseFloat(makingFee) || 0,
        order: parseFloat(order) || 0,
        imageUrl,
        isActive: true,
      });

      Alert.alert('تم', 'تم إضافة الصنف بنجاح');
      setTitle('');
      setWeightGrams('1');
      setMakingFee('0');
      setOrder('0');
      setLocalImageUri(null);
    } catch (e) {
      console.error(e);
      Alert.alert('خطأ', 'فشل إضافة الصنف');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: spacing.md }}>
          <Text style={{ color: theme.darkText, fontSize: 22, fontWeight: '700', textAlign: 'right' }}>
            إضافة صنف جديد
          </Text>

          <Text style={{ marginTop: spacing.lg, color: theme.darkText, textAlign: 'right' }}>اسم الصنف</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
          />

          <Text style={{ marginTop: spacing.md, color: theme.darkText, textAlign: 'right' }}>الوزن (غرام)</Text>
          <TextInput
            value={weightGrams}
            onChangeText={setWeightGrams}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
          />

          <Text style={{ marginTop: spacing.md, color: theme.darkText, textAlign: 'right' }}>المصنعية لكل غرام (USD)</Text>
          <TextInput
            value={makingFee}
            onChangeText={setMakingFee}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
          />

          <Text style={{ marginTop: spacing.md, color: theme.darkText, textAlign: 'right' }}>الترتيب (Order)</Text>
          <TextInput
            value={order}
            onChangeText={setOrder}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: theme.lightGray, padding: 12, borderRadius: 10, color: theme.darkText, marginTop: 6 }}
          />

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
            <Text style={{ color: theme.darkText }}>اختيار صورة</Text>
          </TouchableOpacity>

          {localImageUri ? (
            <Image
              source={{ uri: localImageUri }}
              style={{ width: '100%', height: 220, borderRadius: 14, marginTop: spacing.md }}
            />
          ) : null}

          <View style={{ marginTop: spacing.xl }}>
            <PrimaryButton
              title={saving ? 'جاري الحفظ...' : 'حفظ الصنف'}
              onPress={handleSave}
              disabled={saving}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};