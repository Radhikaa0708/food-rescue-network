import { useState, useEffect } from "react";

export default function TicketCard() {
  const [seconds, setSeconds] = useState(42 * 60);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="ticket-wrap">
      <div className="floating-badge mono">● LIVE PICKUP</div>
      <div className="ticket">
        <div className="ticket-top">
          <div className="ticket-id mono">TICKET #RR-3391</div>
          <div className="urgency-tag mono">Expires in 42 min</div>
        </div>
        <h3>40 Veg Thali Trays</h3>
        <div className="ticket-meta">Green Leaf Banquets · Sector 18, Ghaziabad</div>
        <hr className="divider-perf" />
        <div className="route">
          <div className="route-node active">
            <div className="route-dot"></div>
            <span>PROVIDER</span>
          </div>
          <div className="route-line"><span></span></div>
          <div className="route-node active">
            <div className="route-dot"></div>
            <span>VOLUNTEER</span>
          </div>
          <div className="route-line"><span></span></div>
          <div className="route-node">
            <div className="route-dot"></div>
            <span>RECIPIENT</span>
          </div>
        </div>
        <div className="ticket-footer">
          <span className="countdown mono">{`00:${m}:${s} left`}</span>
          <button
            className={`claim-btn${claimed ? " claimed" : ""}`}
            onClick={() => setClaimed(true)}
            disabled={claimed}
          >
            {claimed ? "Claimed ✓" : "Claim Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
}
