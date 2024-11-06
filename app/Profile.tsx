// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const [userData, setUserData] = useState(null);
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userId');
            setIsLoggedIn(false);
            Alert.alert('Logged out', 'You have successfully logged out.');
            router.push('/Login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const userInfo = await fetchUserInfo(userId);
                    setUserData(userInfo);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    const fetchUserInfo = async (userId) => {
        try {
            const response = await fetch(`https://fakestoreapi.com/users/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data; // Trả về dữ liệu người dùng từ API
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null; // Hoặc trả về một giá trị mặc định nếu có lỗi
        }
    };

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000EE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.label}>Name: {userData.name.firstname} {userData.name.lastname}</Text>
            <Text style={styles.label}>Email: {userData.email}</Text>
            <Text style={styles.label}>Phone: {userData.phone}</Text>
            <Text style={styles.label}>Address: {userData.address.number} {userData.address.street} {userData.address.city}</Text>
            <Text style={styles.label}>Zip Code: {userData.address.zipcode}</Text>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

