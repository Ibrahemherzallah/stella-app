import React, { useCallback,useRef , useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainer } from '../components/ScreenContainer';
import { GoldPriceCard } from '../components/GoldPriceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';
import { getTodaySettings, getRulesText, listItems } from '../services/goldSettingsService';
import { CurrencyRates } from '../theme/currency';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';

type UiCard = {
  id: string;
  title: string;
  basePriceUsd: number;
  imageUrl?: string;
};

export const PricesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [rulesList, setRulesList] = useState<string[]>([]);
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);
  const [cards, setCards] = useState<UiCard[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [rates, setRates] = useState<CurrencyRates>({
    USD: 1,
    JOD: 0,
    ILS: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (rulesList.length <= 1) return;

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setActiveRuleIndex((prev) => (prev + 1) % rulesList.length);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [rulesList.length, fadeAnim]);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';

    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [settings, items, rules] = await Promise.all([
        getTodaySettings(),
        listItems(),
        getRulesText(),
      ]);

      setRulesList(Array.isArray(rules) ? rules.filter(Boolean) : []);

      if (!settings) {
        setCards([]);
        setRates({
          USD: 1,
          JOD: 0,
          ILS: 0,
        });
        setLastUpdatedAt(null);
        setError('لا توجد إعدادات اليوم. الرجاء إدخالها من حساب الأدمن.');
        return;
      }

      // ✅ updatedAt handling
      if (settings.updatedAt?.toDate) {
        setLastUpdatedAt(settings.updatedAt.toDate());
      } else if (settings.updatedAt) {
        setLastUpdatedAt(new Date(settings.updatedAt));
      } else {
        setLastUpdatedAt(null);
      }

      const nextRates = {
        USD: 1,
        JOD: settings.usdToJod || 0,
        ILS: settings.usdToIls || 0,
      };

      setRates(nextRates);

      const finalOunceUsdSell = (settings.goldOunceUsd || 0) + (settings.premiumSellOunceUsd || 0);
      const finalOunceUsdBuy = (settings.goldOunceUsd || 0) + (settings.premiumBuyOunceUsd || 0);

      const baseGramSell   = (finalOunceUsdSell / 31.1) * 0.87;
      const baseGramBuy    = (finalOunceUsdBuy / 31.1) * 0.885;
      const baseGramBuy24  = finalOunceUsdBuy / 31.1;
      const baseGramBuy22  = (finalOunceUsdBuy / 31.1) * 0.920;

      const computed = items
        .filter((it) => it.isActive !== false)
        .map((it) => {
          const makingFee = it.makingFeePerGramUsd / Number(settings.usdToJod || 1);
          const weight = it.weightGrams || 0;

          let finalGramUsd: number;

          if (it.karat === '24') {
            finalGramUsd = baseGramBuy24 + makingFee; // was missing makingFee
          } else if (it.karat === '22') {
            finalGramUsd = baseGramBuy22 + makingFee; // was using wrong base
          } else {
            // 21k default
            const baseGramUsd = it.type === 'sell' ? baseGramSell : baseGramBuy;
            finalGramUsd = baseGramUsd + makingFee;
          }

          const priceUsd = finalGramUsd * weight;

          return {
            id: it.id ?? it.title,
            title: it.title,
            basePriceUsd: Number.isFinite(priceUsd) ? priceUsd : 0,
            imageUrl: it.imageUrl,
          };
        });

      setCards(computed);
    } catch (error) {
      console.error('fetchData error:', error);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoPress = () => {
    console.log("enterrr")
    const count = tapCount + 1;
    console.log("count :" , count)
    if (count >= 5) {
      navigation.navigate('SignIn');
      setTapCount(0);
    } else {
      setTapCount(count);
    }
  };


  useEffect(() => {
    fetchData();
  }, [])


  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Sticky Rules Bar */}

      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemeToggle />
            <Text style={[styles.title, { color: theme.darkText }]} onPress={handleLogoPress}>أسعار الذهب</Text>
            <View style={{ width: 40 }} />
          </View>
          {lastUpdatedAt ? (
            <View
              style={[
                styles.updatedAtCard,
                {
                  backgroundColor: theme.surface,
                  shadowColor: theme.darkText,
                  borderColor: theme.goldPrimary,
                },
              ]}
            >
              <Text style={[styles.updatedAtLabel, { color: theme.lightText }]}>
                آخر تحديث للأسعار
              </Text>
              <Text style={[styles.updatedAtValue, { color: theme.goldPrimary }]}>
                {formatLastUpdated(lastUpdatedAt)}
              </Text>
            </View>
          ) : null}
          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.pricesContainer}>
            {cards.map((c) => (
              <GoldPriceCard
                key={c.id}
                title={c.title}
                basePriceUsd={c.basePriceUsd}
                imageUrl={c.imageUrl}
                rates={rates}
              />
            ))}
          </View>

          {!error && cards.length === 0 ? (
            <ErrorMessage message="لا توجد منتجات مفعلة لعرضها حالياً." />
          ) : null}
        </View>
      </ScrollView>
      {rulesList.length > 0 ? (
        <View
          style={[
            styles.rulesTickerContainer,
            {
              backgroundColor: '#1F1F1F',
              borderColor: theme.goldPrimary,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.rulesTickerText,
              { color: '#F5E7B2', opacity: fadeAnim },
            ]}
          >
            {rulesList[activeRuleIndex]}
          </Animated.Text>

          {rulesList.length > 1 ? (
            <View style={styles.dotsContainer}>
              {rulesList.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === activeRuleIndex ? '#F5E7B2' : 'rgba(245, 231, 178, 0.35)',
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
  },
  pricesContainer: {
    gap: 6.5,
  },

  rulesTickerContainer: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  rulesTickerText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  updatedAtCard: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  updatedAtLabel: {
    fontSize: fontSizes.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  updatedAtValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
});