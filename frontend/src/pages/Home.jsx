import React from 'react'
import Header from '../components/header'
import Footer from '../components/Footer'
import HeroSection from '../components/heroSection'
import Rooms from '../components/Rooms'
import Experiences from '../components/Experiences'
import Gallery from '../components/gallery'


const Home = () => {

  return (
    <div>
      <Header />
      <HeroSection />
      <Experiences />
      <Rooms />
      <Gallery />
      <Footer />
    </div>
  )
}

export default Home