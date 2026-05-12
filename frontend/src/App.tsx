import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConfiguratorPage from './pages/ConfiguratorPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ConfiguratorPage />} />

                <Route path="/admin/*" element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;