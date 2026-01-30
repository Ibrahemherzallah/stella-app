// src/navigation/AdminStackNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductManagementScreen } from '../screens/admin/ProductManagementScreen';
import { AddProductScreen } from '../screens/admin/AddProductScreen';
import { SettingsScreen } from '../screens/admin/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { fontSizes } from '../theme/colors';
import { Package, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ProductStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProductList" component={ProductManagementScreen} />
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
        name="Products"
        component={ProductStack}
        options={{
          tabBarLabel: 'المنتجات',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
