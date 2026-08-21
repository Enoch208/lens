import "./landing.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import DemoCallout from "./components/DemoCallout";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen bg-[#030303]">
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <DemoCallout />
      </main>
      <Footer />
    </div>
  );
}
