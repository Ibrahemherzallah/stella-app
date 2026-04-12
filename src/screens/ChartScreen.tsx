import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../components/ScreenContainer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getHistory, GoldHistoryResponse } from '../services/api';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export const ChartScreen: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<GoldHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await getHistory('21k');
      setData(response);
    } catch (err) {
      console.error('fetchHistory error:', err);
      setData(null);
      setError('حدث خطأ أثناء تحميل بيانات الذهب التاريخية');
    } finally {
      setLoading(false);
    }
  };

  const reversedData = useMemo(() => {
    if (!data?.data?.length) return [];

    return [...data.data]
      .slice(-240) // last 20 years
      .filter((_, i) => i % 2 === 0) // every 2 months
      .reverse();
  }, [data]);

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingSpinner />
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {error ? <ErrorMessage message={error} /> : null}
        </View>
      </ScreenContainer>
    );
  }

  const labels = reversedData.map((point, index) => {
    const date = new Date(point.date);
    const year = date.getFullYear();

    // show one label every 24 months تقريباً
    if (index % 24 === 0 || index === reversedData.length - 1) {
      return `${year}`;
    }

    return '';
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: reversedData.map((point) => point.price),
        color: () => theme.goldPrimary,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    decimalPlaces: 2,
    color: () => theme.goldPrimary,
    labelColor: () => theme.darkText,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.lightGray,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemeToggle />
          <Text style={[styles.title, { color: theme.darkText }]}>
            الرسم البياني التاريخي للذهب
          </Text>
          <Text style={[styles.subtitle, { color: theme.goldPrimary }]}>
            عيار {data.karat} - بالدولار / غرام
          </Text>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, shadowColor: theme.darkText },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.lightText }]}>
              أعلى سعر
            </Text>
            <Text style={[styles.statValue, { color: theme.goldPrimary }]}>
              {data.maxPrice.toFixed(2)} $
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, shadowColor: theme.darkText },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.lightText }]}>
              أقل سعر
            </Text>
            <Text style={[styles.statValue, { color: theme.goldPrimary }]}>
              {data.minPrice.toFixed(2)} $
            </Text>
          </View>
        </View>


        <View
          style={[
            styles.chartContainer,
            { backgroundColor: theme.surface, shadowColor: theme.darkText },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={chartData}
              width={Math.max(screenWidth, reversedData.length * 5)}
              height={300}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines
              withOuterLines
              withVerticalLines={false}
              withHorizontalLines
              withDots={false}
              withShadow={false}
              fromZero={false}
              yAxisSuffix=" $"
            />
          </ScrollView>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.goldPrimary },
              ]}
            />
            <Text style={[styles.legendText, { color: theme.darkText }]}>
              يبدأ الرسم من الأحدث، وبالتمرير تظهر البيانات الأقدم
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    textAlign: 'center',
    fontWeight: fontWeights.semiBold,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  latestCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.lg,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  chartContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
  },
  legendText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
});