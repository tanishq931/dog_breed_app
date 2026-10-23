import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useBreedStore } from '../store/breedStore';

export function useNetworkSync(): void {
  const setOfflineStatus = useBreedStore((s) => s.setOfflineStatus);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? true;
      const isInternetReachable = state.isInternetReachable ?? true;
      const offline = !isConnected || !isInternetReachable;
      setOfflineStatus(offline);
    });

    return () => {
      unsubscribe();
    };
  }, [setOfflineStatus]);
}
