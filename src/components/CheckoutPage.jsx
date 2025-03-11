import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [currentStep, setCurrentStep] = useState("checkout"); // checkout, cardPayment, processing, success, error
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [successData, setSuccessData] = useState(null);

  // Delivery fee constant
  const deliveryFee = 350;

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You need to login to view your cart");
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/cart/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.cartItems) {
        // Transform API data structure to match component needs
        const transformedCart = response.data.cartItems.map((item) => ({
          id: item.product_id._id,
          name: item.product_id.name,
          price: item.product_id.price,
          image: item.product_id.image_base64,
          quantity: item.quantity,
          cartItemId: item._id,
          stock: item.product_id.stock_quantity,
        }));

        setCart(transformedCart);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError(err.response?.data?.message || "Failed to load cart items");
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + deliveryFee;

  // Handle delivery details change
  const handleDeliveryDetailsChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails({
      ...deliveryDetails,
      [name]: value,
    });
  };

  // Handle card details change
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  // Validate delivery details
  const validateDeliveryDetails = () => {
    if (!deliveryDetails.address) {
      setError("Please enter your delivery address");
      return false;
    }
    if (!deliveryDetails.city) {
      setError("Please enter your city");
      return false;
    }
    if (!deliveryDetails.postalCode) {
      setError("Please enter your postal code");
      return false;
    }
    if (!deliveryDetails.phoneNumber) {
      setError("Please enter your phone number");
      return false;
    }
    return true;
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
    if (!validateDeliveryDetails()) {
      return;
    }

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
      navigate("/login");
      return;
    }

    try {
      // Prepare order items
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        subtotal_price: item.price * item.quantity,
      }));

      // Create order
      const orderResponse = await axios.post(
        "http://localhost:5000/api/order/create",
        {
          orderItems,
          deliveryAddress: `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.postalCode}`,
          contactNumber: deliveryDetails.phoneNumber,
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
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter your address"
                      value={deliveryDetails.address}
                      onChange={handleDeliveryDetailsChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={deliveryDetails.city}
                        onChange={handleDeliveryDetailsChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal code"
                        value={deliveryDetails.postalCode}
                        onChange={handleDeliveryDetailsChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="Phone number for delivery"
                      value={deliveryDetails.phoneNumber}
                      onChange={handleDeliveryDetailsChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex items-center">
                      <div className="w-16 h-16 mr-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>Rs. {deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={selectedPaymentMethod === "card"}
                      onChange={() => setSelectedPaymentMethod("card")}
                      className="mr-3"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={selectedPaymentMethod === "cash"}
                      onChange={() => setSelectedPaymentMethod("cash")}
                      className="mr-3"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => navigate("/cart")}
                  className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Back to Cart
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {selectedPaymentMethod === "card"
                    ? "Continue to Payment"
                    : "Place Order"}
                </button>
              </div>
            </div>
          </>
        );

      case "cardPayment":
        return (
          <>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
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

              <div className="flex justify-between mt-6">
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
            </div>
          </>
        );

      case "processing":
        return (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Processing Your Order</h2>
            <p className="text-gray-600 mt-2">
              Please wait while we process your order...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
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
              onClick={() => navigate("/")}
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

  if (loading && currentStep !== "processing") {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      {renderContent()}
    </div>
  );
}

export default CheckoutPage;
