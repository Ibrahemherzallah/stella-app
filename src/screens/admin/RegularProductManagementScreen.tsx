import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSizes, fontWeights, borderRadius } from '../../theme/colors';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { PrimaryButton } from '../../components/PrimaryButton';

import {
  listAllRegularProducts,
  deleteRegularProduct,
  RegularProductDoc,
} from '../../services/firestoreProducts';

export const RegularProductManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [products, setProducts] = useState<RegularProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await listAllRegularProducts();
      setProducts(data);
    } catch (err) {
      console.error('fetchProducts error:', err);
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  // Refresh list every time screen comes into focus (after add/edit)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleDelete = (product: RegularProductDoc) => {
    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد أنك تريد حذف "${product.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRegularProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err) {
              console.error('deleteRegularProduct error:', err);
              Alert.alert('خطأ', 'فشل حذف المنتج');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (productId: string) => {
    // @ts-ignore
    navigation.navigate('AddRegularProduct', { productId });
  };

  const handleAdd = () => {
    // @ts-ignore
    navigation.navigate('AddRegularProduct');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.darkText }]}>إدارة المنتجات</Text>
          <Text style={[styles.subtitle, { color: theme.lightText }]}>
            {products.length} منتج مسجل
          </Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.goldPrimary }]}
          onPress={handleAdd}
          activeOpacity={0.85}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>إضافة منتج جديد</Text>
        </TouchableOpacity>

        {products.length === 0 ? (
          <EmptyState message="لا توجد منتجات. أضف منتجاً جديداً!" icon="💍" />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchProducts}
            refreshing={loading}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.lightGray,
                    opacity: item.isActive ? 1 : 0.55,
                  },
                ]}
              >
                {/* Image */}
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require('../../../assets/images/gold1.jpg')
                  }
                  style={styles.image}
                />

                {/* Info */}
                <View style={styles.info}>
                  <View style={styles.topRow}>
                    <View style={styles.badges}>
                      <View style={[styles.badge, { backgroundColor: theme.goldPrimary + '22' }]}>
                        <Text style={[styles.badgeText, { color: theme.goldPrimary }]}>
                          عيار {item.karat}
                        </Text>
                      </View>
                      {!item.isActive && (
                        <View style={[styles.badge, { backgroundColor: '#ff000022' }]}>
                          <Text style={[styles.badgeText, { color: '#b00020' }]}>
                            غير نشط
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[styles.productName, { color: theme.darkText }]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text style={[styles.meta, { color: theme.lightText }]}>
                    {item.weightGrams} غرام
                  </Text>

                  <Text style={[styles.price, { color: theme.goldPrimary }]}>
                    {item.priceIls.toLocaleString()} ₪
                  </Text>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.lightGray }]}
                      onPress={() => handleEdit(item.id)}
                      activeOpacity={0.85}
                    >
                      <Pencil size={14} color={theme.darkText} />
                      <Text style={[styles.actionText, { color: theme.darkText }]}>
                        تعديل
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#ffdddd' }]}
                      onPress={() => handleDelete(item)}
                      activeOpacity={0.85}
                    >
                      <Trash2 size={14} color="#b00020" />
                      <Text style={[styles.actionText, { color: '#b00020' }]}>
                        حذف
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: 110,
    height: 130,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  topRow: {
    alignItems: 'flex-end',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
  productName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginTop: 4,
  },
  meta: {
    fontSize: fontSizes.sm,
    textAlign: 'right',
    marginTop: 2,
  },
  price: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
});
