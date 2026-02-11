"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

export function FosterPetsSection() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasQuizResults, setHasQuizResults] = useState(false)
  const { user, isLoading: isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchFosterPets = async () => {
      try {
        const res = await fetch('/api/pets?is_foster=true&status=available')
        const data = await res.json()

        if (!data.success) {
          throw new Error('Failed to fetch pets')
        }

        // Check for quiz results and their expiration
        let quizScores: Map<number, { score: number, reasons: string[] }> = new Map()
        let hasValidQuiz = false

        const storedMatches = localStorage.getItem('pawmatch_matches')
        const quizTimestamp = localStorage.getItem('pawmatch_quiz_timestamp')
        const storedUserId = localStorage.getItem('pawmatch_quiz_user_id') || ''

        // Strict validation: localStorage user ID must match current user ID (or both empty for guest)
        const currentUserId = user ? user.id.toString() : ''
        const canUseQuiz = storedUserId === currentUserId

        if (storedMatches && quizTimestamp && canUseQuiz) {
          const timestamp = parseInt(quizTimestamp)
          const oneHourInMs = 60 * 60 * 1000 // 1 hour
          const now = Date.now()

          // Check if quiz results are still valid (less than 1 hour old)
          if (now - timestamp < oneHourInMs) {
            try {
              const parsedMatches = JSON.parse(storedMatches)
              if (parsedMatches && Array.isArray(parsedMatches)) {
                // Create a map of pet ID to quiz scores
                parsedMatches.forEach((m: any) => {
                  quizScores.set(m.id, {
                    score: m.matchScore || 0,
                    reasons: m.matchReasons || []
                  })
                })
                hasValidQuiz = true
              }
            } catch (e) {
              console.error('Error parsing quiz results:', e)
            }
          }
        }

        // Map all pets and merge with quiz scores if available
        const allPets = data.pets.map((m: any) => {
          // Get quiz score for this pet if available
          const quizData = quizScores.get(m.id)

          return {
            ...m,
            compatibility: quizData ? quizData.score : 0,
          }
        })

        // Sort by compatibility score (descending)
        if (hasValidQuiz) {
          allPets.sort((a: any, b: any) => b.compatibility - a.compatibility)
        }

        setPets(allPets)
        setHasQuizResults(hasValidQuiz)

      } catch (err) {
        console.error("Foster pets fetch error:", err)
        toast.error("Failed to load foster pets")
      } finally {
        setLoading(false)
      }
    }
    fetchFosterPets()
  }, [user, isAuthLoading])

  return (
    <section id="foster-pets" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Available Foster Dogs</h2>
            <p className="text-muted-foreground">Dogs ready for their 14-day trial home</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/matches?browse=all">View All Pets</Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding foster dogs...</p>
          </div>
        ) : pets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full group">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={pet.profile_image_url || "/placeholder.svg"}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-orange-500 text-white border-none">Foster to Adopt</Badge>

                    {hasQuizResults && (
                      <Badge
                        className={cn(
                          "text-sm font-semibold",
                          pet.compatibility === 0
                            ? "bg-muted text-muted-foreground"
                            : pet.compatibility >= 90
                              ? "bg-accent text-accent-foreground"
                              : pet.compatibility >= 80
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {pet.compatibility}% Match
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.breed} • {pet.age}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    {pet.shelter_name || "PawMatch Shelter"}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(() => {
                      let temperamentTraits = [];
                      try {
                        temperamentTraits = typeof pet.temperament === 'string' ? JSON.parse(pet.temperament) : (pet.temperament || []);
                        if (!Array.isArray(temperamentTraits)) {
                          temperamentTraits = [];
                        }
                      } catch (error) {
                        console.warn('Error parsing temperament:', error);
                        temperamentTraits = [];
                      }
                      return temperamentTraits.slice(0, 3).map((trait: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {trait}
                        </Badge>
                      ));
                    })()}
                  </div>

                  <div className="mt-auto">
                    <Button className="w-full" asChild>
                      <Link href={`/pet/${pet.id}`}>Learn more & Foster</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">No foster dogs currently available</h3>
            <p className="text-muted-foreground mb-6">Check back soon or browse our full adoption list.</p>
            <Button asChild>
              <Link href="/matches?browse=all">Browse All Dogs</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
