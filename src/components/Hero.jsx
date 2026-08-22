import TicketCard from "./TicketCard.jsx";

export default function Hero() {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow mono">Live in 6 cities · Pilot phase</div>
        <h1>
          Good food shouldn't <em>run out the clock.</em>
        </h1>
        <p className="lede">
          Rescue Route connects restaurants, hostels and event kitchens with verified NGOs and
          volunteers — so surplus food gets claimed and delivered before it expires, not after.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary">List Surplus Food</button>
          <a href="#board" className="btn-ghost">Browse Donations</a>
        </div>
        <div className="stat-row">
          <div className="stat">
            <b>4,820 kg</b>
            <span className="mono">FOOD RESCUED</span>
          </div>
          <div className="stat">
            <b>96%</b>
            <span className="mono">CLAIMED BEFORE EXPIRY</span>
          </div>
          <div className="stat">
            <b>312</b>
            <span className="mono">ACTIVE VOLUNTEERS</span>
          </div>
        </div>
      </div>
      <TicketCard />
    </section>
  );
}
