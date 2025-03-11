// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import LoginModal from "./components/LoginModal";
import CheckoutModal from "./components/CheckoutPage";

function App() {
  const [cart, setCart] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar cart={cart} setIsLoginModalOpen={setIsLoginModalOpen} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/shop"
              element={<Shop cart={cart} setCart={setCart} />}
            />
            <Route path="/orders" element={<Orders />} />
            <Route
              path="/cart"
              element={<Cart cart={cart} setCart={setCart} />}
            />
            <Route path="/checkout" element={<CheckoutModal />} />
          </Routes>
        </main>
        <Footer />
        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
