export default function ProblemSection() {
  return (
    <section id="problem" className="section">
      <div className="problem-block">
        <div>
          <h2>The gap isn't food. It's coordination.</h2>
          <p>
            Edible food is discarded daily by restaurants, hostels, events and households — while
            nearby organizations need exactly that food. The bottleneck is rarely awareness. It's
            timing, logistics, and knowing who's close enough to move fast.
          </p>
          <p style={{ marginTop: 14 }}>
            Rescue Route replaces scattered calls and WhatsApp forwards with one coordinated
            pipeline: list, claim, deliver.
          </p>
        </div>
        <div className="problem-stats">
          <div className="pstat">
            <b>40%</b>
            <span>of food produced globally is never eaten</span>
          </div>
          <div className="pstat">
            <b>&lt; 2 hrs</b>
            <span>typical window before surplus food is unsafe to donate</span>
          </div>
          <div className="pstat">
            <b>1 in 9</b>
            <span>people affected by hunger while this surplus goes to waste</span>
          </div>
        </div>
      </div>
    </section>
  );
}
