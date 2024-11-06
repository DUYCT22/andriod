import { Tabs, useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const checkLoginStatus = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setIsLoggedIn(!!userId);
  };

  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
      const interval = setInterval(() => {
        checkLoginStatus();
      }, 500);
      return () => clearInterval(interval);
    }, [])
  );
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="News"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'newspaper' : 'newspaper-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Login"
        options={{
          title: isLoggedIn ? 'Profile' : 'Login',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? (isLoggedIn ? 'person' : 'log-in') : (isLoggedIn ? 'person-outline' : 'log-in-outline')}
              color={color}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                if (isLoggedIn) {
                  router.push('/Profile');
                } else {
                  router.push('/Login');
                }
              }}
            />
          ),
        }}
      />

    </Tabs>
  );
}
