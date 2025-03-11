import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const user_id = JSON.parse(atob(token.split(".")[1])).id; // Extract user ID from token

      const response = await axios.post(
        "http://localhost:5000/api/order/all/user",
        { user_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        console.log(response.data);
        setOrders(response.data.orders);
      } else if (response.data && response.data.message) {
        setOrders([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch orders. Please try again later."
      );
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    console.log("Cancelling order:", orderId);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.delete(
        "http://localhost:5000/api/order/delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { orderId },
        }
      );

      if (response.data && response.data.message) {
        // Update the local state to reflect the canceled order
        setOrders(orders.filter((order) => order._id !== orderId));
        alert("Order canceled successfully");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel order. Please try again later."
      );
      console.error("Error canceling order:", err);
    }
  };

  // Check if order is within 24 hours and can be canceled
  const canCancelOrder = (orderDate) => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - orderTime) / (1000 * 60 * 60);

    return hoursDifference <= 24;
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <div className="animate-pulse text-2xl text-gray-600">
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Orders</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button className="underline text-red-800 mt-2" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
          <Link
            to="/shop"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isCancelable = canCancelOrder(order.order_date);

            return (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID:{" "}
                        <span className="font-mono">{order._id.slice(-8)}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed: {formatDate(order.order_date)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        Total: ${order.total_price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.payment ? "Payment Complete" : "Payment Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Items
                  </h3>
                  <div className="space-y-3">
                    {order.items &&
                      order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            {item.product_id?.image_base64 ? (
                              <img
                                src={`${item.product_id.image_base64}`}
                                alt={item.product_id.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product_id?.name || "Product Unavailable"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ${item.product_id?.price?.toFixed(2) || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.product_id?.description?.substring(0, 60) ||
                                "No description available"}
                              {item.product_id?.description?.length > 60
                                ? "..."
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 flex justify-end">
                  {order.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={!isCancelable}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isCancelable
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isCancelable ? "Cancel Order" : "Cannot Cancel (>24h)"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
