// src/components/GoldPriceCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { spacing, borderRadius, fontSizes, fontWeights } from '../theme/colors';
import { formatPrice } from '../theme/currency';

interface GoldPriceCardProps {
  title: string;
  priceWithoutMaking: number;
  priceWithMaking: number;
  pricePerLira: number;
}

export const GoldPriceCard: React.FC<GoldPriceCardProps> = ({
  title,
  priceWithoutMaking,
  priceWithMaking,
  pricePerLira,
}) => {
  const { theme } = useTheme();
  const { currency } = useCurrency();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, shadowColor: theme.darkText }]}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/gold1.jpg')}
          style={styles.image}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.darkText }]}>{title}</Text>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.lightText }]}>بدون مصنعية:</Text>
          <Text style={[styles.priceValue, { color: theme.goldPrimary }]}>
            {formatPrice(priceWithoutMaking, currency)}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.lightText }]}>مع المصنعية:</Text>
          <Text style={[styles.priceValue, { color: theme.goldPrimary }]}>
            {formatPrice(priceWithMaking, currency)}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.lightText }]}>سعر الليرة:</Text>
          <Text style={[styles.priceValue, { color: theme.goldPrimary }]}>
            {formatPrice(pricePerLira, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  content: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceLabel: {
    fontSize: fontSizes.sm,
    textAlign: 'right',
  },
  priceValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
});
