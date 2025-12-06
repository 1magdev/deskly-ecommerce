import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackofficeLayout } from "@/components/layout/BackofficeLayout";
import { LoginPage } from "@/pages/backoffice/Auth/LoginPage";
import { ProductFormPage } from "@/pages/backoffice/Products/ProductFormPage";
import { ProductListPage } from "@/pages/backoffice/Products/ProductListPage";
import { ProductViewPage } from "@/pages/backoffice/Products/ProductViewPage";
import { UserFormPage } from "@/pages/backoffice/Users/UserFormPage";
import { UsersPage } from "@/pages/backoffice/Users/UsersPage";
import { OrdersPage } from "@/pages/backoffice/Orders/OrdersPage";
import { Navigate, Route } from "react-router-dom";

export default function backofficeRoutes() {
  return (
    <>
      <Route path="/backoffice/" element={<LoginPage />} />

      {/* Rota dashboard protegida - requer ADMIN ou BACKOFFICE */}
      <Route
        path="/backoffice/dashboard"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "BACKOFFICE"]}>
            <Navigate to="/backoffice/products" replace />
          </ProtectedRoute>
        }
      />
      {/* Rotas protegidas - requer autenticação */}
      <Route
        path="/backoffice/"
        element={
          <ProtectedRoute>
            <Navigate to="/backoffice/products" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/products"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "BACKOFFICE"]}>
            <BackofficeLayout>
              <ProductListPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/products/new"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "BACKOFFICE"]}>
            <BackofficeLayout>
              <ProductFormPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/products/:id/edit"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "BACKOFFICE"]}>
            <BackofficeLayout>
              <ProductFormPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/products/:id"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "BACKOFFICE"]}>
            <BackofficeLayout>
              <ProductViewPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/orders"
        element={
          <ProtectedRoute requiredRole={["BACKOFFICE"]}>
            <BackofficeLayout>
              <OrdersPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/users"
        element={
          <ProtectedRoute requiredRole={["ADMIN"]}>
            <BackofficeLayout>
              <UsersPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/users/new"
        element={
          <ProtectedRoute requiredRole={["ADMIN"]}>
            <BackofficeLayout>
              <UserFormPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/users/:id/edit"
        element={
          <ProtectedRoute requiredRole={["ADMIN"]}>
            <BackofficeLayout>
              <UserFormPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
    </>
  );
}
