import { FEATURES } from "../data/features.js";

export default function FeaturesGrid() {
  return (
    <section id="features" className="section">
      <div className="section-head">
        <div className="eyebrow mono">Core features</div>
        <h2>Built for the two-hour window that matters.</h2>
        <p>Every feature exists to shrink the time between "about to be thrown away" and "delivered."</p>
      </div>
      <div className="features-grid">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
