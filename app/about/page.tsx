"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { PenTool, Users, Target, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-heading text-foreground mb-4">
              About <span className="text-accent">BlogSpace</span>
            </h1>
            <p className="text-xl text-muted-foreground">A modern platform for sharing stories, insights, and ideas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold font-heading">Our Mission</h2>
                </div>
                <p className="text-muted-foreground">
                  To provide a clean, modern platform where writers and thinkers can share their ideas, connect with
                  readers, and build meaningful communities around shared interests.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold font-heading">Our Values</h2>
                </div>
                <p className="text-muted-foreground">
                  We believe in the power of storytelling, the importance of diverse perspectives, and creating an
                  inclusive space for all voices to be heard and appreciated.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <PenTool className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-heading mb-4">Why BlogSpace?</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                In a world full of noise, we focus on signal. BlogSpace is designed to be distraction-free, fast, and
                beautiful. Whether you're here to read thought-provoking articles or share your own insights, we've
                created an environment that puts content first and respects both writers and readers.
              </p>
            </CardContent>
          </Card>

          <div className="text-center">
            <h2 className="text-2xl font-bold font-heading mb-6">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">
              Ready to start sharing your stories? Get in touch with us to learn more about contributing to BlogSpace.
            </p>
            <div className="flex justify-center">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-accent" />
                    <div>
                      <h3 className="font-semibold">Contact Us</h3>
                      <p className="text-sm text-muted-foreground">hello@blogspace.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
