import React from 'react'
import Header from '../components/header'
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
    </div>
  )
}

export default Home