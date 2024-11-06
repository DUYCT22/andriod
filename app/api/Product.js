const fetchData = async (type, id) => {
    let url = "http://localhost:8082/api/products";

    // Nếu có type và id, thay đổi URL để gọi API cụ thể
    if (type && id) {
        url = `http://localhost:8082/api/${type}/${id}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data; // Trả về dữ liệu JSON
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Có thể trả về lỗi để xử lý trong nơi gọi hàm
    }
};

export default fetchData;