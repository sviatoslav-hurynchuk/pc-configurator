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
export const fetchUserOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, fetchOptions('GET'));
    return response.json();
};
export const saveBuild = async (data: { componentIds: number[], totalPrice: number, status: string}) => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, fetchOptions('POST', data));
    return response.json();
};
export const updateOrderStatus = async (orderId: number, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/orders/status`, fetchOptions('POST', { orderId, status }));
    return response.json();
};

// ==========================================
// ADMIN API
// ==========================================
export const fetchOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders`, fetchOptions('GET'));
    return response.json();
};

export const createComponent = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/components`, fetchOptions('POST', data));
    return response.json();
};

export const updateComponent = async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/components/${id}`, fetchOptions('POST', data));
    return response.json();
};

export const deleteComponent = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/components/${id}`, fetchOptions('DELETE'));
    return response.json();
};

export const uploadImage = async (file: File): Promise<{ status: string; url?: string; message?: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    return response.json();
};

// ==========================================
// PAGES & NEWS API
// ==========================================
export const fetchPages = async () => {
    const response = await fetch(`${API_BASE_URL}/api/pages`, fetchOptions('GET'));
    return response.json();
};

export const fetchPageBySlug = async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`, fetchOptions('GET'));
    return response.json();
};

export const fetchAdminPages = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages`, fetchOptions('GET'));
    return response.json();
};

export const createPage = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages`, fetchOptions('POST', data));
    return response.json();
};

export const updatePage = async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages/${id}`, fetchOptions('POST', data));
    return response.json();
};

export const deletePage = async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages/${id}`, fetchOptions('DELETE'));
    return response.json();
};