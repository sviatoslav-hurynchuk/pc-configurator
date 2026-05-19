import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import * as api from '../services/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API calls
vi.mock('../services/api', () => ({
    fetchComponents: vi.fn(),
    fetchOrders: vi.fn(),
    fetchAdminPages: vi.fn(),
    deleteComponent: vi.fn(),
    deletePage: vi.fn(),
    updateAdminOrderStatus: vi.fn(),
}));

const mockComponents = [
    { id: 1, name: 'Intel Core i5', category_id: 1, price: '5000', description: 'CPU', image_url: null, specs: {} }
];

const mockOrders = [
    { id: 101, user_name: 'John Doe', user_email: 'john@test.com', total_price: '15000', status: 'processing', created_at: '2026-05-19 12:00:00' },
    { id: 102, user_name: 'Jane Doe', user_email: 'jane@test.com', total_price: '20000', status: 'accepted', created_at: '2026-05-19 13:00:00' }
];

const mockPages = [
    { id: 1, slug: 'about-us', title: 'Про нас', content: 'Текст', is_news: 0, created_at: '2026-05-19' }
];

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        api.fetchComponents.mockResolvedValue(mockComponents);
        // @ts-ignore
        api.fetchOrders.mockResolvedValue(mockOrders);
        // @ts-ignore
        api.fetchAdminPages.mockResolvedValue({ status: 'success', data: mockPages });
    });

    const renderAdminPage = () => {
        return render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );
    };

    it('renders dashboard with correct statistics', async () => {
        renderAdminPage();

        // Wait for loading to finish by waiting for the dashboard content
        await waitFor(() => {
            expect(screen.queryByText(/Завантаження.../i)).not.toBeInTheDocument();
        });

        // Dashboard text should be present
        expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();

        // Check stats: 1 component, 2 orders
        expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Components count
        expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Orders count
    });

    it('switches to orders tab and changes order status', async () => {
        // @ts-ignore
        api.updateAdminOrderStatus.mockResolvedValue({ status: 'success' });
        
        renderAdminPage();

        await waitFor(() => {
            expect(screen.queryByText(/Завантаження.../i)).not.toBeInTheDocument();
        });

        // Click on "Замовлення" tab in sidebar
        const ordersTab = screen.getByText('Замовлення');
        fireEvent.click(ordersTab);

        // Check if we are on Orders tab (the table header changes or title changes)
        // In the table, John Doe should be 'В обробці'
        expect(screen.getByText('В обробці')).toBeInTheDocument();

        // The button "Прийняти" should exist for 'processing' order
        const acceptButton = screen.getByTitle('Прийняти замовлення');
        expect(acceptButton).toBeInTheDocument();

        // Click "Прийняти"
        fireEvent.click(acceptButton);

        // Expect the API to be called with orderId 101 and new status 'accepted'
        await waitFor(() => {
            expect(api.updateAdminOrderStatus).toHaveBeenCalledWith(101, 'accepted');
        });
        
        // It fetches orders again after successful update
        expect(api.fetchOrders).toHaveBeenCalledTimes(2); // 1 initial + 1 after update
    });

    it('switches to pages tab and displays pages', async () => {
        renderAdminPage();

        await waitFor(() => {
            expect(screen.queryByText(/Завантаження.../i)).not.toBeInTheDocument();
        });

        // Click on "Сторінки / Новини" tab
        const pagesTab = screen.getByText('Сторінки / Новини');
        fireEvent.click(pagesTab);

        // Check if the page "Про нас" is rendered
        expect(screen.getByText('Про нас')).toBeInTheDocument();
        expect(screen.getByText('/pages/about-us')).toBeInTheDocument();
    });
});
