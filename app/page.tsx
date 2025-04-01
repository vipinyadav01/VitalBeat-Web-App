"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 px-4 lg:px-6 border-b border-border/40">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between">
          <Link className="flex items-center" href="/">
            <span className="font-medium text-lg">VitalBeat</span>
          </Link>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Desktop navigation */}
          <nav className="ml-auto hidden md:flex gap-6">
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/features">
              Features
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/pricing">
              Pricing
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="/about">
              About
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-8 px-4">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background p-4 border-t border-border/40">
            <nav className="flex flex-col space-y-3">
              <Link 
                className="text-sm py-2 px-3 hover:bg-muted rounded-md transition-colors" 
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                className="text-sm py-2 px-3 hover:bg-muted rounded-md transition-colors" 
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                className="text-sm py-2 px-3 hover:bg-muted rounded-md transition-colors" 
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full justify-center" size="sm">
                  Sign In
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
      
      <main className="flex-1">
        <section className="w-full py-16 md:py-28">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-5">
                <div className="space-y-3">
                  <h1 className="text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
                    Track Your Fitness Journey
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg max-w-md">
                    Log workouts, track progress, and achieve your fitness goals with our simple and intuitive app.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard">
                    <Button className="px-5 font-normal">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="px-5 font-normal">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:ml-auto mt-8 lg:mt-0">
                <div className="relative mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-muted border border-border/40 aspect-video max-w-xl">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">App Illustration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <h2 className="text-2xl font-medium md:text-3xl">Key Features</h2>
              <p className="text-muted-foreground text-base max-w-[600px]">
                Everything you need to achieve your fitness goals
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col rounded-lg border border-border/40 bg-background p-6 transition-all hover:shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Activity Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Log workouts and track progress over time with ease.
                </p>
              </div>
              
              <div className="flex flex-col rounded-lg border border-border/40 bg-background p-6 transition-all hover:shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Data Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  See your progress with elegant charts and insights.
                </p>
              </div>
              
              <div className="flex flex-col rounded-lg border border-border/40 bg-background p-6 transition-all hover:shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                    <path d="m16 8-2 3-6 1-1 6-2 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Goal Setting</h3>
                <p className="text-sm text-muted-foreground">
                  Set and achieve your fitness goals with clear milestones.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t border-border/40">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2025 VitalBeat. All rights reserved.</p>
            <nav className="flex gap-4">
              <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
                Terms
              </Link>
              <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="#">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}