import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const fetchComponents = async () => {
    try {
        // axios сам перевіряє статуси (якщо помилка 404/500 - він одразу кине в catch)
        // axios сам парсить JSON
        const response = await axios.get(`${API_BASE_URL}/index.php`);

        // response.data - це стандартна обгортка axios
        // response.data.data - це масив товарів з нашого PHP (бо ми віддавали {status: 'success', data: [...]})
        return response.data.data;
    } catch (error) {
        console.error("Помилка при завантаженні товарів через axios:", error);
        return [];
    }
};