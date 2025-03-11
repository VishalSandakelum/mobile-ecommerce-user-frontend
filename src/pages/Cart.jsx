import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You need to login to view your cart");
        setLoading(false);
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

  const getCartItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You need to login to view your cart");
        return null;
      }

      const response = await axios.post(
        "http://localhost:5000/api/cart/one",
        {
          user_id: localStorage.getItem("user_id") || "",
          product_id: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.cartItem) {
        return response.data.cartItem;
      }

      return null;
    } catch (err) {
      console.error("Error fetching cart item:", err);
      return null;
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await removeItem(id);
        return;
      }

      // Get the current item from state to check stock
      const item = cart.find((item) => item.id === id);
      if (item && newQuantity > item.stock) {
        setError(`Sorry, only ${item.stock} items available in stock`);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You need to login to update your cart");
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      await axios.put(
        `http://localhost:5000/api/cart/update`,
        {
          user_id: "",
          product_id: id,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err.response?.data?.message || "Failed to update quantity");
      fetchCartItems();
    }
  };

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You need to login to remove items from your cart");
        return;
      }

      setCart(cart.filter((item) => item.id !== id));

      await axios.delete(`http://localhost:5000/api/cart/remove`, {
        data: { product_id: id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCartItems();
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err.response?.data?.message || "Failed to remove item");
      fetchCartItems();
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      {/* Show error message if there's an error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span>{error}</span>
          <button
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">Your cart is empty.</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h3>
                    <p className="text-gray-600">LKR {item.price}</p>
                    {item.stock < 5 && (
                      <p className="text-red-600 text-sm">
                        Only {item.stock} left in stock
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-gray-800 font-semibold">
                    LKR {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">
                Total:
              </span>
              <span className="text-2xl font-bold text-gray-800">
                LKR {total.toFixed(2)}
              </span>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
