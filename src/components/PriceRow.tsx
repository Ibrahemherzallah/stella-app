import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../theme/colors';
import type { GoldRate } from '../types';

interface PriceRowProps {
  rate: GoldRate;
}

export const PriceRow: React.FC<PriceRowProps> = ({ rate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{rate.label}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.value}>{rate.value.toLocaleString('ar-EG')}</Text>
        <Text style={styles.currency}>{rate.currency}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.darkText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.darkText,
    fontWeight: fontWeights.medium,
    flex: 1,
    textAlign: 'right',
    marginRight: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontSize: fontSizes.xl,
    color: colors.goldPrimary,
    fontWeight: fontWeights.bold,
  },
  currency: {
    fontSize: fontSizes.sm,
    color: colors.darkText,
    fontWeight: fontWeights.medium,
  },
});
