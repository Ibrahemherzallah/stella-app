// src/screens/OffersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Linking, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { OfferCard } from '../components/OfferCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { getOffers, getSettings } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';
import type { Offer, Settings } from '../types';
import { Facebook, Instagram, MessageCircle } from 'lucide-react-native';

export const OffersScreen: React.FC = () => {
  const { theme } = useTheme();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [offersData, settingsData] = await Promise.all([
        getOffers(),
        getSettings(),
      ]);
      setOffers(offersData.filter((offer) => offer.isActive));
      setSettings(settingsData);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل العروض');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openSocialMedia = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error opening link:', err)
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
    <ScreenContainer scrollable={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.darkText }]}>العروض الخاصة</Text>
          <Text style={[styles.subtitle, { color: theme.lightText }]}>
            اكتشف أفضل العروض على المجوهرات بدون مصنعية
          </Text>
        </View>

        {error && <ErrorMessage message={error} />}

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
          />
        )}

        {settings && (
          <View
            style={[
              styles.socialContainer,
              { backgroundColor: theme.surface, shadowColor: theme.darkText },
            ]}
          >
            <Text style={[styles.socialTitle, { color: theme.darkText }]}>تابعونا</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, styles.whatsappButton]}
                onPress={() => openSocialMedia(settings.socialMedia.whatsapp)}
              >
                <MessageCircle size={24} color={theme.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, styles.instagramButton]}
                onPress={() => openSocialMedia(settings.socialMedia.instagram)}
              >
                <Instagram size={24} color={theme.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => openSocialMedia(settings.socialMedia.facebook)}
              >
                <Facebook size={24} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
