"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Heart, Users, Shield, Sparkles, Home, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              How PawMatch Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Our smart matching system ensures you find the perfect furry companion for your lifestyle and home.
            </p>
            <Button size="lg" asChild>
              <Link href="/quiz">
                Take Pawsonality Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-muted-foreground text-lg">
              Get matched with your perfect companion in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="text-center relative">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle className="text-xl">Take Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete our Pawsonality Quiz to tell us about your lifestyle, home, and preferences
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center relative">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle className="text-xl">Get Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our AI algorithm analyzes your responses to find compatible pets in your area
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center relative">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle className="text-xl">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Meet your matches through virtual or in-person meetups with shelters and foster families
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center relative">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <CardTitle className="text-xl">Adopt</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete the adoption process and welcome your new family member home
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose PawMatch?
            </h2>
            <p className="text-muted-foreground text-lg">
              We're more than just a listing site - we're your adoption partner
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our proprietary Pawsonality algorithm considers lifestyle, activity level, home environment, and personality traits to ensure perfect matches.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Verified Shelters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All our partner shelters are verified and undergo strict quality checks to ensure ethical practices and animal welfare.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Buddy-Check System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our unique system analyzes compatibility between potential pets and any existing pets in your home for harmonious introductions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Foster-to-Adopt</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Try before you commit with our foster-to-adopt program, ensuring both you and your pet are ready for a permanent commitment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Welfare Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We provide 14-day post-adoption support and monitoring based on the 3-3-3 rule to help pets adjust to their new homes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join a community of pet lovers, access resources, and get support from experienced adopters and animal welfare experts.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Proven Success
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of happy families who found their perfect match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">2,500+</div>
              <div className="text-lg font-semibold">Happy Adoptions</div>
              <div className="text-muted-foreground">and counting every day</div>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-accent">92%</div>
              <div className="text-lg font-semibold">Success Rate</div>
              <div className="text-muted-foreground">permanent placements</div>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">4.9/5</div>
              <div className="text-lg font-semibold">User Rating</div>
              <div className="text-muted-foreground">from verified adopters</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Take the first step towards finding your furry companion. Our Pawsonality Quiz takes just 5 minutes and could change your life forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/quiz">
                Take Pawsonality Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
