import { useState } from "react";
import axios from "axios";

function LoginModal({ onClose, onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    address: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (
      isSignup &&
      (!formData.name || !formData.address || !formData.phone_number)
    ) {
      setError("All fields are required for signup");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let response;

      if (isSignup) {
        // Sign up request
        response = await axios.post("http://localhost:5000/api/user/signup", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "user",
          address: formData.address,
          phone_number: formData.phone_number,
        });
      } else {
        // Login request
        response = await axios.post("http://localhost:5000/api/user/login", {
          email: formData.email,
          password: formData.password,
        });
      }

      if (response.data && response.data.token) {
        // Save user details to local storage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("id", response.data.user._id);
        localStorage.setItem("name", response.data.user.name);
        localStorage.setItem("email", response.data.user.email);

        // Notify parent component about successful login
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }

        onClose();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(
        error.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isSignup ? "Sign Up" : "Login"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="phone_number"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex justify-center ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
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
            ) : isSignup ? (
              "Sign Up"
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="text-blue-600 hover:underline ml-1"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
