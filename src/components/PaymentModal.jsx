// src/components/PaymentModal.jsx
import { useState } from "react";

function PaymentModal({ product, quantity, total, method, onClose }) {
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      const order = {
        productId: product.id,
        quantity,
        total,
        method,
        status: "Pending",
        date: new Date().toISOString(),
      };
      // Save to localStorage or state management in real app
      console.log("Order saved:", order);
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {method === "card" ? "Card Payment" : "Confirm Cash Payment"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {method === "card" ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Card Number</label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, number: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-gray-700 mb-2">Expiry</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, expiry: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="123"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Pay ${total}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Total: ${total}</p>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Confirm Cash Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
