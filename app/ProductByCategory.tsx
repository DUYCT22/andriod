import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router/build/useNavigation';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    ProByCate: { id: string }; // Đổi tên thành ProByCate để rõ ràng hơn
};

export default function ProByCateScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'ProByCate'>>();
    const { id } = route.params; // id ở đây là tên danh mục
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchProductsByCategory = async () => {
            try {
                const response = await axios.get(`https://fakestoreapi.com/products`);
                const allProducts = response.data;

                // Lọc các sản phẩm theo category
                const filtered = allProducts.filter(product => product.category === id);
                setProducts(allProducts);
                setFilteredProducts(filtered);
            } catch (error) {
                console.error("Error fetching products by category:", error);
            } finally {
                setLoading(false); // Đặt loading thành false khi tải xong
            }
        };

        fetchProductsByCategory();
    }, [id]);
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
    const renderProduct = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.productItem}
                onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            >
                <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    resizeMode="contain"
                />
                <Text>{truncateString(item.title, 15)}</Text>
                <Text style={{ color: "red" }}>{formatCurrency(item.price)}</Text>
            </TouchableOpacity>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <SafeAreaView style={styles.container}>
            {filteredProducts.length === 0 ? (
                <Text style={styles.noProductsText}>There are no products</Text>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.productList}
                    numColumns={2}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noProductsText: {
        textAlign: 'center', // Căn giữa
        fontSize: 18, // Kích thước chữ
        color: 'red', // Màu chữ
        marginTop: 20, // Khoảng cách trên
    },
    productList: {
        marginTop: 10,
    },
    productItem: {
        width: (width / 2) - 20,
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 19
    },
    productImage: {
        width: "100%",
        height: 210,
    },
});
