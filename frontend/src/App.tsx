import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import backofficeRoutes from "./routes/BackofficeRoutes";
import IndexPage from "./pages/IndexPage";
import CartPage from "./pages/CartPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {backofficeRoutes()}
              <Route path="/" element={<IndexPage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/carrinho" element={<CartPage />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
