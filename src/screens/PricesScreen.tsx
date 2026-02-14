// src/screens/PricesScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { GoldPriceCard } from '../components/GoldPriceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ThemeToggle } from '../components/ThemeToggle';
import { getSettings } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context'

export const PricesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [rulesText, setRulesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const settings = await getSettings();
      setRulesText(settings.rulesText || '');
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: `${theme.background}`}}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemeToggle />
            <Text style={[styles.title, { color: theme.darkText }]}>أسعار الذهب</Text>
            <View style={{ width: 40 }} />
          </View>


          {error && <ErrorMessage message={error} />}

          <View style={styles.pricesContainer}>
            <GoldPriceCard
              title="سعر الذهب عيار 21 للشراء مع مصنعية"
              basePriceUsd={67}
            />
            <GoldPriceCard
              title="سعر الذهب عيار 21 للشراء بدون مصنعية"
              basePriceUsd={65}
            />
            <GoldPriceCard
              title="سعر الذهب عيار 21 للبيع بدون مصنعية"
              basePriceUsd={64}
            />
            <GoldPriceCard
              title="ليرة رشادي 7 غم مختوم وزارة"
              basePriceUsd={56}
            />
            <GoldPriceCard
              title="ليرة انجليزي 8 غم مختوم وزارة"
              basePriceUsd={56}
            />
            <GoldPriceCard
              title="اونصة محلي 31.1 غم مختوم وزارة"
              basePriceUsd={2000}
            />
            {/* ...etc */}
          </View>

          {rulesText && (
            <View style={[styles.rulesCard, { backgroundColor: theme.surface, shadowColor: theme.darkText }]}>
              <Text style={[styles.rulesTitle, { color: theme.goldPrimary }]}>قواعد الذهب</Text>
              <Text style={[styles.rulesText, { color: theme.darkText }]}>{rulesText}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  currencySelectorContainer: {
    marginBottom: spacing.lg,
  },
  currencyLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  currencyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  currencyButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  pricesContainer: {
    marginBottom: spacing.lg,
  },
  rulesCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  rulesTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  rulesText: {
    fontSize: fontSizes.md,
    lineHeight: 24,
    textAlign: 'right',
  },
});
