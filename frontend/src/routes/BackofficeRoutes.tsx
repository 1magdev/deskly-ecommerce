import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackofficeLayout } from "@/components/layout/BackofficeLayout";
import { LoginPage } from "@/pages/backoffice/Auth/LoginPage";
import { ProductFormPage } from "@/pages/backoffice/Products/ProductFormPage";
import { ProductListPage } from "@/pages/backoffice/Products/ProductListPage";
import { UserFormPage } from "@/pages/backoffice/Users/UserFormPage";
import { UsersPage } from "@/pages/backoffice/Users/UsersPage";
import { Navigate, Route } from "react-router-dom";

export default function backofficeRoutes() {
  return (
    <>
      <Route path="/backoffice/" element={<LoginPage />} />

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
          <ProtectedRoute requiredRole={["ADMIN", "ESTOQUISTA"]}>
            <BackofficeLayout>
              <ProductListPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/products/new"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "ESTOQUISTA"]}>
            <BackofficeLayout>
              <ProductFormPage />
            </BackofficeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backoffice/products/:id/edit"
        element={
          <ProtectedRoute requiredRole={["ADMIN", "ESTOQUISTA"]}>
            <BackofficeLayout>
              <ProductFormPage />
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
