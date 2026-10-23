import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useNetworkSync } from './src/hooks/useNetworkSync';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useBreedStore } from './src/store/breedStore';
import { useAppTheme } from './src/theme/useTheme';

function Main() {
  const { isDark } = useAppTheme();
  const initialize = useBreedStore((s) => s.initialize);

  useNetworkSync();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary fallbackTitle="Application Error">
        <Main />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
