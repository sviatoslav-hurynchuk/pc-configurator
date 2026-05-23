import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConfiguratorPage from './pages/ConfiguratorPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import CatalogPage from './pages/CatalogPage';
import PagesPage from './pages/PagesPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ConfiguratorPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/pages" element={<PagesPage />} />
                <Route path="/pages/:slug" element={<PagesPage />} />

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