import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fontWeights } from '../theme/colors';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { listActiveRegularProducts, RegularProductDoc } from '../services/firestoreProducts';
import { RegularProductCard } from '../components/RegularProductCard';

export const ProductsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState<RegularProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await listActiveRegularProducts();
      setProducts(data);
    } catch (err) {
      console.error('fetchData error:', err); // ← add this to see the real error
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.darkText }]}>المنتجات</Text>
          <Text style={[styles.subtitle, { color: theme.lightText }]}>
            تصفح مجموعتنا من المجوهرات
          </Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        {products.length === 0 ? (
          <EmptyState message="لا توجد منتجات متاحة حالياً" icon="💍" />
        ) : (
          <FlatList
            data={products}
            renderItem={({ item }) => <RegularProductCard product={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchData}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, textAlign: 'center' },
  subtitle: { fontSize: fontSizes.md, textAlign: 'center' },
  row: { justifyContent: 'space-between', gap: spacing.md },
  listContent: { paddingBottom: spacing.lg },
});