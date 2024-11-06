import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, title }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.6}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: 'black',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default CustomButton;
