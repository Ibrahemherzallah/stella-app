// src/navigation/AdminStackNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProductManagementScreen } from '../screens/admin/ProductManagementScreen';
import { AddProductScreen } from '../screens/admin/AddProductScreen';
import { SettingsScreen } from '../screens/admin/SettingsScreen';
import { GoldPricingSettingsScreen } from '../screens/admin/GoldPricingSettingsScreen';
import { AddGoldItemScreen } from '@/src/screens/admin/AddGoldItemScreen';
import { ChangePasswordScreen } from '@/src/screens/admin/ChangePasswordScreen';
import { AddRegularProductScreen } from '../screens/admin/AddRegularProductScreen';
import { ShoppingBag, Tag } from 'lucide-react-native'; // add this icon

import { useTheme } from '../context/ThemeContext';
import { fontSizes } from '../theme/colors';
import { Package, Settings, ClipboardList } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegularProductManagementScreen } from '../screens/admin/RegularProductManagementScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ProductsStack = () => {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoldPricingSettings" component={GoldPricingSettingsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AddGoldItem" component={AddGoldItemScreen} />
    </Stack.Navigator>
  );
};

const ProductManagementStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="AddRegularProduct" component={AddRegularProductScreen} />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
};

const RegularProductsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegularProductManagement" component={RegularProductManagementScreen} />
      <Stack.Screen name="AddRegularProduct" component={AddRegularProductScreen} />
    </Stack.Navigator>
  );
};

export const AdminStackNavigator: React.FC = () => {
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
          tabBarLabel: 'العروض',
          tabBarIcon: ({ color, size }) => <Tag size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="RegularProductsTab"
        component={RegularProductsStack}
        options={{
          tabBarLabel: 'المنتجات',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};