// DeliveryAddress.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const DeliveryAddress = () => {
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [street, setStreet] = useState('');

    // Function to fetch data from API
    const fetchData = async (type, id) => {
        const endpoints = {
            cities: 'https://esgoo.net/api-tinhthanh/1/0.htm',
            districts: `https://esgoo.net/api-tinhthanh/2/${id}.htm`,
            wards: `https://esgoo.net/api-tinhthanh/3/${id}.htm`
        };

        try {
            const response = await fetch(endpoints[type]);
            const data = await response.json();
            // Kiểm tra nếu data.data là mảng
            if (Array.isArray(data.data)) {
                if (type === 'cities') setCities(data.data);
                if (type === 'districts') setDistricts(data.data);
                if (type === 'wards') setWards(data.data);
            } else {
                console.error(`Dữ liệu trả về từ ${type} không phải là mảng:`, data);
            }
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        }
    };

    useEffect(() => {
        fetchData('cities');
    }, []);

    useEffect(() => {
        if (selectedCity) fetchData('districts', selectedCity);
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict) fetchData('wards', selectedDistrict);
    }, [selectedDistrict]);

    // Function to handle address submission
    const handleSubmit = () => {
        if (!selectedCity || !selectedDistrict || !selectedWard || !street) {
            Alert.alert('Notification', 'Please select full address!');
            return;
        }
    };

    return (
        <View style={styles.container}>
            <Picker
                selectedValue={selectedCity}
                onValueChange={(itemValue) => setSelectedCity(itemValue)}
            >
                <Picker.Item label="Select City/Province" value="" />
                {Array.isArray(cities) && cities.map((city) => (
                    <Picker.Item key={city.id} label={city.name} value={city.id} />
                ))}
            </Picker>
            <Picker
                selectedValue={selectedDistrict}
                onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
            >
                <Picker.Item label="Select District" value="" />
                {Array.isArray(districts) && districts.map((district) => (
                    <Picker.Item key={district.id} label={district.name} value={district.id} />
                ))}
            </Picker>
            <Picker
                selectedValue={selectedWard}
                onValueChange={(itemValue) => setSelectedWard(itemValue)}
            >
                <Picker.Item label="Select Ward/Commune" value="" />
                {Array.isArray(wards) && wards.map((ward) => (
                    <Picker.Item key={ward.id} label={ward.name} value={ward.id} />
                ))}
            </Picker>
            <TextInput
                placeholder="Enter the house number and street name"
                value={street}
                onChangeText={setStreet}
                style={styles.input}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginTop: 8,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 4,
        marginTop: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default DeliveryAddress;
