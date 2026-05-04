import axios from 'axios';
import type {PcComponent} from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const fetchComponents = async (): Promise<PcComponent[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/index.php`);
        return response.data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
};