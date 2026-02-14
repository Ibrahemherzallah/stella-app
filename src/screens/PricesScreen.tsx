import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainer } from '../components/ScreenContainer';
import { GoldPriceCard } from '../components/GoldPriceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';

// ✅ Firestore services (from my previous message)
import { getTodaySettings, getRulesText, listItems } from '../services/goldFirestore';

type UiCard = {
  id: string;
  title: string;
  basePriceUsd: number;
  imageUrl?: string;
};

export const PricesScreen: React.FC = () => {
  const { theme } = useTheme();

  const [rulesText, setRulesText] = useState('');
  const [cards, setCards] = useState<UiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [settings, items, rules] = await Promise.all([
        getTodaySettings(),
        listItems(),
        getRulesText(),
      ]);

      setRulesText(rules || '');
      console.log("settings is : ", settings)
      console.log("items is : ", items)
      console.log("rules is : ", rules)
      if (!settings) {
        setCards([]);
        setError('لا توجد إعدادات اليوم. الرجاء إدخالها من حساب الأدمن.');
        return;
      }

      const finalOunceUsd = (settings.goldOunceUsd || 0) + (settings.premiumOunceUsd || 0);
      const baseGramUsd = finalOunceUsd / 31.1;

      const computed: UiCard[] = items
        .filter((it) => it.isActive !== false)
        .map((it) => {
          const makingFee = it.makingFeePerGramUsd || 0;
          const weight = it.weightGrams || 0;

          const finalGramUsd = baseGramUsd + makingFee;
          const priceUsd = finalGramUsd * weight;

          return {
            id: it.id || `${it.title}-${it.order}`,
            title: it.title,
            basePriceUsd: Number.isFinite(priceUsd) ? priceUsd : 0,
            imageUrl: it.imageUrl,
          };
        });

      setCards(computed);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل البيانات');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemeToggle />
            <Text style={[styles.title, { color: theme.darkText }]}>أسعار الذهب</Text>
            <View style={{ width: 40 }} />
          </View>

          {error && <ErrorMessage message={error} />}

          <View style={styles.pricesContainer}>
            {cards.map((c) => (
              <GoldPriceCard
                key={c.id}
                title={c.title}
                basePriceUsd={c.basePriceUsd}
                // لو عدّلت GoldPriceCard لدعم imageUrl:
                imageUrl={c.imageUrl}
              />
            ))}
          </View>

          {rulesText ? (
            <View style={[styles.rulesCard, { backgroundColor: theme.surface, shadowColor: theme.darkText }]}>
              <Text style={[styles.rulesTitle, { color: theme.goldPrimary }]}>قواعد الذهب</Text>
              <Text style={[styles.rulesText, { color: theme.darkText }]}>{rulesText}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
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
  pricesContainer: { marginBottom: spacing.lg },
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