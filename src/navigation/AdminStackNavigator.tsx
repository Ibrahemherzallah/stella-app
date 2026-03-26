// src/navigation/AdminStackNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProductManagementScreen } from '../screens/admin/ProductManagementScreen';
import { AddProductScreen } from '../screens/admin/AddProductScreen';
import { SettingsScreen } from '../screens/admin/SettingsScreen';
import { GoldPricingSettingsScreen } from '../screens/admin/GoldPricingSettingsScreen';

import { useTheme } from '../context/ThemeContext';
import { fontSizes } from '../theme/colors';
import { Package, Settings, ClipboardList } from 'lucide-react-native';
import { AddGoldItemScreen } from '@/src/screens/admin/AddGoldItemScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** Tab 1: Products stack (example: gold pricing + add/edit) */
const ProductsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoldPricingSettings" component={GoldPricingSettingsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AddGoldItem" component={AddGoldItemScreen} />
    </Stack.Navigator>
  );
};

/** Tab 2: Product management stack (list + add/edit) */
const ProductManagementStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
    </Stack.Navigator>
  );
};

export const AdminStackNavigator: React.FC = () => {
  const { theme } = useTheme();

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
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStack}
        options={{
          tabBarLabel: 'الذهب',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="ManagementTab"
        component={ProductManagementStack}
        options={{
          tabBarLabel: 'إدارة المنتجات',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};