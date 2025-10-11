import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BackofficeLayout } from '@/components/layout/BackofficeLayout';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { ProductListPage } from '@/pages/Products/ProductListPage';
import { ProductFormPage } from '@/pages/Products/ProductFormPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas protegidas - requer autenticação */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/products" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'ESTOQUISTA']}>
                  <BackofficeLayout>
                    <ProductListPage />
                  </BackofficeLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'ESTOQUISTA']}>
                  <BackofficeLayout>
                    <ProductFormPage />
                  </BackofficeLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute requiredRole={['ADMIN', 'ESTOQUISTA']}>
                  <BackofficeLayout>
                    <ProductFormPage />
                  </BackofficeLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
