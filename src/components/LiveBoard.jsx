import { useEffect, useState } from "react";
import { claimListing, getListings } from "../api/api.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "soon", label: "Expiring soon" },
  { key: "fresh", label: "Fresh" },
];

export default function LiveBoard() {
  const [filter, setFilter] = useState("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = listings.filter((l) => filter === "all" || l.tag === filter);

  const handleClaim = async (id) => {
    setClaimingId(id);
    setError("");

    try {
      const result = await claimListing(id);
      setListings((prev) => prev.map((item) => (
        item.id === id ? { ...item, ...result.listing, status: "claimed", claimed_by: result.listing.claimed_by } : item
      )));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <section id="board" className="section">
      <div className="section-head">
        <div className="eyebrow mono">Live board</div>
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
          {loading && <p>Loading listings...</p>}
          {!loading && error && <p>{error}</p>}
          {!loading && !error && visible.length === 0 && <p>No listings available.</p>}
          {!loading && !error && visible.map((item) => {
            const isClaimed = item.status !== "available";
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
                  onClick={() => handleClaim(item.id)}
                >
                  {isClaimed ? "Claimed" : claimingId === item.id ? "Claiming..." : "Claim"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
