import { useFocusEffect, useNavigation } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const screenWidth = Dimensions.get('window').width;

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    const fetchCarts = async (userId) => {
        try {
            setIsLoading(true);
            const cartKey = `cart_${userId}`;
            const cartData = await AsyncStorage.getItem(cartKey);
            const cart = cartData ? JSON.parse(cartData) : [];

            if (cart.length === 0) {
                console.log("No products in cart");
                setCartItems([]);
                return;
            }
            const updatedCart = cart.map(item => ({ ...item, selected: true }));
            setCartItems(updatedCart);
        } catch (error) {
            console.error("Error fetching carts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const checkUser = async () => {
                const id = await AsyncStorage.getItem('userId');
                const userId = parseInt(id, 10);

                if (!userId) {
                    Alert.alert('Notification', 'Login to view cart', [
                        { text: 'OK', onPress: () => navigation.navigate('Login') },
                    ]);
                    setCartItems([]); // Đảm bảo xóa giỏ hàng khi không có userId
                    setIsLoading(false);
                } else {
                    fetchCarts(userId)
                }
            };

            checkUser();
        }, [navigation])
    );

    useEffect(() => {
        const total = cartItems.reduce((sum, item) => item.selected ? sum + item.price * item.quantity : sum, 0);
        setTotalPrice(total);
    }, [cartItems]);
    const handlePayment = async () => {
        // Lưu thông tin sản phẩm đã chọn vào AsyncStorage
        const selectedItems = cartItems
            .filter(item => item.selected) // Lọc các sản phẩm được chọn
            .map(item => ({
                id: item.id,
                title: item.title,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity, // Tính tổng tiền cho từng sản phẩm
            }));
        console.log("Selected Items: ", selectedItems);
        // Lưu vào AsyncStorage
        await AsyncStorage.setItem('paymentData', JSON.stringify(selectedItems));

        // Điều hướng đến PaymentScreen
        navigation.navigate('Payment');
    };
    const toggleSelectItem = (id) => {
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        );
        setCartItems(updatedItems);
    };

    const increaseQuantity = (id) => {
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updatedItems);
    };

    const decreaseQuantity = (id) => {
        const updatedItems = cartItems.map(item =>
            item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        );
        setCartItems(updatedItems);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };
    const removeItemFromCart = (id) => {
        Alert.alert(
            "Confirmed deletion",
            "Are you sure you want to remove this product from your cart?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("cancel"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        const updatedItems = cartItems.filter(item => item.id !== id);
                        setCartItems(updatedItems);

                        // Cập nhật lại giỏ hàng trong AsyncStorage
                        const userId = await AsyncStorage.getItem('userId');
                        const cartKey = `cart_${userId}`;
                        await AsyncStorage.setItem(cartKey, JSON.stringify(updatedItems));
                    }
                }
            ]
        );
    };
    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            {/* Checkbox for selecting the item */}
            <TouchableOpacity onPress={() => toggleSelectItem(item.id)} style={styles.checkBox}>
                {item.selected && <View style={styles.checkedBox} />}
            </TouchableOpacity>

            {/* Product Image */}
            <Image source={{ uri: item.image }} style={styles.cartItemImage} />

            <View style={styles.cartItemDetails}>
                {/* Product Title */}
                <Text style={styles.cartItemName}>{item.title}</Text>

                {/* Product Price */}
                <Text style={styles.cartItemPrice}>{formatCurrency(item.price)}</Text>

                {/* Quantity Controls and Remove Button */}
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        onPress={() => decreaseQuantity(item.id)}
                        style={[styles.quantityButton, { opacity: item.quantity > 1 ? 1 : 0.5 }]}
                        disabled={item.quantity <= 1}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.cartItemQuantity}>{item.quantity}</Text>

                    <TouchableOpacity
                        onPress={() => increaseQuantity(item.id)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>

                    {/* Remove Item Button */}
                    <TouchableOpacity onPress={() => removeItemFromCart(item.id)} style={styles.removeButton}>
                        <Icon name="trash" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );



    const formattedTotalPrice = formatCurrency(totalPrice);

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000EE" style={{ marginTop: 50 }} />
            ) : cartItems.length === 0 ? (
                <Text style={{ fontSize: 28, marginTop: 40, padding: 3 }}>Cart is empty</Text>
            ) : (
                <View>
                    <Text style={styles.header}>Your cart</Text>
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.cartList}
                    />
                    <View style={styles.footer}>
                        <Text style={styles.totalPrice}>Total: {formattedTotalPrice}</Text>
                        <TouchableOpacity
                            style={[styles.checkoutButton, { backgroundColor: cartItems.some(item => item.selected) ? '#0000EE' : '#ccc' }]}
                            onPress={handlePayment}
                            disabled={!cartItems.some(item => item.selected)}
                        >
                            <Text style={styles.buttonText}>Pay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('index')}>
                            <Text style={styles.buttonText}>Continue shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        justifyContent: 'flex-end', // Căn chỉnh các phần tử bên phải
    },

    removeButton: {
        marginLeft: 50, // Khoảng cách giữa các nút
        backgroundColor: '#ff3333',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
    },

    removeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    cartList: {
        flexGrow: 0,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkedBox: {
        width: 16,
        height: 16,
        backgroundColor: '#0000EE',
        borderRadius: 2,
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
        resizeMode: "contain"
    },
    cartItemDetails: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartItemPrice: {
        fontSize: 14,
        color: 'red',
    },
    cartItemQuantity: {
        fontSize: 14,
        color: '#555',
    },
    quantityButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 5,
    },
    quantityButtonText: {
        fontSize: 18,
    },
    footer: {
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    checkoutButton: {
        backgroundColor: '#0000EE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 10,
    },
    continueButton: {
        backgroundColor: '#000066',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
