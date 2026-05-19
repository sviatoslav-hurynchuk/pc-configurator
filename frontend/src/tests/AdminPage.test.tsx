import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';
import * as api from '../services/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
        (api.fetchComponents as any).mockResolvedValue(mockComponents);
        (api.fetchOrders as any).mockResolvedValue(mockOrders);
        (api.fetchAdminPages as any).mockResolvedValue({ status: 'success', data: mockPages });
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

        await waitFor(() => {
            expect(screen.queryByText(/Завантаження.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();

        expect(screen.getAllByText('1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('switches to orders tab and changes order status', async () => {
        (api.updateAdminOrderStatus as any).mockResolvedValue({ status: 'success' });
        
        renderAdminPage();

        await waitFor(() => {
            expect(screen.queryByText(/Завантаження.../i)).not.toBeInTheDocument();
        });

        const ordersTab = screen.getByText('Замовлення');
        fireEvent.click(ordersTab);

        expect(screen.getByText('В обробці')).toBeInTheDocument();

        const acceptButton = screen.getByTitle('Прийняти замовлення');
        expect(acceptButton).toBeInTheDocument();

        fireEvent.click(acceptButton);

        await waitFor(() => {
            expect(api.updateAdminOrderStatus).toHaveBeenCalledWith(101, 'accepted');
        });
        
        expect(api.fetchOrders).toHaveBeenCalledTimes(2);
    });

    it('switches to pages tab and displays pages', async () => {
        renderAdminPage();

        await waitFor(() => {
            expect(screen.queryByText(/Завантаження.../i)).not.toBeInTheDocument();
        });

        const pagesTab = screen.getByText('Сторінки / Новини');
        fireEvent.click(pagesTab);

        expect(screen.getByText('Про нас')).toBeInTheDocument();
        expect(screen.getByText('/pages/about-us')).toBeInTheDocument();
    });
});
