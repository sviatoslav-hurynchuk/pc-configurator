import axios from 'axios';
import type {PcComponent} from '../types';

const API_BASE_URL = 'http://localhost:8000';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const fetchOptions = (method: string, body?: any) => ({
    method,
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include' as RequestCredentials,
    ...(body && { body: JSON.stringify(body) })
});


export const registerUser = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, fetchOptions('POST', data));
    return response.json();
};

export const loginUser = async (credentials: any) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, fetchOptions('POST', credentials));
    return response.json();
};

export const logoutUser = async () => {
    const response = await fetch(`${API_BASE_URL}/api/logout`, fetchOptions('POST'));
    return response.json();
};

export const checkAuth = async () => {
    const response = await fetch(`${API_BASE_URL}/api/me`, fetchOptions('GET'));
    return response.json();
};

export const fetchComponents = async (): Promise<PcComponent[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/components`);
        return response.data.data;
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
};