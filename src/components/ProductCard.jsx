// src/components/ProductCard.jsx
function ProductCard({ product, onClick, onAddToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={onClick}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            View
          </button>
          <button
            onClick={onAddToCart}
            className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
