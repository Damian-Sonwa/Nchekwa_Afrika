import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import CryptoJS from 'crypto-js';

const AppContext = createContext();

const ENCRYPTION_KEY = 'gbv-app-encryption-key'; // In production, generate per device

export function AppProvider({ children }) {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [anonymousId, setAnonymousId] = useState(null);
  const [decoyMode, setDecoyMode] = useState(false);
  const [pin, setPin] = useState(null);

  useEffect(() => {
    loadAppState();
    setupAppStateListener();
  }, []);

  const loadAppState = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('isOnboarded');
      const anonId = await SecureStore.getItemAsync('anonymousId');
      const storedPin = await SecureStore.getItemAsync('pin');
      const decoy = await AsyncStorage.getItem('decoyMode') === 'true';

      setIsOnboarded(onboarded === 'true');
      setAnonymousId(anonId);
      setPin(storedPin);
      setDecoyMode(decoy);
      
      if (storedPin) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Load app state error:', error);
    }
  };

  const setupAppStateListener = () => {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && pin) {
        setIsLocked(true);
      }
    });
  };

  const checkPINLock = async () => {
    try {
      const storedPin = await SecureStore.getItemAsync('pin');
      if (storedPin) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Check PIN lock error:', error);
    }
  };

  const completeOnboarding = async (generatedAnonId) => {
    try {
      await AsyncStorage.setItem('isOnboarded', 'true');
      await SecureStore.setItemAsync('anonymousId', generatedAnonId);
      setAnonymousId(generatedAnonId);
      setIsOnboarded(true);
    } catch (error) {
      console.error('Complete onboarding error:', error);
    }
  };

  const setPIN = async (newPin) => {
    try {
      await SecureStore.setItemAsync('pin', newPin);
      setPin(newPin);
      setIsLocked(true);
    } catch (error) {
      console.error('Set PIN error:', error);
    }
  };

  const unlockApp = async (enteredPin) => {
    try {
      const storedPin = await SecureStore.getItemAsync('pin');
      if (enteredPin === storedPin) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unlock app error:', error);
      return false;
    }
  };

  const toggleDecoyMode = async () => {
    const newDecoyMode = !decoyMode;
    await AsyncStorage.setItem('decoyMode', newDecoyMode.toString());
    setDecoyMode(newDecoyMode);
  };

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  };

  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decrypt error:', error);
      return null;
    }
  };

  const wipeAllData = async () => {
    try {
      await AsyncStorage.clear();
      await SecureStore.deleteItemAsync('anonymousId');
      await SecureStore.deleteItemAsync('pin');
      setIsOnboarded(false);
      setIsLocked(false);
      setAnonymousId(null);
      setPin(null);
      setDecoyMode(false);
    } catch (error) {
      console.error('Wipe data error:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        isLocked,
        anonymousId,
        decoyMode,
        pin,
        completeOnboarding,
        setPIN,
        unlockApp,
        toggleDecoyMode,
        encryptData,
        decryptData,
        wipeAllData,
        checkPINLock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}


