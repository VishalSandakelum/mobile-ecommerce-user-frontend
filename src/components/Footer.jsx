// src/components/Footer.jsx
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">ShopNow</h3>
            <p className="text-gray-400">
              Your one-stop shop for all your electronic needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-400 hover:text-white transition"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-gray-400 hover:text-white transition"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-gray-400 hover:text-white transition"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Contact Us</li>
              <li className="text-gray-400">Returns & Refunds</li>
              <li className="text-gray-400">Shipping Info</li>
              <li className="text-gray-400">FAQ</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <p className="text-gray-400">Email: support@shopnow.com</p>
            <p className="text-gray-400">Phone: (555) 123-4567</p>
            <p className="text-gray-400">123 Shopping Street</p>
            <p className="text-gray-400">City, State 12345</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ShopNow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
