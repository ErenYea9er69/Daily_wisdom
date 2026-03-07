import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import ApiKeyScreen from './src/screens/ApiKeyScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import CalendarScreen from './src/screens/CalendarScreen';

// State
import { useStore } from './src/store/useStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // Get states from Zustand
  const hasCompletedOnboarding = useStore(state => state.hasCompletedOnboarding);
  const apiKey = useStore(state => state.apiKey);

  useEffect(() => {
    // We can add loading logic here if needed for AsyncStorage hydration
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' }
        }}
      >
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !apiKey ? (
          <Stack.Screen name="ApiKeySetup" component={ApiKeyScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                title: 'Mentor Chat',
                headerStyle: { backgroundColor: '#111' },
                headerTintColor: '#fff'
              }}
            />
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{
                headerShown: true,
                title: 'Your Growth',
                headerStyle: { backgroundColor: '#111' },
                headerTintColor: '#fff'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
