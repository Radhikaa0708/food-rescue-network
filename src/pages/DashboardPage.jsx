import { useState, useMemo } from "react";
import { LISTINGS } from "../data/listings.js";

export default function DashboardPage() {
  const [claimedIds, setClaimedIds] = useState([]);

  const stats = useMemo(() => {
    const urgent = LISTINGS.filter((l) => l.tag === "urgent").length;
    const claimed = claimedIds.length;
    return {
      total: LISTINGS.length,
      urgent,
      claimed,
      open: LISTINGS.length - claimed,
    };
  }, [claimedIds]);

  const handleClaim = (id) => {
    setClaimedIds((prev) => [...prev, id]);
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
            {LISTINGS.map((item) => {
              const isClaimed = claimedIds.includes(item.id);
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
                      {isClaimed ? "Claimed" : "Assign / Claim"}
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
