import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Pressable, KeyboardAvoidingView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SignUpScreen() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const handleSignUp = async () => {
        const userData = {
            email,
            username,
            password,
            name: {
                firstname: firstName,
                lastname: lastName,
            },
            address: {
                city: 'TPHCM',
                street: '7835 new road',
                number: 3,
                zipcode: '12926-3874',
                geolocation: {
                    lat: '-37.3159',
                    long: '81.1496'
                }
            },
            phone: '1-570-236-7033'
        };

        try {
            const response = await fetch('https://fakestoreapi.com/users', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const json = await response.json();

            if (response.ok) {
                Alert.alert('Notification', 'Registered successfully!');
                navigation.navigate('Login'); // Chuyển hướng đến màn hình đăng nhập
            } else {
                Alert.alert('Error', json.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Registration failed. Please try again later.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.background}
            keyboardVerticalOffset={100}
        >
            <Text style={styles.text}>Register</Text>
            <Text style={styles.text3}>Many attractive incentives when becoming a member of Duy OT</Text>
            <View style={styles.inputContainer}>
                <Icon name="user" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#aaa"
                    value={firstName}
                    onChangeText={setFirstName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Icon name="user" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#aaa"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Icon name="user" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#aaa"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>
            <View style={styles.inputContainer}>
                <Icon name="envelope" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#000" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />
            </View>
            <View style={styles.button}>
                <Button
                    title="Register"
                    color="#841584"
                    onPress={handleSignUp} // Gọi hàm đăng ký khi nhấn nút
                />
            </View>
            <Text style={styles.text3}>
                Do you have an account?
                <Pressable onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.link}> Login</Text>
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
        marginTop: 15,
        marginBottom: 15
    },
    link: {
        color: "#F8F8FF",
        fontWeight: 'bold'
    }
});
