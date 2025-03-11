import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductPopup from "../components/ProductPopup";
import LoginModal from "../components/LoginModal";
import CheckoutModal from "../components/CheckoutModal";

const MobileShopHomepage = () => {
  const [priceRange, setPriceRange] = useState([6000, 290000]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(0); // Default to "ALL" (id: 0)
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [productForCart, setProductForCart] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [checkoutProduct, setCheckoutProduct] = useState(null); // State for the product being checked out

  // Mobile brands data
  const brands = [
    { id: 0, name: "All", logo: "ALL", color: "text-black-500" },
    { id: 1, name: "Vivo", logo: "vivo", color: "text-blue-500" },
    { id: 2, name: "Apple", logo: "apple", color: "text-gray-800" },
    { id: 3, name: "Mi", logo: "mi", color: "text-orange-500" },
    { id: 4, name: "Samsung", logo: "samsung", color: "text-blue-800" },
    { id: 5, name: "Huawei", logo: "huawei", color: "text-black" },
    { id: 7, name: "Oppo", logo: "oppo", color: "text-green-600" },
    { id: 8, name: "ZTE", logo: "zte", color: "text-blue-700" },
    { id: 9, name: "Infinix", logo: "infinix", color: "text-purple-600" },
    { id: 10, name: "Lenovo", logo: "lenovo", color: "text-red-600" },
    { id: 11, name: "Nokia", logo: "nokia", color: "text-blue-500" },
    { id: 12, name: "Tecno", logo: "tecno", color: "text-blue-400" },
  ];

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/product/all"
        );

        // Filter out deleted products
        const activeProducts = response.data.filter(
          (product) => !product.is_deleted
        );
        setProducts(activeProducts);
        setFilteredProducts(activeProducts); // Initialize filtered products with all products
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when selectedBrand changes
  useEffect(() => {
    if (selectedBrand === 0) {
      // If "All" is selected, show all products
      setFilteredProducts(products);
    } else {
      // Otherwise, filter by the selected brand
      const filtered = products.filter((product) => {
        // Check if the product has a brand_id that matches the selected brand
        return (
          (product.brand_id && product.brand_id === selectedBrand) ||
          (product.brand && product.brand.id === selectedBrand) ||
          (product.category_id &&
            product.category_id.name ===
              brands.find((b) => b.id === selectedBrand)?.name)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [selectedBrand, products]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle brand selection
  const handleBrandSelect = (brandId) => {
    setSelectedBrand(brandId);
  };

  // Show quantity selection modal for cart
  const handleAddToCartClick = (product) => {
    // Check if the product is in stock
    if (product.stock_quantity <= 0) {
      setNotification({
        show: true,
        message: "This product is out of stock",
        type: "error",
      });
      return;
    }

    setProductForCart(product);
    setSelectedQuantity(1);
    setQuantityModalOpen(true);
  };

  // Handle Buy Now button click
  const handleBuyNowClick = (product) => {
    // Check if the product is in stock
    if (product.stock_quantity <= 0) {
      setNotification({
        show: true,
        message: "This product is out of stock",
        type: "error",
      });
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");

    if (!token || !userId) {
      setIsLoginModalOpen(true);
      // Save product for later after login
      setProductForCart(product);
      return;
    }

    // Set the product to be checked out
    setCheckoutProduct(product);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= productForCart.stock_quantity) {
      setSelectedQuantity(value);
    }
  };

  // Increment quantity
  const incrementQuantity = () => {
    if (selectedQuantity < productForCart.stock_quantity) {
      setSelectedQuantity(selectedQuantity + 1);
    }
  };

  // Decrement quantity
  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(selectedQuantity - 1);
    }
  };

  // Add to cart with API call
  const confirmAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");

    // If no token, show login modal
    if (!token || !userId) {
      setQuantityModalOpen(false);
      setIsLoginModalOpen(true);
      return;
    }

    try {
      setAddingToCart(true);

      const response = await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          user_id: userId,
          product_id: productForCart._id,
          quantity: selectedQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local cart state
      const existingItemIndex = cart.findIndex(
        (item) => item.product._id === productForCart._id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += selectedQuantity;
        setCart(updatedCart);
      } else {
        // Add new item to cart
        setCart([
          ...cart,
          { product: productForCart, quantity: selectedQuantity },
        ]);
      }

      setNotification({
        show: true,
        message: "Product added to cart successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error adding to cart:", err);

      // Handle different error scenarios
      if (err.response && err.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("id");
        setIsLoginModalOpen(true);
        setNotification({
          show: true,
          message: "Please login to add items to cart",
          type: "error",
        });
      } else {
        setNotification({
          show: true,
          message:
            err.response?.data?.message || "Failed to add product to cart",
          type: "error",
        });
      }
    } finally {
      setAddingToCart(false);
      setQuantityModalOpen(false);
    }
  };

  // Handle user login success
  const handleLoginSuccess = (user) => {
    console.log("User logged in:", user.name);
    // If we had a pending cart operation, retry it
    if (productForCart) {
      setTimeout(() => {
        if (checkoutProduct) {
          // If there was a pending checkout, process that
          handleBuyNowClick(productForCart);
        } else {
          // Otherwise, process add to cart
          handleAddToCartClick(productForCart);
        }
      }, 500);
    }
  };

  // Handle successful checkout
  const handleCheckoutSuccess = (order) => {
    console.log("Order placed successfully:", order);
    // Maybe update the product quantity here if needed
  };

  // Get product status label and color
  const getStockLabel = (quantity) => {
    if (quantity === 0) {
      return { text: "Out of Stock", color: "bg-red-100 text-red-600" };
    } else if (quantity <= 10) {
      return { text: "Low Stock", color: "bg-orange-100 text-orange-600" };
    } else {
      return { text: "Available", color: "bg-green-300 text-green-600" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center py-4">
            <div className="flex-1">
              <img
                src="./assets/img/banner.jpg"
                alt="Banner"
                className="w-full h-[300px] object-cover object-center"
              />
            </div>
          </div>
          <div className="border-t border-gray-200 py-2 text-sm">
            <span className="text-gray-600">
              SHOP NOW COMPUTERS | SHOP NOW LAPTOP HOUSE
            </span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-md shadow-md z-50 ${
            notification.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ALL MOBILE PHONES & TAB
          </h2>
          {selectedBrand !== 0 && (
            <p className="text-gray-600 mt-2">
              Showing products from:{" "}
              {brands.find((b) => b.id === selectedBrand)?.name}
            </p>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded shadow-sm mb-6">
          <h3 className="mb-4 font-semibold">Choose by Category :</h3>

          <div className="grid grid-cols-12 gap-4 mb-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col items-center"
                onClick={() => handleBrandSelect(brand.id)}
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center border rounded-lg hover:shadow-md cursor-pointer ${
                    selectedBrand === brand.id
                      ? "ring-2 ring-blue-500 shadow-md"
                      : ""
                  } ${brand.color}`}
                >
                  <span className="text-xs font-bold">
                    {brand.logo.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs mt-1">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">
                  No products found for this category.
                </p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => setSelectedBrand(0)}
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockLabel(product.stock_quantity);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded shadow-sm overflow-hidden relative"
                    >
                      {/* Stock Status */}
                      <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden">
                        <div
                          className={`absolute -left-8 top-8 rotate-[-45deg] w-40 text-center ${stockStatus.color} text-white font-bold py-1 transform origin-center`}
                        >
                          {stockStatus.text}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col items-center">
                        {product.image_base64 ? (
                          <img
                            src={`${product.image_base64}`}
                            alt={product.name}
                            className="h-32 object-contain mb-4"
                          />
                        ) : (
                          <div className="h-32 w-32 bg-gray-200 flex items-center justify-center mb-4">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <h3 className="text-xs font-semibold text-center mb-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          Category:{" "}
                          {product.category_id?.name || "Uncategorized"}
                        </p>
                        <div className="mt-auto">
                          <p className="text-sm font-bold text-red-600">
                            Price: Rs. {product.price.toLocaleString()}
                          </p>

                          <div className="flex space-x-2 mt-2">
                            <button
                              className={`bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-300 ${
                                product.stock_quantity === 0
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() => handleAddToCartClick(product)}
                              disabled={product.stock_quantity === 0}
                            >
                              Add to Cart
                            </button>
                            <button
                              className="bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-700"
                              onClick={() => setSelectedProduct(product)}
                            >
                              View More
                            </button>
                          </div>
                          <div className="mt-2 text-center">
                            <button
                              className={`bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 flex items-center mx-auto ${
                                product.stock_quantity === 0
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() => handleBuyNowClick(product)}
                              disabled={product.stock_quantity === 0}
                            >
                              <span>Buy Now</span>
                              <span className="ml-1 text-xs">/ මිළදි ගන්න</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Quantity Selection Modal */}
      {quantityModalOpen && productForCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Quantity</h2>
              <button
                onClick={() => setQuantityModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm mb-2">Product: {productForCart.name}</p>
              <p className="text-sm mb-2">
                Available: {productForCart.stock_quantity} units
              </p>
              <p className="text-sm font-bold text-red-600">
                Price: Rs. {productForCart.price.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <button
                onClick={decrementQuantity}
                className="bg-gray-200 px-3 py-1 rounded-l"
                disabled={selectedQuantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={productForCart.stock_quantity}
                value={selectedQuantity}
                onChange={handleQuantityChange}
                className="w-16 text-center border-t border-b py-1"
              />
              <button
                onClick={incrementQuantity}
                className="bg-gray-200 px-3 py-1 rounded-r"
                disabled={selectedQuantity >= productForCart.stock_quantity}
              >
                +
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setQuantityModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddToCart}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex justify-center items-center"
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Add to Cart"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Popup */}
      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(quantity) => {
            setProductForCart(selectedProduct);
            setSelectedQuantity(quantity);
            confirmAddToCart();
          }}
        />
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          quantity={1}
          onClose={() => setCheckoutProduct(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default MobileShopHomepage;
