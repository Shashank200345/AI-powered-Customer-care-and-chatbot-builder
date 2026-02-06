import React from 'react'
import Navbar from '@/components/landing/nav'
import Hero from '@/components/landing/hero'
import SocialProof from '@/components/landing/social/index'
import Features from '@/components/landing/features/index'
import Integration from '@/components/landing/integration/index'
import Pricing from '@/components/landing/pricing/index'
import Footer from '@/components/landing/footer/index'


const Page = () => {
  return (
    <main className='w-full flex flex-col relative z-10'>
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <Integration />
      <Pricing />
      <Footer />
    </main>
  )
}

export default Page