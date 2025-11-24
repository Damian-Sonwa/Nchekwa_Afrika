import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import SafetyPlanScreen from './src/screens/SafetyPlanScreen';
import EvidenceVaultScreen from './src/screens/EvidenceVaultScreen';
import EducationScreen from './src/screens/EducationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DecoyScreen from './src/screens/DecoyScreen';
import PINLockScreen from './src/screens/PINLockScreen';

// Context
import { AppProvider, useAppContext } from './src/context/AppContext';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main app tabs (discreet naming)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Support') {
            iconName = focused ? 'message-text' : 'message-text-outline';
          } else if (route.name === 'Resources') {
            iconName = focused ? 'book-open-variant' : 'book-open-variant-outline';
          } else if (route.name === 'Tools') {
            iconName = focused ? 'tools' : 'tools';
          } else if (route.name === 'Learn') {
            iconName = focused ? 'school' : 'school-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Support" 
        component={ChatScreen}
        options={{ tabBarLabel: 'Support' }}
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesScreen}
        options={{ tabBarLabel: 'Resources' }}
      />
      <Tab.Screen 
        name="Tools" 
        component={SafetyPlanScreen}
        options={{ tabBarLabel: 'Tools' }}
      />
      <Tab.Screen 
        name="Learn" 
        component={EducationScreen}
        options={{ tabBarLabel: 'Learn' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isOnboarded, isLocked, anonymousId, checkPINLock } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPINLock();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : isLocked ? (
          <Stack.Screen name="PINLock" component={PINLockScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="EvidenceVault" component={EvidenceVaultScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Decoy" component={DecoyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}


