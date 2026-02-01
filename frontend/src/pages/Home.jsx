import React from "react";
import Header from "../components/header";
import Footer from "../components/Footer";
import HeroSection from "../components/heroSection";
import Rooms from "../components/Rooms";
import Experiences from "../components/Experiences";
import Gallery from "../components/services";
import SEO from "../components/SEO";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get("scrollTo");

    if (scrollTo === "rooms") {
      setTimeout(() => {
        const el = document.getElementById("rooms");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

        navigate("/", { replace: true });
      }, 50);
    }
  }, [location.search, navigate]);

  return (
    <>
      <SEO />
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <HeroSection />
          <Experiences />
          <Rooms />
          <Gallery />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
