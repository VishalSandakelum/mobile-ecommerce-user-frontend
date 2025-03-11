import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar({ cart, setIsLoginModalOpen }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token and user details in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setUser({
        name: localStorage.getItem("name") || "User",
        email: localStorage.getItem("email") || "user@example.com",
      });
    }
  }, []);

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    // Update state
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 transition-transform hover:scale-105 duration-300"
        >
          SHOP NOW
        </Link>

        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 hover:translate-y-1 relative after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
          >
            Shop
          </Link>
          <Link to="/cart" className="relative group">
            <span className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 hover:translate-y-1">
              Cart
            </span>
            {cart.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transform transition-all duration-300 group-hover:scale-110">
                {cart.length}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className="text-gray-700 hover:text-blue-600 font-medium transition duration-200 hover:translate-y-1 relative after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
          >
            Orders
          </Link>

          {isLoggedIn ? (
            <div className="group relative">
              <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center">
                <span>{user?.name}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-4 border border-gray-100 transform transition-all duration-300 origin-top-right">
                <div className="flex items-center border-b border-gray-100 pb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-600 font-bold">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-800 font-medium">{user?.name}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-red-600 font-medium flex items-center transition duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-md transform transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
