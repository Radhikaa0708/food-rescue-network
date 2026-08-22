import { useState } from "react";
import { LISTINGS } from "../data/listings.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "soon", label: "Expiring soon" },
  { key: "fresh", label: "Fresh" },
];

export default function LiveBoard() {
  const [filter, setFilter] = useState("all");
  const [claimedIds, setClaimedIds] = useState([]);

  const visible = LISTINGS.filter((l) => filter === "all" || l.tag === filter);

  return (
    <section id="board" className="section">
      <div className="section-head">
        <div className="eyebrow mono">Live board · demo</div>
        <h2>See it move.</h2>
        <p>A sample of what providers and volunteers see in real time. Filter by urgency, claim a listing.</p>
      </div>

      <div className="board">
        <div className="board-header">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip mono${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="board-list">
          {visible.map((item) => {
            const isClaimed = claimedIds.includes(item.id);
            return (
              <div className="row" key={item.id}>
                <div>
                  <span className="item-name">{item.name}</span>
                  <span className="item-sub">{item.sub}</span>
                </div>
                <div><span className={`row-tag ${item.tag} mono`}>{item.expiry}</span></div>
                <div className="mono">Qty: {item.qty}</div>
                <div className="mono">Pickup: {item.pickup}</div>
                <button
                  className={`row-claim${isClaimed ? " done" : ""}`}
                  disabled={isClaimed}
                  onClick={() => setClaimedIds((prev) => [...prev, item.id])}
                >
                  {isClaimed ? "Claimed" : "Claim"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
