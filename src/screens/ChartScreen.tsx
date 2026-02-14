import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../components/ScreenContainer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getHistory } from '../services/api';
import { spacing, fontSizes, fontWeights, borderRadius } from '../theme/colors';
import type { HistoryResponse } from '../types';
import { ThemeToggle } from '@/src/components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context'

const screenWidth = Dimensions.get('window').width;

export const ChartScreen: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setError(null);
      const response = await getHistory('21k');
      setData(response);
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

  if (!data) {
    return (
        <ScreenContainer>
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            {error && <ErrorMessage message={error} />}
          </View>
        </ScreenContainer>
    );
  }

  const chartData = {
    labels: data.data.map(point => {
      const date = new Date(point.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: data.data.map(point => point.price),
        color: () => theme.goldPrimary,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    decimalPlaces: 0,
    color: () => theme.goldPrimary,
    labelColor: () => theme.darkText,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: theme.goldPrimary,
      fill: theme.surface,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.lightGray,
    },
  };

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: `${theme.background}`}}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <ThemeToggle />
            <Text style={[styles.title, { color: theme.darkText }]}>
              رسم بياني لأسعار الذهب
            </Text>
            <Text style={[styles.subtitle, { color: theme.goldPrimary }]}>
              عيار {data.karat}
            </Text>
          </View>

          {error && <ErrorMessage message={error} />}

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
                {data.maxPrice.toLocaleString('ar-EG')} ج.م
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
                {data.minPrice.toLocaleString('ar-EG')} ج.م
              </Text>
            </View>
          </View>

          <View
              style={[
                styles.chartContainer,
                { backgroundColor: theme.surface, shadowColor: theme.darkText },
              ]}
          >
            <LineChart
                data={chartData}
                width={screenWidth - spacing.md * 2}
                height={280}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines
                withVerticalLines={false}
                withHorizontalLines
                withDots
                withShadow={false}
            />
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
                سعر الذهب عيار 21
              </Text>
            </View>
          </View>
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
    fontSize: fontSizes.lg,
    textAlign: 'center',
    fontWeight: fontWeights.semiBold,
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
    flexDirection: 'row',
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
  },
});
