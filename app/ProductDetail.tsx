import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, Dimensions, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenHeight = Dimensions.get('window').height;

type RootStackParamList = {
    ProductDetail: { id: number };
};

export default function ProductDetail() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
    const { id } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://fakestoreapi.com/products/${id}`);
                const json = await response.json();
                setProduct(json);
                fetchRelatedProducts(json.category); // Gọi hàm để lấy sản phẩm cùng danh mục
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);
    const handleIncrease = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };
    const fetchRelatedProducts = async (cateName: any, currentProductId: undefined) => {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/category/${cateName}`);
            const json = await response.json();

            const filteredProducts = json.filter((product: { id: number; }) => product.id !== id);

            setRelatedProducts(filteredProducts);
        } catch (error) {
            console.error("Error fetching related products:", error);
        }
    };

    const handlePayNow = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Notification', 'Login to buy products', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
                return;
            }
            setLoading(false);

            const paymentData = {
                id: product.id,
                image: product.image,
                title: product.title,
                price: product.price,
                quantity: quantity,
                total: product.price * quantity,
            };
            const existingData = await AsyncStorage.getItem('paymentData');
            let parsedData = existingData ? JSON.parse(existingData) : [];
            if (!Array.isArray(parsedData)) {
                parsedData = [parsedData];
            }
            parsedData.push(paymentData);
            await AsyncStorage.setItem('paymentData', JSON.stringify(parsedData));
            navigation.navigate('Payment');
        } catch (error) {
            console.error('Error storing payment data:', error);
            Alert.alert('Error', 'Failed to add product to payment data.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000EE" />
            </View>
        );
    }
    const truncateString = (str, num) => {
        if (str.length <= num) return str;
        return str.slice(0, num) + '...'; // Thêm dấu '...' ở cuối nếu cắt ngắn
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };
    const addToCart = async (product) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Notification', 'Login to add products to cart', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
                return;
            }
            const cartKey = `cart_${userId}`;
            const cartData = await AsyncStorage.getItem(cartKey);
            let cart = cartData ? JSON.parse(cartData) : [];
            const existingProductIndex = cart.findIndex(item => item.id === product.id);
            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push({ ...product, quantity: quantity });
            }
            await AsyncStorage.setItem(cartKey, JSON.stringify(cart));
            Alert.alert('Success', 'Product added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add product to cart');
        }
    };
    const renderRelatedProduct = ({ item }) => (
        <TouchableOpacity style={styles.relatedProductContainer}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}>
            <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
            <Text style={styles.relatedProductName}>{truncateString(item.title, 25)}</Text>
            <Text style={styles.relatedProductPrice}>{formatCurrency(item.price)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.currentImage} />
                </View>


                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.title}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleDecrease}>
                            <Text style={styles.buttonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.button} onPress={handleIncrease}>
                            <Text style={styles.buttonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.productDescription}>{product.description}</Text>
                </View>

                <Text style={styles.sectionTitle}>Related products</Text>
                <FlatList
                    data={relatedProducts}
                    renderItem={renderRelatedProduct}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.relatedProductsList}
                />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(product)}>
                    <Text style={styles.buttonText}>Add to cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyNowButton} onPress={handlePayNow}>
                    <Text style={styles.buttonText}>Pay now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    button: {
        backgroundColor: '#000099',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: screenHeight * 0.4,
    },
    currentImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    productInfo: {
        padding: 16,
        backgroundColor: '#fff',
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 12,
    },
    productDescription: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        paddingLeft: 16,
    },
    relatedProductsList: {
        paddingLeft: 16,
        marginTop: 10,
    },
    relatedProductContainer: {
        width: 120,
        marginRight: 10,
        marginBottom: 20
    },
    relatedProductImage: {
        width: 100,
        height: 100,
        resizeMode: "contain",
    },
    relatedProductName: {
        fontSize: 14,
        marginTop: 5,
    },
    relatedProductPrice: {
        fontSize: 14,
        color: 'red',
        textAlign: 'justify'
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        height: 60,
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: '#330099',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        borderRadius: 5,
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: '#0000EE',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
