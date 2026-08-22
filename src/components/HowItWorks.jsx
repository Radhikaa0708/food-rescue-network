const STEPS = [
  {
    num: "STEP 01",
    title: "List surplus food",
    body: "Providers post quantity, type, pickup window and expiry — takes under a minute.",
  },
  {
    num: "STEP 02",
    title: "Verified claim",
    body: "Nearby NGOs or volunteers see it ranked by urgency and distance, and claim in one tap.",
  },
  {
    num: "STEP 03",
    title: "Tracked delivery",
    body: "Pickup and drop-off status stays visible end-to-end, so nothing silently falls through.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section">
      <div className="section-head">
        <div className="eyebrow mono">How it works</div>
        <h2>Provider lists it. Volunteer claims it. Recipient gets it.</h2>
      </div>
      <div className="flow">
        {STEPS.map((step) => (
          <div className="flow-card" key={step.num}>
            <span className="flow-num mono">{step.num}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
