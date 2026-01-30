// src/screens/admin/ProductManagementScreen.tsx
import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getAdminProducts, deleteProduct } from '../../services/api';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/colors';
import { formatPrice } from '../../theme/currency';
import type { AdminProduct } from '../../types';
import { Pencil, Trash2 } from 'lucide-react-native';

export const ProductManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { currency } = useCurrency();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل المنتجات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'حذف المنتج',
      `هل أنت متأكد من حذف "${name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              setProducts((prev) => prev.filter((p) => p.id !== id));
            } catch (err) {
              Alert.alert('خطأ', 'فشل حذف المنتج');
            }
          },
        },
      ]
    );
  };

  const getImageSource = (product: AdminProduct) => {
    if (product.imageUri) {
      return { uri: product.imageUri };
    }
    if (product.imageUrl) {
      return { uri: product.imageUrl };
    }
    return require('../../../assets/images/icon.png');
  };

  const renderProduct = ({ item }: { item: AdminProduct }) => (
    <View style={[styles.productCard, { backgroundColor: theme.surface, shadowColor: theme.darkText }]}>
      <View style={[styles.imageContainer, { backgroundColor: theme.lightGray }]}>
        <Image source={getImageSource(item)} style={styles.productImage} />
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.darkText }]}>{item.name}</Text>
        <Text style={[styles.productDetails, { color: theme.lightText }]}>
          عيار {item.karat}
        </Text>
        <Text style={[styles.productPrice, { color: theme.goldPrimary }]}>
          {formatPrice(item.originalPrice, currency)} → {formatPrice(item.discountedPrice, currency)}
        </Text>
        <Text style={[styles.productStatus, { color: item.isActive ? theme.success : theme.error }]}>
          {item.isActive ? '✓ نشط' : '✗ غير نشط'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.goldPrimary }]}
          onPress={() =>
            navigation.navigate('AddProduct' as never, { product: item } as never)
          }
        >
          <Pencil size={18} color={theme.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.error }]}
          onPress={() => handleDelete(item.id!, item.name)}
        >
          <Trash2 size={18} color={theme.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.darkText }]}>إدارة المنتجات</Text>
        </View>

        {error && <ErrorMessage message={error} />}

        <PrimaryButton
          title="إضافة منتج جديد"
          onPress={() => navigation.navigate('AddProduct' as never)}
          style={styles.addButton}
        />

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
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
  addButton: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  productCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
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
    marginRight: spacing.md,
  },
  productName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  productDetails: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  productPrice: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  productStatus: {
    fontSize: fontSizes.sm,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
