import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConfiguratorPage from '../pages/ConfiguratorPage';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API calls
vi.mock('../services/api', () => ({
    fetchComponents: vi.fn(),
    logoutUser: vi.fn(),
    saveBuild: vi.fn()
}));

const mockComponents = [
    {
        id: 1,
        name: 'Intel Core i5-12400F',
        category_id: 1,
        price: '5000.00',
        description: 'CPU',
        image_url: null,
        specs: { socket: 'LGA1700', power_draw: 65 }
    },
    {
        id: 2,
        name: 'NVIDIA RTX 4090', // High power draw
        category_id: 3, // Відеокарта
        price: '70000.00',
        description: 'GPU',
        image_url: null,
        power_draw_watts: 450,
        specs: {}
    },
    {
        id: 3,
        name: 'ASUS B450 (AM4)',
        category_id: 2, // Материнська плата
        price: '3000.00',
        description: 'Mobo',
        image_url: null,
        specs: { socket: 'AM4', ram_type: 'DDR4' }
    },
    {
        id: 4,
        name: 'Corsair 400W',
        category_id: 10, // Блок живлення
        price: '1500.00',
        description: 'PSU',
        image_url: null,
        specs: { wattage: 400 }
    }
];

describe('ConfiguratorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        api.fetchComponents.mockResolvedValue(mockComponents);
    });

    const renderWithContext = (ui: React.ReactNode, user = null) => {
        return render(
            <MemoryRouter>
                <AuthContext.Provider value={{ user, setUser: vi.fn(), loading: false }}>
                    {ui}
                </AuthContext.Provider>
            </MemoryRouter>
        );
    };

    it('renders the configurator and loads components', async () => {
        renderWithContext(<ConfiguratorPage />);
        
        expect(screen.getByText(/Завантаження\.\.\./i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.queryByText(/Завантаження\.\.\./i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Процесор')).toBeInTheDocument();
        expect(screen.getByText('Відеокарта')).toBeInTheDocument();
    });

    it('adds a component to the build and updates total price', async () => {
        renderWithContext(<ConfiguratorPage />);
        await waitFor(() => expect(screen.queryByText(/Завантаження\.\.\./i)).not.toBeInTheDocument());

        fireEvent.click(screen.getByText('Процесор'));
        const selectButtons = await screen.findAllByText('+ Обрати');
        fireEvent.click(selectButtons[0]);

        await waitFor(() => {
            const priceElements = screen.getAllByText(/5000 ₴/);
            expect(priceElements.length).toBeGreaterThan(0);
        });
        
        expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('shows compatibility error for CPU and Motherboard socket mismatch', async () => {
        renderWithContext(<ConfiguratorPage />);
        await waitFor(() => expect(screen.queryByText(/Завантаження\.\.\./i)).not.toBeInTheDocument());

        // Select CPU (LGA1700)
        fireEvent.click(screen.getByText('Процесор'));
        let selectButtons = await screen.findAllByText('+ Обрати');
        fireEvent.click(selectButtons[0]);

        // Select Motherboard (AM4)
        fireEvent.click(screen.getByText('Материнська плата'));
        selectButtons = await screen.findAllByText('+ Обрати');
        fireEvent.click(selectButtons[0]);

        // Should show error message
        await waitFor(() => {
            expect(screen.getByText(/Процесор \(сокет LGA1700\) не підходить до материнської плати \(сокет AM4\)/i)).toBeInTheDocument();
        });

        // The save button should be disabled
        const saveButton = screen.getByText('Зберегти збірку');
        expect(saveButton).toBeDisabled();
    });

    it('shows warning if Power Supply wattage is insufficient', async () => {
        renderWithContext(<ConfiguratorPage />);
        await waitFor(() => expect(screen.queryByText(/Завантаження\.\.\./i)).not.toBeInTheDocument());

        // Select GPU (450W)
        fireEvent.click(screen.getByText('Відеокарта'));
        let selectButtons = await screen.findAllByText('+ Обрати');
        fireEvent.click(selectButtons[0]);

        // Select PSU (400W)
        fireEvent.click(screen.getByText('Блок живлення'));
        selectButtons = await screen.findAllByText('+ Обрати');
        fireEvent.click(selectButtons[0]);

        // Total wattage is 450W, PSU is 400W -> Error
        await waitFor(() => {
            expect(screen.getByText(/Блоку живлення на 400 Вт недостатньо/i)).toBeInTheDocument();
        });
    });

    it('opens auth modal if unauthenticated user tries to save a valid build', async () => {
        renderWithContext(<ConfiguratorPage />, null); // User is null
        await waitFor(() => expect(screen.queryByText(/Завантаження\.\.\./i)).not.toBeInTheDocument());

        // Select a component so the build is not empty
        fireEvent.click(screen.getByText('Процесор'));
        const selectButtons = await screen.findAllByText('+ Обрати');
        fireEvent.click(selectButtons[0]);

        const saveButton = screen.getByText('Зберегти збірку');
        fireEvent.click(saveButton);

        // Auth Modal should open (we look for "Вхід / Реєстрація" or similar text from the modal)
        await waitFor(() => {
            expect(screen.getByText('Вхід')).toBeInTheDocument(); // assuming AuthModal has a "Вхід" title/tab
        });
    });
});
