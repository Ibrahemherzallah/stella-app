import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, fontSizes, fontWeights } from '../theme/colors';

interface Offer {
  id: string;
  name: string;
  karat: string;
  weightGrams: number;
  originalPriceIls: number;
  discountedPriceIls: number;
  imageUrl: string;
  isActive: boolean;
  soldOut?: boolean;
}

interface OfferCardProps {
  offer: Offer;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const { theme } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  console.log("offer is: ",offer)
  const isSoldOut = !!offer.soldOut;

  const discountPercentage = useMemo(() => {
    const original = Number(offer.originalPriceIls) || 0;
    const discounted = Number(offer.discountedPriceIls) || 0;

    if (original <= 0 || discounted >= original) return 0;
    return Math.round(((original - discounted) / original) * 100);
  }, [offer.originalPriceIls, offer.discountedPriceIls]);
  console.log("isSoldOut is : " , isSoldOut)
  return (
    <>
      <TouchableOpacity
        activeOpacity={isSoldOut ? 1 : 0.92}
        disabled={isSoldOut}
        onPress={() => setPreviewVisible(true)}
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.darkText,
            opacity: isSoldOut ? 0.88 : 1,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.lightGray },
              ]}
            >
              <ActivityIndicator size="small" color={theme.goldPrimary} />
            </View>
          )}

          <Image
            source={{ uri: offer.imageUrl }}
            style={[
              styles.image,
              isSoldOut ? styles.soldOutImage : null,
            ]}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />

          {isSoldOut ? (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutBadgeText}>نفدت الكمية</Text>
            </View>
          ) : discountPercentage > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.goldPrimary }]}>
              <Text style={[styles.badgeText, { color: theme.white }]}>
                %{discountPercentage}-
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: theme.darkText }]} numberOfLines={2}>
            {offer.name}
          </Text>

          <Text style={[styles.meta, { color: theme.lightText }]}>
            عيار {offer.karat} • {offer.weightGrams} غ
          </Text>

          <View style={[styles.priceBox, { backgroundColor: theme.background }]}>
            {isSoldOut ? (
              <View style={styles.soldOutPriceBox}>
                <Text style={styles.soldOutPriceText}>غير متوفر حالياً</Text>
              </View>
            ) : (
              <>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.lightText }]}>
                    السعر الأصلي
                  </Text>
                  <Text style={[styles.originalPrice, { color: theme.lightText }]}>
                    {offer.originalPriceIls} ₪
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: theme.lightText }]}>
                    سعر العرض
                  </Text>
                  <Text style={[styles.discountedPrice, { color: theme.goldPrimary }]}>
                    {offer.discountedPriceIls} ₪
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {!isSoldOut ? (
        <Modal
          visible={previewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setPreviewVisible(false)}
            />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
              onPress={() => setPreviewVisible(false)}
              activeOpacity={0.85}
            >
              <X size={22} color="#fff" />
            </TouchableOpacity>

            <ScrollView
              style={styles.zoomWrapper}
              contentContainerStyle={styles.zoomContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
              pinchGestureEnabled
              bouncesZoom={Platform.OS === 'ios'}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent
            >
              <Image
                source={{ uri: offer.imageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
  soldOutImage: {
    opacity: 0.5,
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
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
  },
  soldOutBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(217, 83, 79, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  soldOutBadgeText: {
    color: '#fff',
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
    minHeight: 42,
  },
  meta: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  priceBox: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
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
  originalPrice: {
    fontSize: fontSizes.sm,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  soldOutPriceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  soldOutPriceText: {
    color: '#D9534F',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  zoomWrapper: {
    width: '100%',
    height: '100%',
  },
  zoomContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});