import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Cập nhật ở đây
import SignUpScreen from './app/SignUp'; // Đảm bảo đường dẫn chính xác
import LoginScreen from './app/(tabs)/Login'; // Đảm bảo đường dẫn chính xác
import Home from './app/(tabs)/index'
import ProductDetail from './app/ProductDetail';
import NewDetail from './app/NewDetail';
import ProByCateScreen from './app/ProductByCategory';
import ProfileScreen from './app/Profile';
const Stack = createNativeStackNavigator(); // Cập nhật ở đây

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="ProductDetail" component={ProductDetail} />
                <Stack.Screen name="NewDetail" component={NewDetail} />
                <Stack.Screen name="ProByCateScreen" component={ProByCateScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
