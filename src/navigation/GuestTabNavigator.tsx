// src/navigation/GuestTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PricesScreen } from '../screens/PricesScreen';
import { ChartScreen } from '../screens/ChartScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { useTheme } from '../context/ThemeContext';
import { fontSizes } from '../theme/colors';
import { DollarSign, TrendingUp, Tag, LogIn } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export const GuestTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.goldPrimary,
        tabBarInactiveTintColor: theme.lightText,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.lightGray,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 70 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Prices"
        component={PricesScreen}
        options={{
          tabBarLabel: 'الأسعار',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chart"
        component={ChartScreen}
        options={{
          tabBarLabel: 'الرسم البياني',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          tabBarLabel: 'العروض',
          tabBarIcon: ({ color, size }) => <Tag size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          tabBarLabel: 'دخول',
          tabBarIcon: ({ color, size }) => <LogIn size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
