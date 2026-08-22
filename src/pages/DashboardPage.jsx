import { useEffect, useState, useMemo } from "react";
import { claimListing, getListings } from "../api/api.js";

export default function DashboardPage() {
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

  const stats = useMemo(() => {
    const urgent = listings.filter((l) => l.tag === "urgent").length;
    const claimed = listings.filter((l) => l.status !== "available").length;
    return {
      total: listings.length,
      urgent,
      claimed,
      open: listings.length - claimed,
    };
  }, [listings]);

  const handleClaim = async (id) => {
    setClaimingId(id);
    setError("");

    try {
      const result = await claimListing(id);
      setListings((prev) => prev.map((item) => (
        item.id === id ? { ...item, ...result.listing, status: "claimed" } : item
      )));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="dashboard">
      <div className="dash-head">
        <div>
          <h1>Dispatch Dashboard</h1>
          <p>Track live surplus listings and manage pickups across your network.</p>
        </div>
        <button className="btn-primary">+ New Listing</button>
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <span className="mono">TOTAL LISTINGS</span>
          <b>{stats.total}</b>
        </div>
        <div className="dash-card alert">
          <span className="mono">URGENT</span>
          <b>{stats.urgent}</b>
        </div>
        <div className="dash-card">
          <span className="mono">OPEN</span>
          <b>{stats.open}</b>
        </div>
        <div className="dash-card">
          <span className="mono">CLAIMED TODAY</span>
          <b>{stats.claimed}</b>
        </div>
      </div>

      <div className="dash-toolbar">
        <h2>Active Listings</h2>
      </div>

      <div className="dash-table-wrap">
        {loading && <p>Loading listings...</p>}
        {!loading && error && <p>{error}</p>}
        <table className="dash-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Source</th>
              <th>Status</th>
              <th>Quantity</th>
              <th>Pickup Window</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && listings.map((item) => {
              const isClaimed = item.status !== "available";
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sub}</td>
                  <td>
                    <span className={`status-pill ${isClaimed ? "claimed" : item.tag}`}>
                      {isClaimed ? "Claimed" : item.expiry}
                    </span>
                  </td>
                  <td>{item.qty}</td>
                  <td>{item.pickup}</td>
                  <td>
                    <button
                      className={`dash-action${isClaimed ? " done" : ""}`}
                      disabled={isClaimed}
                      onClick={() => handleClaim(item.id)}
                    >
                      {isClaimed ? "Claimed" : claimingId === item.id ? "Claiming..." : "Assign / Claim"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
