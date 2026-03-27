import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CurrencyCode, CurrencyRates, formatPrice } from '../theme/currency';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';

interface GoldPriceCardProps {
  title: string;
  basePriceUsd: number;
  imageUrl?: string;
  rates: CurrencyRates;
}

const CURRENCY_ROWS: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: 'بالدولار:' },
  { code: 'JOD', label: 'بالدينار الأردني:' },
  { code: 'ILS', label: 'بالشيكل:' },
];

export const GoldPriceCard: React.FC<GoldPriceCardProps> = ({ title, basePriceUsd, imageUrl, rates, }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, shadowColor: theme.darkText },]}>
      <View style={styles.imageContainer}>
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require('../../assets/images/gold1.jpg')
          }
          style={styles.image}
          // resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.darkText }]} numberOfLines={2}>
          {title}
        </Text>

        {CURRENCY_ROWS.map((row) => (
          <View style={styles.priceRow} key={row.code}>
            <Text style={[styles.priceLabel, { color: theme.lightText }]}>
              {row.label}
            </Text>
            <Text style={[styles.priceValue, { color: theme.goldPrimary }]}>
              {formatPrice(basePriceUsd, row.code, rates)}
            </Text>
          </View>
        ))}
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