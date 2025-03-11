// src/pages/Shop.jsx
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductPopup from "../components/ProductPopup";

const dummyProducts = [
  {
    id: 1,
    name: "Smartphone X",
    price: 599,
    image: "https://via.placeholder.com/300",
    description: "Latest smartphone with advanced features",
    category: "Electronics",
    specs: {
      Display: "6.5 inch",
      RAM: "8GB",
      Storage: "128GB",
    },
  },
  // Add more dummy products as needed
];

function Shop({ cart, setCart }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = dummyProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => setSelectedProduct(product)}
            onAddToCart={() => setCart([...cart, { ...product, quantity: 1 }])}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(quantity) =>
            setCart([...cart, { ...selectedProduct, quantity }])
          }
        />
      )}
    </div>
  );
}

export default Shop;
