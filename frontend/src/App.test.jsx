import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// import App from './App'; // Коли створиш App.jsx

describe('Basic UI Test', () => {
    it('should pass a simple math test', () => {
        expect(1 + 1).toBe(2);
    });

    // Приклад майбутнього тесту компонента:
    // it('renders the configurator title', () => {
    //     render(<App />);
    //     expect(screen.getByText(/PC Builder/i)).toBeDefined();
    // });
});