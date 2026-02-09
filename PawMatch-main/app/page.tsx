"use client"


import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { CommunityFeaturesSection } from "@/components/landing/community-features"
import { StatsSection } from "@/components/landing/stats-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { useAuth } from "@/components/providers/auth-provider"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  // Removed automatic redirection for logged-in users to allow access to the home page.
  // Navigation component handles dashboard access.

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CommunityFeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
