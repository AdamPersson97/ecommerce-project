import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./OrderConfirmation.css";

interface OrderDetails {
  id: number;
  customer_id: number;
  total_price: number;
  payment_status: string;
  payment_id: string;
  order_status: string;
  created_at: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  customer_street_address: string;
  customer_postal_code: string;
  customer_city: string;
  customer_country: string;
  order_items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetchOrderDetails(sessionId);
      // Rensa localStorage
      localStorage.removeItem("cart");
      localStorage.removeItem("customerData");
      // Uppdatera cart header
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } else {
      setError("Ingen session ID hittades");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      // Först hämta orderdetaljerna
      const response = await fetch(
        `http://localhost:3000/orders/payment/${sessionId}`
      );
      if (!response.ok) {
        throw new Error("Order hittades inte");
      }

      const orderData = await response.json();
      setOrderDetails(orderData);

      // Uppdatera order status till "Paid" och "Received"
      const updateResponse = await fetch(
        `http://localhost:3000/orders/${orderData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_status: "Paid",
            payment_id: sessionId,
            order_status: "Received",
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error("Kunde inte uppdatera order status");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Kunde inte hämta orderdetaljer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="loading">Laddar orderdetaljer...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="error">
            <h1>Fel uppstod</h1>
            <p>{error}</p>
            <Link to="/" className="btn btn-primary">
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="error">
            <h1>Order hittades inte</h1>
            <Link to="/" className="btn btn-primary">
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-header">
          <div className="success-icon">✓</div>
          <h1>Tack för din beställning!</h1>
          <p>Din order har bekräftats och kommer att behandlas snarast.</p>
        </div>

        <div className="order-summary">
          <h2>Ordersammanfattning</h2>
          <div className="order-info">
            <div className="order-details-grid">
              <div className="order-info-section">
                <h3>Orderinformation</h3>
                <p>
                  <strong>Order ID:</strong> #{orderDetails.id}
                </p>
                <p>
                  <strong>Datum:</strong>{" "}
                  {new Date(orderDetails.created_at).toLocaleDateString(
                    "sv-SE"
                  )}
                </p>
                <p>
                  <strong>Betalnings ID:</strong> {orderDetails.payment_id}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`status ${orderDetails.order_status.toLowerCase()}`}
                  >
                    {orderDetails.order_status}
                  </span>
                </p>
                <p>
                  <strong>Totalt:</strong>{" "}
                  {orderDetails.total_price.toLocaleString()} kr
                </p>
              </div>

              <div className="customer-info-section">
                <h3>Leveransadress</h3>
                <p>
                  <strong>Namn:</strong> {orderDetails.customer_firstname}{" "}
                  {orderDetails.customer_lastname}
                </p>
                <p>
                  <strong>E-post:</strong> {orderDetails.customer_email}
                </p>
                <p>
                  <strong>Telefon:</strong> {orderDetails.customer_phone}
                </p>
                <p>
                  <strong>Adress:</strong>{" "}
                  {orderDetails.customer_street_address}
                </p>
                <p>
                  <strong>Ort:</strong> {orderDetails.customer_postal_code}{" "}
                  {orderDetails.customer_city}
                </p>
                <p>
                  <strong>Land:</strong> {orderDetails.customer_country}
                </p>
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h3>Beställda produkter</h3>
            <div className="order-items">
              {orderDetails.order_items &&
              orderDetails.order_items.length > 0 ? (
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Produkt</th>
                      <th>Enhetspris</th>
                      <th>Antal</th>
                      <th>Totalt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.order_items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.unit_price.toLocaleString()} kr</td>
                        <td>{item.quantity}</td>
                        <td>
                          {(item.unit_price * item.quantity).toLocaleString()}{" "}
                          kr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3}>
                        <strong>Totalt att betala:</strong>
                      </td>
                      <td>
                        <strong>
                          {orderDetails.total_price.toLocaleString()} kr
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p>Inga produkter hittades i ordern.</p>
              )}
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <div className="action-buttons">
            <Link to="/products" className="btn btn-primary">
              Fortsätt handla
            </Link>
            <Link to="/" className="btn btn-secondary">
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
