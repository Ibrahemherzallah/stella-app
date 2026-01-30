// src/components/OfferCard.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { spacing, borderRadius, fontSizes, fontWeights } from '../theme/colors';
import { formatPrice } from '../theme/currency';
import type { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const { theme } = useTheme();
  const { currency } = useCurrency();
  const [imageLoading, setImageLoading] = useState(true);

  const discountPercentage = Math.round(
    ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, shadowColor: theme.darkText }]}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.lightGray }]}>
            <ActivityIndicator size="small" color={theme.goldPrimary} />
          </View>
        )}
        <Image
          source={{ uri: offer.imageUrl }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        <View style={[styles.badge, { backgroundColor: theme.goldPrimary }]}>
          <Text style={[styles.badgeText, { color: theme.white }]}>-{discountPercentage}%</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.darkText }]} numberOfLines={2}>
          {offer.name}
        </Text>
        <Text style={[styles.karat, { color: theme.lightText }]}>عيار {offer.karat}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.originalPrice, { color: theme.lightText }]}>
            {formatPrice(offer.originalPrice, currency)}
          </Text>
          <Text style={[styles.discountedPrice, { color: theme.goldPrimary }]}>
            {formatPrice(offer.discountedPrice, currency)}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  karat: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  originalPrice: {
    fontSize: fontSizes.sm,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
});
