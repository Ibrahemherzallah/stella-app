// src/screens/OffersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Linking, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainer } from '../components/ScreenContainer';
import { OfferCard } from '../components/OfferCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';
import { Facebook, Instagram, MessageCircle } from 'lucide-react-native';

import { listActiveOffers, ProductDoc } from '../services/firestoreProducts';
import { getPublicSettings, PublicSettings } from '../services/goldSettingsService';

type Offer = {
  id: string;
  name: string;
  karat: string;
  weightGrams: number;
  originalPriceIls: number;
  discountedPriceIls: number;
  imageUrl: string;
  isActive: boolean;
};

export const OffersScreen: React.FC = () => {
  const { theme } = useTheme();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [products, settingsData] = await Promise.all([
        listActiveOffers(),
        getPublicSettings(),
      ]);
      console.log("products is : ", products)

      const mapped: Offer[] = products.map((p: ProductDoc) => ({
        id: p.id,
        name: p.name,
        karat: p.karat,
        weightGrams: p.weightGrams,
        originalPriceIls: p.originalPriceIls,
        discountedPriceIls: p.discountedPriceIls,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
      }));

      setOffers(mapped);
      setSettings(settingsData);
    } catch (err) {
      console.error('OffersScreen fetchData error:', err);
      setError('حدث خطأ أثناء تحميل العروض');
    } finally {
      setLoading(false);
    }
  };
  const openSocialMedia = async (url: string) => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) return;

      await Linking.openURL(url);
    } catch (err) {
      console.error('Error opening link:', err);
    }
  };

  const hasSocialLinks =
    !!settings?.socialMedia?.whatsapp ||
    !!settings?.socialMedia?.instagram ||
    !!settings?.socialMedia?.facebook;

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
          <Text style={[styles.title, { color: theme.darkText }]}>العروض الخاصة</Text>
          <Text style={[styles.subtitle, { color: theme.lightText }]}>
            اكتشف أفضل العروض على المجوهرات بدون مصنعية
          </Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        {offers.length === 0 ? (
          <EmptyState message="لا توجد عروض متاحة حالياً" icon="✨" />
        ) : (
          <FlatList
            data={offers}
            renderItem={({ item }) => <OfferCard offer={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchData}
            refreshing={loading}
          />
        )}

        {hasSocialLinks ? (
          <View
            style={[
              styles.socialContainer,
              { backgroundColor: theme.surface, shadowColor: theme.darkText },
            ]}
          >
            <Text style={[styles.socialTitle, { color: theme.darkText }]}>
              تابعونا
            </Text>

            <View style={styles.socialButtons}>
              {settings?.socialMedia?.whatsapp ? (
                <TouchableOpacity
                  style={[styles.socialButton, styles.whatsappButton]}
                  onPress={() => openSocialMedia(settings.socialMedia.whatsapp)}
                >
                  <MessageCircle size={24} color={theme.white} />
                </TouchableOpacity>
              ) : null}

              {settings?.socialMedia?.instagram ? (
                <TouchableOpacity
                  style={[styles.socialButton, styles.instagramButton]}
                  onPress={() => openSocialMedia(settings.socialMedia.instagram)}
                >
                  <Instagram size={24} color={theme.white} />
                </TouchableOpacity>
              ) : null}

              {settings?.socialMedia?.facebook ? (
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => openSocialMedia(settings.socialMedia.facebook)}
                >
                  <Facebook size={24} color={theme.white} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}
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
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  socialContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
});