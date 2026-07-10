import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Ticket from "../components/Ticket.jsx";
import NearbyKiosks from "../components/NearbyKiosks.jsx";
import { getReceipt } from "../lib/cart.js";
import "./Receipt.css";

export default function Receipt() {
  const navigate = useNavigate();
  const [receipt, setReceiptState] = useState(null);

  useEffect(() => {
    const stored = getReceipt();
    if (!stored) {
      navigate("/upload", { replace: true });
      return;
    }
    setReceiptState(stored);
  }, [navigate]);

  const totalPages = useMemo(
    () => (receipt ? receipt.items.reduce((sum, item) => sum + (item.pages || 0), 0) : 0),
    [receipt]
  );

  if (!receipt) return null;

  return (
    <div className="thankyou stack">
      <section className="thankyou__intro">
        <p className="eyebrow">All set</p>
        <h1>Take your claim number to any print shop</h1>
        <p className="thankyou__sub">
          Type the code below in at any print shop in our network to print. Codes don't expire, but the
          file itself is only kept for 7 days.
        </p>
      </section>

      <div className="thankyou__tickets stack">
        {receipt.items.map((item) => (
          <Ticket
            key={item.number}
            number={item.number}
            filename={item.filename}
            pages={item.pages}
            amount={item.amount}
            status={item.status ?? (item.alreadyBilled ? "already_paid" : "paid")}
            large
          />
        ))}
      </div>

      <NearbyKiosks pages={totalPages} />

      <div className="thankyou__actions stack">
        <Link to="/lookup" className="btn btn-ghost btn-block">
          Look up a claim number later
        </Link>
        <Link to="/upload" className="btn btn-primary btn-block">
          Upload another document
        </Link>
      </div>
    </div>
  );
}
