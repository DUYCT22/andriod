import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { slider } from "../data";

const { width } = Dimensions.get('window');

const App = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        const json = await response.json();
        setProducts(json);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const json = await response.json();
        setCategories(json);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000EE" />
      </View>
    );
  }

  // Lọc sản phẩm theo searchText
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        setSearchText('');
        navigation.navigate('ProductDetail', { id: item.id });
      }}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
      <Text>{truncateString(item.title, 15)}</Text>
      <Text style={{ color: "red" }}>{formatCurrency(item.price)}</Text>
    </TouchableOpacity>
  );
  const renderProduct2 = ({ item }) => {
    const searchTextIndex = item.title.toLowerCase().indexOf(searchText.toLowerCase());
    let titleParts = [];
    if (searchTextIndex !== -1 && searchText) {
      titleParts = [
        item.title.slice(0, searchTextIndex),
        item.title.slice(searchTextIndex, searchTextIndex + searchText.length),
        item.title.slice(searchTextIndex + searchText.length)
      ];
    } else {
      titleParts = [item.title];
    }

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          padding: 10,
          borderRadius: 10,
          alignItems: 'center',
          flexDirection: 'row',
          borderStyle: "solid",
          borderBottomColor: "black",
          borderBottomWidth: 2,
          maxHeight: 100,
        }}
        onPress={() => {
          setSearchText('');
          navigation.navigate('ProductDetail', { id: item.id });
        }}
      >
        <Image source={{ uri: item.image }} style={{
          width: 55,
          height: 210,
        }} resizeMode="contain" />
        <Text style={{ marginLeft: 10, marginRight: 60 }}>
          {titleParts.map((part, index) => (
            <Text
              key={index}
              style={index === 1 ? { fontWeight: 'bold', color: '#0000CD', fontSize: 17 } : {}}
            >
              {part}
            </Text>
          ))}
        </Text>
      </TouchableOpacity>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };


  const truncateString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#000" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        {searchText.length > 0 && ( // Hiển thị biểu tượng "X" khi có nội dung
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="times" size={20} color="#000" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
      {searchText.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct2}
          keyExtractor={(item) => item.id.toString()}
          style={styles.searchResults}
          contentContainerStyle={styles.searchResultsContainer}
        />
      ) : (
        <View>
          {/* Slider */}
          <ScrollView>
            <Carousel
              width={width}
              height={250}
              data={slider}
              renderItem={({ item }) => (
                <View>
                  <Image source={{ uri: item.image }} style={styles.sliderImage} />
                </View>
              )}
              loop={true}
              autoPlay={true}
              autoPlayInterval={3000}
            />

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cateList}>
                {categories.map(category => (
                  <TouchableOpacity key={category} style={styles.cateItem}
                    onPress={() => navigation.navigate('ProductByCategory', { id: category })}>
                    <Text style={{ fontSize: 18 }}> {category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Product List */}
            <Text style={{ fontSize: 25, marginTop: 10 }}>All Product</Text>
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.productList}
              numColumns={2}
              scrollEnabled={false}
            />
          </ScrollView>
        </View>
      )}

    </SafeAreaView >
  );
};

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 10,
    borderColor: '#0000CD',
    borderWidth: 2,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 10,
  },
  searchResults: {
    maxHeight: 2500, // Giới hạn chiều cao cho danh sách gợi ý
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    marginVertical: 5,
  },
  searchResultsContainer: {
    padding: 10,
  },
  sliderImage: {
    width: '100%',
    height: 250,
    resizeMode: "contain"
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
  cateList: {
    flexDirection: 'row',
    marginTop: 10
  },
  cateItem: {
    width: 120,
    height: 50,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});

export default App;
