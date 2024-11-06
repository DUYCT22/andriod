import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Linking, BackHandler, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DeliveryAddress from './DeliveryAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [totalAmount, setTotalAmount] = useState();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentData, setPaymentData] = useState({ products: [], totalAmount: 0, paymentMethod: '' }); // Initialize with an object
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const handlePayment = async () => {
        if (!paymentMethod) {
            Alert.alert('Notification', 'Please select payment method.');
            return;
        }

        if (selectedProducts.length === 0) {
            Alert.alert('Notification', 'Please select at least one product to checkout.');
            return;
        }

        const paymentDataToStore = { products: selectedProducts, totalAmount, paymentMethod };
        await AsyncStorage.setItem('paymentData', JSON.stringify(paymentDataToStore));

        if (paymentMethod === 'VNPAY') {
            Linking.openURL('https://vivnpay.vn/').catch(err => console.error("Couldn't load page", err));
        } else {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const cartKey = `cart_${userId}`;
                const cartData = await AsyncStorage.getItem(cartKey);
                let cart = cartData ? JSON.parse(cartData) : [];

                // Lọc các sản phẩm đã được thanh toán
                const updatedCart = cart.filter(item => !selectedProducts.some(selected => selected.id === item.id));
                await AsyncStorage.setItem(cartKey, JSON.stringify(updatedCart));

                Alert.alert("Notification", "Successful payment, order will be delivered to you as soon as possible!!");
            }
            navigation.navigate('index');
        }
    };


    const fetchPaymentData = async () => {
        try {
            const data = await AsyncStorage.getItem('paymentData');
            if (data) {
                const parsedData = JSON.parse(data);
                const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
                setPaymentData(dataArray);
                setSelectedProducts(dataArray);
                const totalSum = dataArray.reduce((sum, item) => sum + (item.total || 0), 0);
                setTotalAmount(totalSum);
            }
        } catch (error) {
            console.error("Error fetching payment data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentData();


    }, [paymentData]);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };
    useFocusEffect(
        useCallback(() => {
            // Kiểm tra trạng thái đăng nhập khi màn hình được focus
            const checkLoginStatus = async () => {
                const userId = await AsyncStorage.getItem('userId');
                setIsLoggedIn(!!userId);
            };

            checkLoginStatus();

            // Xử lý sự kiện nút quay lại
            const onBackPress = () => {
                Alert.alert(
                    'Confirm',
                    'Are you sure you want to exit?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Ok',
                            onPress: async () => {
                                await AsyncStorage.removeItem('paymentData');
                                navigation.goBack();
                            },
                        },
                    ],
                    { cancelable: false }
                );
                return true;
            };

            // Đăng ký sự kiện khi màn hình được focus
            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            // Cleanup sự kiện khi màn hình không còn focus
            return () => {
                backHandler.remove();
            };
        }, [navigation])
    );

    if (isLoading) {
        return <ActivityIndicator size="large" color="#0000EE" />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={[
                    { key: 'Delivery Address', component: <DeliveryAddress /> },
                    {
                        key: 'Payment Methods', component: (
                            <View>
                                <Picker selectedValue={paymentMethod} onValueChange={(itemValue) => setPaymentMethod(itemValue)}>
                                    <Picker.Item label="Payment upon receipt" value="COD" />
                                    <Picker.Item label="MoMo" value="MOMO" />
                                    <Picker.Item label="VNPay" value="VNPAY" />
                                </Picker>
                                {paymentMethod === 'MOMO' && (
                                    <View style={styles.qrContainer}>
                                        <Text>QR MoMo:</Text>
                                        <Image source={require('../assets/images/Qr.png')} style={styles.qrImage} />
                                    </View>
                                )}
                            </View>
                        )
                    },
                    {
                        key: 'Cart', component: (
                            <View style={styles.container}>
                                {paymentData && paymentData.length > 0 ? (
                                    paymentData.map((item, index) => (
                                        <View key={index} style={styles.cartItem}>
                                            <Image style={{ resizeMode: "contain" }} source={{ uri: item.image }} />
                                            <Text>{item.title}</Text>
                                            <Text>{`Price:$ ${item.price}`}</Text>
                                            <Text>{`Qty: ${item.quantity}`}</Text>
                                            <Text>{`Total: ${formatCurrency(item.total)}`}</Text>
                                        </View>

                                    ))
                                ) : (
                                    <Text>There are no products in the cart.</Text>
                                )}
                            </View>
                        )
                    },
                    { key: null, component: <Text style={styles.totalAmount}>{`Total: ${formatCurrency(totalAmount)}`}</Text> },
                    {
                        key: null, component: (
                            <View style={styles.button}>
                                <TouchableOpacity style={styles.bt1} onPress={() => navigation.navigate('Cart')}>
                                    <Text style={styles.buttonText}>Return to cart</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.bt2} onPress={handlePayment}>
                                    <Text style={styles.buttonText}> Payment confirmation</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                ]}
                renderItem={({ item }) => (
                    <View>
                        <Text style={styles.subtitle}>{item.key}</Text>
                        {item.component}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    cartItem: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    totalAmount: {
        fontWeight: 'bold',
        marginTop: 8,
        fontSize: 20
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    bt1: {
        backgroundColor: '#ff9900',
        padding: 10,
        borderRadius: 5,
    },
    bt2: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
    subtitle: {
        fontSize: 18,
        marginVertical: 8,
        fontWeight: 'bold',
    },
    qrContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    qrImage: {
        width: 150,
        height: 150,
        marginTop: 8,
    },
});

export default PaymentScreen;
