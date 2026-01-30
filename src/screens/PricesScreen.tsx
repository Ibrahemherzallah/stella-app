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
import { type Currency } from '../theme/currency';

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
    <ScreenContainer scrollable={true}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemeToggle />
            <Text style={[styles.title, { color: theme.darkText }]}>أسعار الذهب</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.currencySelectorContainer}>
            <Text style={[styles.currencyLabel, { color: theme.darkText }]}>العملة:</Text>
            <View style={styles.currencyButtons}>
              {(['USD', 'JOD', 'ILS'] as Currency[]).map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyButton,
                    currency === curr && {
                      backgroundColor: theme.goldPrimary,
                    },
                    currency !== curr && {
                      backgroundColor: theme.surface,
                      borderColor: theme.lightGray,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text
                    style={[
                      styles.currencyButtonText,
                      {
                        color: currency === curr ? theme.white : theme.darkText,
                      },
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error && <ErrorMessage message={error} />}

          <View style={styles.pricesContainer}>
            <GoldPriceCard
              title="سعر الذهب عيار 21 للشراء"
              priceWithoutMaking={65}
              priceWithMaking={67}
              pricePerLira={520}
            />
            <GoldPriceCard
              title="سعر الذهب عيار 21 للبيع"
              priceWithoutMaking={64}
              priceWithMaking={66}
              pricePerLira={510}
            />
            <GoldPriceCard
              title="سعر الذهب عيار 18"
              priceWithoutMaking={56}
              priceWithMaking={58}
              pricePerLira={445}
            />
          </View>

          {rulesText && (
            <View style={[styles.rulesCard, { backgroundColor: theme.surface, shadowColor: theme.darkText }]}>
              <Text style={[styles.rulesTitle, { color: theme.goldPrimary }]}>قواعد الذهب</Text>
              <Text style={[styles.rulesText, { color: theme.darkText }]}>{rulesText}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
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
