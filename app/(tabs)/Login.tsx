import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // Kiểm tra tên đăng nhập và mật khẩu không rỗng
        if (username === "") {
            Alert.alert('Notification', 'Do not leave username blank!');
            return;
        }

        if (password === "") {
            Alert.alert('Notification', 'Do not leave the password blank!');
            return;
        }

        // Gửi yêu cầu đăng nhập
        try {
            const response = await fetch('https://fakestoreapi.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });
            const json = await response.json();

            // Kiểm tra mã phản hồi và xác thực
            if (response.ok) {
                console.log('Successful login:', json);
                Alert.alert('Successful login');
                // Lưu thông tin người dùng vào AsyncStorage
                await AsyncStorage.setItem('userToken', json.token); // Giả sử rằng token được trả về trong json.token
                await AsyncStorage.setItem('username', username); // Lưu username
                await AsyncStorage.setItem('isLoggedIn', 'true');
                const getUserIdByUsername = async (username) => {
                    try {
                        const response = await fetch(`https://fakestoreapi.com/users`);
                        const users = await response.json();
                        const user = users.find(user => user.username === username);
                        return user ? user.id : null;
                    } catch (error) {
                        console.error("Error fetching users:", error);
                        return null;
                    }
                };

                const userId = await getUserIdByUsername(username);
                if (userId) {
                    await AsyncStorage.setItem('userId', JSON.stringify(userId));
                } else {
                    console.log("User not found");
                }
                navigation.navigate('index'); // Chuyển đến màn hình chính
            } else {
                Alert.alert('Notification', json.message || 'Login failed.'); // Hiển thị thông báo lỗi
            }
        } catch (error) {
            console.error('Error while logging in:', error);
            Alert.alert('Notification', 'Error while logging in. Please try again later.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.background}
            keyboardVerticalOffset={100} // Điều chỉnh giá trị này nếu cần thiết
        >
            <Text style={{ fontSize: 60, color: 'blue', fontStyle: 'italic' }}>Duy OT</Text>
            <Text style={styles.text}>Hello</Text>
            <Text style={styles.text2}>Login</Text>
            <View style={styles.inputContainer}>
                <Icon name="user" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <View style={styles.button}>
                <Button
                    title="Login"
                    color="#841584"
                    onPress={handleLogin}
                />
            </View>
            <Text style={styles.text3}>
                You don't have an account yet?
                <Pressable onPress={() => navigation.navigate("SignUp")}>
                    <Text style={styles.link}> Register</Text>
                </Pressable>
            </Text>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: "#330066",
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: "#F8F8FF",
        fontSize: 40,
        textAlign: "center",
    },
    text2: {
        color: "#F8F8FF",
        fontSize: 15,
        textAlign: "center",
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        opacity: 0.9,
        width: 350,
        height: 50,
        paddingHorizontal: 15,
        marginVertical: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    button: {
        marginTop: 20
    },
    text3: {
        color: "#F8F8FF",
        fontSize: 15,
        textAlign: "center",
        marginTop: 15
    },
    link: {
        color: "#F8F8F8",
        fontWeight: 'bold',
    }
});
