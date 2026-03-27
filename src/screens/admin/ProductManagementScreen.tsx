import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, RefreshControl, } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Trash2, Plus } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { formatPrice } from '../../theme/currency';

import { listProducts, deleteProductDoc, ProductDoc, } from '../../services/firestoreProducts';

export const ProductManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { currency } = useCurrency();

  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      setError(null);

      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);

      const data = await listProducts();
      setProducts(data);
    } catch (err) {
      console.error('fetchProducts error:', err);
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      if (mode === 'initial') setLoading(false);
      if (mode === 'refresh') setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts('initial');
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts('refresh');
    }, [])
  );

  const handleAddProduct = () => {
    navigation.navigate('AddProduct' as never);
  };

  const handleEditProduct = (product: ProductDoc) => {
    navigation.navigate('AddProduct' as never, { productId: product.id } as never);
  };

  const handleDelete = (product: ProductDoc) => {
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
              setDeletingId(product.id);
              await deleteProductDoc(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err) {
              console.error('deleteProduct error:', err);
              Alert.alert('خطأ', 'فشل حذف المنتج');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const getImageSource = (product: ProductDoc) => {
    if (product.imageUrl?.trim()) {
      return { uri: product.imageUrl };
    }

    return require('../../../assets/images/icon.png');
  };

  const getOriginalPrice = (product: ProductDoc) => product.originalPriceIls ?? 0;

  const getDiscountedPrice = (product: ProductDoc) =>
    product.discountedPriceIls ?? product.originalPriceIls ?? 0;

  const renderProduct = ({ item }: { item: ProductDoc }) => {
    const isDeleting = deletingId === item.id;

    return (
      <View
        style={[
          styles.productCard,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.darkText,
          },
        ]}
      >
        <View style={[styles.imageContainer, { backgroundColor: theme.lightGray }]}>
          <Image source={getImageSource(item)} style={styles.productImage} />
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.darkText }]} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.metaBadge,
                { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.metaBadgeText, { color: theme.darkText }]}>
                {item.weightGrams ?? 0} غ
              </Text>
            </View>

            <View
              style={[
                styles.metaBadge,
                { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.metaBadgeText, { color: theme.darkText }]}>
                عيار {item.karat || '-'}
              </Text>
            </View>
          </View>

          {!!item.description ? (
            <Text
              style={[styles.productDescription, { color: theme.lightText }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}

          <View
            style={[
              styles.priceBox,
              { backgroundColor: theme.background },
            ]}
          >
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.lightText }]}>
                السعر الأصلي
              </Text>
              <Text style={[styles.oldPriceValue, { color: theme.lightText }]}>
                ₪ {item.originalPriceIls}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.lightText }]}>
                سعر العرض
              </Text>
              <Text style={[styles.newPriceValue, { color: theme.goldPrimary }]}>
                ₪ {item.discountedPriceIls}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.isActive
                  ? 'rgba(46, 125, 50, 0.12)'
                  : 'rgba(198, 40, 40, 0.12)',
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: item.isActive ? theme.success : theme.error },
              ]}
            >
              {item.isActive ? 'نشط' : 'غير نشط'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.goldPrimary }]}
            onPress={() => handleEditProduct(item)}
            activeOpacity={0.85}
          >
            <Pencil size={18} color={theme.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              {
                backgroundColor: isDeleting ? theme.lightText : theme.error,
                opacity: isDeleting ? 0.7 : 1,
              },
            ]}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}
            activeOpacity={0.85}
          >
            <Trash2 size={18} color={theme.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <ThemeToggle />
          <Text style={[styles.title, { color: theme.darkText }]}>إدارة المنتجات</Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <PrimaryButton
          title="إضافة منتج جديد"
          onPress={handleAddProduct}
          style={styles.addButton}
        />

        {products.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.lightGray,
              },
            ]}
          >
            <Plus size={28} color={theme.goldPrimary} />
            <Text style={[styles.emptyTitle, { color: theme.darkText }]}>
              لا توجد منتجات حالياً
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.lightText }]}>
              ابدأ بإضافة أول منتج ليظهر هنا
            </Text>

            <PrimaryButton
              title="إضافة أول منتج"
              onPress={handleAddProduct}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchProducts('refresh')}
              />
            }
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  addButton: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },

  productCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  imageContainer: {
    width: 92,
    height: 92,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  productInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },

  productName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },

  metaRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },

  productDescription: {
    fontSize: fontSizes.sm,
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },

  priceBox: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  oldPriceValue: {
    fontSize: fontSizes.sm,
    textDecorationLine: 'line-through',
  },
  newPriceValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },

  statusBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 2,
  },
  statusBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },

  actions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: spacing.xs,
    minHeight: 92,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  emptyCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: spacing.xs,
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
    minWidth: 180,
  },
});