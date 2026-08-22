import { useState, useMemo, useEffect } from "react";
import { LISTINGS } from "../data/listings.js";

export default function DashboardPage() {
  const [listings, setListings] = useState(LISTINGS);
  const [claimedIds, setClaimedIds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/listings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const apiListings = result.data.map((item) => ({
            id: item.id,
            name: item.food_type,
            sub: item.provider_name,
            tag: item.status,
            qty: item.quantity,
            pickup: item.location,
            expiry: item.status,
          }));

          setListings(apiListings);
        }
      })
      .catch((error) => {
        console.log(
          "Backend unavailable. Using demo listings.",
          error
        );
      });
  }, []);

  const stats = useMemo(() => {
    const urgent = listings.filter(
      (l) => l.tag === "urgent"
    ).length;

    const claimed = claimedIds.length;

    return {
      total: listings.length,
      urgent,
      claimed,
      open: listings.length - claimed,
    };
  }, [claimedIds, listings]);

  const handleClaim = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/listings/${id}/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            volunteer_id: 7,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Failed to claim listing"
        );
      }

      setClaimedIds((prev) => [...prev, id]);
    } catch (error) {
      console.error("Claim failed:", error);
      alert(error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="dash-head">
        <div>
          <h1>Dispatch Dashboard</h1>
          <p>
            Track live surplus listings and manage pickups across
            your network.
          </p>
        </div>

        <button className="btn-primary">
          + New Listing
        </button>
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
            {listings.map((item) => {
              const isClaimed = claimedIds.includes(item.id);

              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sub}</td>

                  <td>
                    <span
                      className={`status-pill ${
                        isClaimed ? "claimed" : item.tag
                      }`}
                    >
                      {isClaimed ? "Claimed" : item.expiry}
                    </span>
                  </td>

                  <td>{item.qty}</td>
                  <td>{item.pickup}</td>

                  <td>
                    <button
                      className={`dash-action${
                        isClaimed ? " done" : ""
                      }`}
                      disabled={isClaimed}
                      onClick={() => handleClaim(item.id)}
                    >
                      {isClaimed
                        ? "Claimed"
                        : "Assign / Claim"}
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