import { useState } from "react";
import PaymentModal from "./PaymentModal";

function ProductPopup({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const total = product.price * quantity;

  const handlePurchase = (method) => {
    setPaymentMethod(method);
    setShowPayment(true);
  };

  const formatSpecs = () => {
    const specs = {};

    if (product.specifications && Array.isArray(product.specifications)) {
      product.specifications.forEach((spec) => {
        const name = spec.specification_id?.name || "Specification";
        specs[name] = spec.value;
      });
    } else if (typeof product.specs === "object") {
      return product.specs;
    }

    return specs;
  };

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 p-3">
          <h2 className="text-lg font-semibold truncate">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Product info */}
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <p className="text-gray-600 text-sm mb-2">
                {product.description}
              </p>
              <p className="text-lg font-bold text-gray-800">
                LKR {product.price}
              </p>

              {/* Stock status */}
              <div className="mt-1">
                {isOutOfStock && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                    Out of Stock
                  </span>
                )}
                {isLowStock && (
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-medium">
                    Low Stock: {product.stock_quantity} left
                  </span>
                )}
                {!isOutOfStock && !isLowStock && (
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                    Available
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col items-end">
              <div className="flex items-center mb-1">
                <label
                  htmlFor="quantity"
                  className="text-sm text-gray-600 mr-2"
                >
                  Qty:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock_quantity || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 p-1 border rounded text-center"
                />
              </div>
              <p className="font-bold text-sm">Total: LKR {total}</p>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-gray-50 rounded p-2 text-sm">
            <details>
              <summary className="font-medium cursor-pointer">
                Specifications
              </summary>
              <table className="w-full mt-2">
                <tbody>
                  {Object.entries(formatSpecs()).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-b border-gray-200 last:border-0"
                    >
                      <td className="py-1 text-gray-600">{key}</td>
                      <td className="py-1 text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex p-3 bg-gray-50 gap-2">
          <button
            onClick={() => onAddToCart(quantity)}
            className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700"
          >
            Add to Cart
          </button>

          <button
            onClick={() => handlePurchase("cash")}
            className="flex-1 bg-red-500 text-white py-2 rounded text-sm font-medium hover:bg-red-700"
            disabled={isOutOfStock}
          >
            Buy now
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          product={product}
          quantity={quantity}
          total={total}
          paymentMethod={paymentMethod}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

export default ProductPopup;
