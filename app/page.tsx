import "./home/landing.css";
import Navbar from "./home/components/Navbar";
import Hero from "./home/components/Hero";
import Problem from "./home/components/Problem";
import Features from "./home/components/Features";
import HowItWorks from "./home/components/HowItWorks";
import DemoCallout from "./home/components/DemoCallout";
import Footer from "./home/components/Footer";

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
