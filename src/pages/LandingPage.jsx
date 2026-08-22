import Hero from "../components/Hero.jsx";
import ProblemSection from "../components/ProblemSection.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import FeaturesGrid from "../components/FeaturesGrid.jsx";
import LiveBoard from "../components/LiveBoard.jsx";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesGrid />
      <LiveBoard />
    </>
  );
}
