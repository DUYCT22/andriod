import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, ScrollView, Dimensions } from 'react-native';
import { news } from "../data";
import { TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
const screenWidth = Dimensions.get('window').width;

export default function NewsTab() {
    const navigation = useNavigation();
    const truncateString = (str, num) => {
        if (str.length <= num) return str;
        return str.slice(0, num) + '...';
    };
    const renderItem = ({ item, index }) => (
        <TouchableOpacity onPress={() => navigation.navigate('NewDetail', { index })}>
            <View style={styles.newsItem}>
                {/* Hiển thị hình ảnh đầu tiên từ mảng content */}
                <Image source={{ uri: item.content.find(c => c.type === 'image').value }} style={styles.newsImage} />
                {/* Dòng chữ NEW */}
                <View style={styles.newLabel}>
                    <Text style={styles.newText}>HOT</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.newsTitle}>{truncateString(item.title, 40)}</Text>

                    {/* Hiển thị đoạn văn bản đầu tiên trong content */}
                    <Text style={styles.newsDetails}>
                        {item.content.find(c => c.type === 'text').value.length > 100
                            ? item.content.find(c => c.type === 'text').value.substring(0, 50) + '...'
                            : item.content.find(c => c.type === 'text')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>

    );

    return (
        <View style={styles.container}>
            <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 16,
                textAlign: 'center',
            }}> News </Text>
            <FlatList
                data={news}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
        padding: 10,
    },
    newsItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        position: 'relative', // Để cho phép đặt dòng chữ chéo lên ảnh
    },
    newsImage: {
        width: 100,
        height: 100,
    },
    newLabel: {
        position: 'absolute',
        top: 6,
        left: -20,
        backgroundColor: 'red',
        paddingVertical: 1,
        paddingHorizontal: 25,
        transform: [{ rotate: '-45deg' }],
        zIndex: 1, // Đảm bảo dòng chữ hiển thị trên ảnh
    },
    newText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    textContainer: {
        flex: 1,
        padding: 10,
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    newsDetails: {
        fontSize: 14,
        color: '#555',
    },
});
