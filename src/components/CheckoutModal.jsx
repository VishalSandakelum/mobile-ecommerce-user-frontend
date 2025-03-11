import React, { useState } from "react";
import axios from "axios";

const CheckoutModal = ({ product, quantity = 1, onClose, onSuccess }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [currentStep, setCurrentStep] = useState("checkout"); // checkout, cardPayment, processing, success, error
  const [orderQuantity, setOrderQuantity] = useState(quantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [successData, setSuccessData] = useState(null);

  // Calculate totals
  const subtotal = product.price * orderQuantity;
  const deliveryFee = 350; // Example delivery fee
  const total = subtotal + deliveryFee;

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock_quantity) {
      setOrderQuantity(value);
    }
  };

  // Increment quantity
  const incrementQuantity = () => {
    if (orderQuantity < product.stock_quantity) {
      setOrderQuantity(orderQuantity + 1);
    }
  };

  // Decrement quantity
  const decrementQuantity = () => {
    if (orderQuantity > 1) {
      setOrderQuantity(orderQuantity - 1);
    }
  };

  // Handle card details change
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  // Validate card payment details
  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
      setError("Please enter a valid card number");
      return false;
    }
    if (!cardDetails.cardHolder) {
      setError("Please enter the card holder name");
      return false;
    }
    if (!cardDetails.expiryDate) {
      setError("Please enter the expiry date");
      return false;
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setError("Please enter a valid CVV");
      return false;
    }
    return true;
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (selectedPaymentMethod === "card") {
      setCurrentStep("cardPayment");
    } else {
      // Proceed with cash on delivery checkout
      processOrder("Cash");
    }
  };

  // Process payment and create order
  const processOrder = async (paymentMethod) => {
    if (paymentMethod === "card" && !validateCardDetails()) {
      return;
    }

    setError(null);
    setLoading(true);
    setCurrentStep("processing");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");

    if (!token || !userId) {
      setError("Please login to place an order");
      setLoading(false);
      setCurrentStep(paymentMethod === "card" ? "cardPayment" : "checkout");
      return;
    }

    try {
      // Create order
      const orderResponse = await axios.post(
        "http://localhost:5000/api/order/create",
        {
          orderItems: [
            {
              product_id: product._id,
              quantity: orderQuantity,
              subtotal_price: subtotal,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Order successful, now process payment
      const orderId = orderResponse.data.order._id;

      const paymentResponse = await axios.post(
        "http://localhost:5000/api/payment/add",
        {
          order_id: orderId,
          user_id: userId,
          amount: total,
          payment_method: paymentMethod === "card" ? "Card" : "Cash",
          payment_status: paymentMethod === "card" ? "Completed" : "Pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set success data
      setSuccessData({
        order: orderResponse.data.order,
        payment: paymentResponse.data.payment,
      });

      setCurrentStep("success");
      if (onSuccess) {
        onSuccess(orderResponse.data.order);
      }
    } catch (err) {
      console.error("Order/payment error:", err);

      let errorMessage = "Failed to process your order. Please try again.";

      // Check for specific error messages from the backend
      if (err.response && err.response.data && err.response.data.message) {
        // Extract the specific error message about insufficient stock
        if (err.response.data.message.includes("Insufficient stock")) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
      setCurrentStep(paymentMethod === "card" ? "cardPayment" : "checkout");
    } finally {
      setLoading(false);
    }
  };

  // Render different steps of the checkout process
  const renderContent = () => {
    switch (currentStep) {
      case "checkout":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Checkout</h2>

              <div className="flex mb-4">
                <div className="w-1/3">
                  {product.image_base64 ? (
                    <img
                      src={`${product.image_base64}`}
                      alt={product.name}
                      className="h-32 object-contain"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="w-2/3 pl-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Price: Rs. {product.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Available: {product.stock_quantity} units
                  </p>

                  <div className="flex items-center mt-2">
                    <span className="text-sm mr-2">Quantity:</span>
                    <button
                      onClick={decrementQuantity}
                      className="bg-gray-200 px-2 py-1 rounded-l"
                      disabled={orderQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock_quantity}
                      value={orderQuantity}
                      onChange={handleQuantityChange}
                      className="w-12 text-center border-t border-b py-1"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="bg-gray-200 px-2 py-1 rounded-r"
                      disabled={orderQuantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Fee:</span>
                  <span>Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={selectedPaymentMethod === "card"}
                      onChange={() => setSelectedPaymentMethod("card")}
                      className="mr-2"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={selectedPaymentMethod === "cash"}
                      onChange={() => setSelectedPaymentMethod("cash")}
                      className="mr-2"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!selectedPaymentMethod}
              >
                Proceed to Payment
              </button>
            </div>
          </>
        );

      case "cardPayment":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Card Payment</h2>

              <div className="border-b border-gray-200 pb-3 mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Order Total:</span>
                  <span className="font-bold">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardDetailsChange}
                    className="w-full p-2 border rounded"
                    maxLength="16"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={handleCardDetailsChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleCardDetailsChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleCardDetailsChange}
                      className="w-full p-2 border rounded"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep("checkout")}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => processOrder("card")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Pay & Place Order
              </button>
            </div>
          </>
        );

      case "processing":
        return (
          <div className="text-center py-8">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Processing Your Order</h2>
            <p className="text-gray-600 mt-2">
              Please wait while we process your order...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been placed
              successfully.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
              <div className="flex justify-between mb-2">
                <span>Order ID:</span>
                <span className="font-medium">{successData?.order?._id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Payment Method:</span>
                <span className="font-medium">
                  {successData?.payment?.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">
                  Rs. {successData?.payment?.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {currentStep !== "success" && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default CheckoutModal;
