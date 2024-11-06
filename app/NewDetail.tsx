import React from "react";
import { View, Text, Image, ScrollView, Dimensions } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import { news } from "./data";
import { StyleSheet } from "react-native";

const screenHeight = Dimensions.get('window').height;

type RootStackParamList = {
    NewDetail: { index: number };
};

export default function NewDetail() {
    const route = useRoute<RouteProp<RootStackParamList, 'NewDetail'>>();
    const { index } = route.params;
    const selectedNews = news[index];

    const renderContent = () => {
        return selectedNews.content.map((item, idx) => {
            if (item.type === 'text') {
                return <Text key={idx} style={styles.newsText}>{item.value}</Text>;
            } else if (item.type === 'image') {
                return <Image key={idx} source={{ uri: item.value }} style={styles.newsImage} />;
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.newsInfo}>
                    <Text style={styles.newsTitle}>{selectedNews.title}</Text>
                    {renderContent()}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    newsInfo: {
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 20
    },
    newsTitle: {
        textAlign: "center",
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    newsText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 16,
    },
    newsImage: {
        width: '100%',
        height: screenHeight * 0.5,
        resizeMode: "contain",
        marginBottom: 16,
    },
});
