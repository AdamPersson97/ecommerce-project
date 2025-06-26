import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  street_address: string;
  postal_code: string;
  city: string;
  country: string;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    street_address: "",
    postal_code: "",
    city: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    loadCustomerData();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  };

  const loadCustomerData = () => {
    const savedCustomerData = localStorage.getItem("customerData");
    if (savedCustomerData) {
      setCustomerData(JSON.parse(savedCustomerData));
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));

    // Spara till localStorage
    const updatedData = { ...customerData, [name]: value };
    localStorage.setItem("customerData", JSON.stringify(updatedData));

    // Rensa fel för detta fält
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!customerData.firstname.trim())
      newErrors.firstname = "Förnamn är obligatoriskt";
    if (!customerData.lastname.trim())
      newErrors.lastname = "Efternamn är obligatoriskt";
    if (!customerData.email.trim()) newErrors.email = "E-post är obligatoriskt";
    if (!customerData.phone.trim())
      newErrors.phone = "Telefon är obligatoriskt";
    if (!customerData.street_address.trim())
      newErrors.street_address = "Adress är obligatoriskt";
    if (!customerData.postal_code.trim())
      newErrors.postal_code = "Postnummer är obligatoriskt";
    if (!customerData.city.trim()) newErrors.city = "Stad är obligatoriskt";
    if (!customerData.country.trim())
      newErrors.country = "Land är obligatoriskt";

    // Email validering
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerData.email && !emailRegex.test(customerData.email)) {
      newErrors.email = "Ogiltig e-postadress";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Kontrollera om kund finns
      let customerId;
      const customerResponse = await fetch(
        `http://localhost:3000/customers/email/${customerData.email}`
      );

      if (customerResponse.ok) {
        // Kund finns redan
        const existingCustomer = await customerResponse.json();
        customerId = existingCustomer.id;
      } else {
        // Skapa ny kund
        const createCustomerResponse = await fetch(
          "http://localhost:3000/customers",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customerData),
          }
        );

        if (!createCustomerResponse.ok) {
          throw new Error("Kunde inte skapa kund");
        }

        const newCustomer = await createCustomerResponse.json();
        customerId = newCustomer.id;
      }

      // 2. Skapa order
      const orderData = {
        customer_id: customerId,
        payment_status: "Unpaid",
        payment_id: "",
        order_status: "Pending",
        order_items: cartItems.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };

      const orderResponse = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("Kunde inte skapa order");
      }

      const order = await orderResponse.json();
      const orderId = order.id;

      // 3. Skapa Stripe checkout session
      const line_items = cartItems.map((item) => ({
        price_data: {
          currency: "SEK",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: item.price * 100, // Stripe använder ören
        },
        quantity: item.quantity,
      }));

      const stripeResponse = await fetch(
        "http://localhost:3000/stripe/create-checkout-session-hosted",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            line_items,
            order_id: orderId,
          }),
        }
      );

      if (!stripeResponse.ok) {
        throw new Error("Kunde inte skapa betalningssession");
      }

      const stripeData = await stripeResponse.json();

      // 4. Uppdatera order med session_id
      const updateOrderResponse = await fetch(
        `http://localhost:3000/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_status: "Unpaid",
            payment_id: stripeData.session_id,
            order_status: "Pending",
          }),
        }
      );

      if (!updateOrderResponse.ok) {
        throw new Error("Kunde inte uppdatera order");
      }

      // 5. Redirect till Stripe checkout
      window.location.href = stripeData.checkout_url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Ett fel uppstod vid checkout. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          <div className="empty-cart">
            <p>
              Din varukorg är tom. Du måste lägga till varor i varukorgen för
              att fortsätta med betalprocessen.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn btn-primary"
            >
              Gå till produkter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          {/* Varukorg sektion */}
          <div className="cart-section">
            <h2>Din varukorg</h2>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/80x80?text=Ingen+Bild"
                      }
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/80x80?text=Ingen+Bild";
                      }}
                    />
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">
                      {item.price.toLocaleString()} kr
                    </p>
                  </div>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <div className="item-total">
                    {(item.price * item.quantity).toLocaleString()} kr
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-btn"
                  >
                    Ta bort
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Totalt: {getTotalPrice().toLocaleString()} kr</strong>
            </div>
          </div>

          {/* Kundformulär sektion */}
          <div className="customer-section">
            <h2>Kunduppgifter</h2>
            <form className="customer-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Förnamn *</label>
                  <input
                    type="text"
                    name="firstname"
                    value={customerData.firstname}
                    onChange={handleInputChange}
                    className={errors.firstname ? "error" : ""}
                  />
                  {errors.firstname && (
                    <span className="error-message">{errors.firstname}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Efternamn *</label>
                  <input
                    type="text"
                    name="lastname"
                    value={customerData.lastname}
                    onChange={handleInputChange}
                    className={errors.lastname ? "error" : ""}
                  />
                  {errors.lastname && (
                    <span className="error-message">{errors.lastname}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>E-post *</label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Telefon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>Adress *</label>
                <input
                  type="text"
                  name="street_address"
                  value={customerData.street_address}
                  onChange={handleInputChange}
                  className={errors.street_address ? "error" : ""}
                />
                {errors.street_address && (
                  <span className="error-message">{errors.street_address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postnummer *</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={customerData.postal_code}
                    onChange={handleInputChange}
                    className={errors.postal_code ? "error" : ""}
                  />
                  {errors.postal_code && (
                    <span className="error-message">{errors.postal_code}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Stad *</label>
                  <input
                    type="text"
                    name="city"
                    value={customerData.city}
                    onChange={handleInputChange}
                    className={errors.city ? "error" : ""}
                  />
                  {errors.city && (
                    <span className="error-message">{errors.city}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Land *</label>
                <input
                  type="text"
                  name="country"
                  value={customerData.country}
                  onChange={handleInputChange}
                  className={errors.country ? "error" : ""}
                />
                {errors.country && (
                  <span className="error-message">{errors.country}</span>
                )}
              </div>
            </form>

            <div className="checkout-actions">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn btn-primary checkout-btn"
              >
                {loading ? "Bearbetar..." : "Betala"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
