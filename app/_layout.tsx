// app/_layout.tsx
import { StatusBar } from 'expo-status-bar';
import { NavigationIndependentTree } from '@react-navigation/native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { CurrencyProvider } from '@/src/context/CurrencyContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { RootNavigator } from '@/src/navigation/RootNavigator';

export default function RootLayout() {
    useFrameworkReady();

    return (
        <ThemeProvider>
            <CurrencyProvider>
                <AuthProvider>
                    <NavigationIndependentTree>
                        <RootNavigator />
                    </NavigationIndependentTree>
                    <StatusBar style="auto" />
                </AuthProvider>
            </CurrencyProvider>
        </ThemeProvider>
    );
}
