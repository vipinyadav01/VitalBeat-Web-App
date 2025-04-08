"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import * as Separator from "@radix-ui/react-separator"
import * as Tooltip from "@radix-ui/react-tooltip"
import * as HoverCard from "@radix-ui/react-hover-card"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Menu, 
  X, 
  Activity, 
  LineChart, 
  Target, 
  Users, 
  Calendar, 
  Zap, 
  Smartphone,
  Bell
} from "lucide-react"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 px-4 lg:px-6 border-b border-border/40">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between">
          <Link className="flex items-center gap-2" href="/">
            <div className="relative w-8 h-8">
              <Image 
                src="/vitalbeat.svg" 
                alt="VitalBeat Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-lg">VitalBeat</span>
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
          <nav className="ml-auto hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/features">
              Features
            </Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/pricing">
              Pricing
            </Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/about">
              About
            </Link>
            <Separator.Root className="h-4 w-px bg-border" />
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-9 px-4 font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="h-9 px-4 font-medium">
                Get Started
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
              <Separator.Root className="h-px w-full bg-border my-2" />
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="outline" className="w-full justify-center" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full justify-center" size="sm">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 overflow-hidden">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary w-fit">
                  <Zap className="h-3.5 w-3.5" />
                  <span>New Workout Planner Released</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                    Track Your Fitness <span className="text-primary">Journey</span>
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                    Log workouts, track progress, and achieve your fitness goals with our simple and intuitive app.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard">
                    <Button size="lg" className="px-6 font-medium">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button variant="outline" size="lg" className="px-6 font-medium">
                      View Demo
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-background">
                        <Image 
                          src={`/avatars/user-${i}.jpg`} 
                          alt={`User ${i}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">4,000+</span> active users
                  </div>
                </div>
              </div>
              <div className="lg:ml-auto relative">
                <div className="relative mx-auto rounded-2xl overflow-hidden border border-border/40 aspect-[4/3] max-w-xl">
                  <Image 
                    src="/vitalillustration.jpg" 
                    alt="VitalBeat Dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-background/60 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-48 h-24 bg-background rounded-lg border border-border/40 p-3 shadow-lg hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Daily Goal</p>
                      <p className="text-sm font-medium">85% Completed</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-48 h-24 bg-background rounded-lg border border-border/40 p-3 shadow-lg hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <LineChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Your Progress</p>
                      <p className="text-sm font-medium">+12% this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section - Bento Grid */}
        <section className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary w-fit">
                <Target className="h-3.5 w-3.5" />
                <span>Features</span>
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">Everything You Need</h2>
              <p className="text-muted-foreground text-lg max-w-[600px]">
                Powerful tools to help you reach your fitness potential
              </p>
            </div>
            
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Feature */}
              <div className="md:col-span-2 row-span-2 rounded-2xl border border-border/40 bg-background p-6 md:p-8 transition-all hover:shadow-md overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Activity Tracking</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Log workouts and track progress over time with ease. Our intuitive interface makes it simple to record any type of exercise.
                  </p>
                  <Link href="/features/tracking">
                    <Button variant="outline" className="gap-2">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-50 transition-opacity group-hover:opacity-80">
                  <Image 
                    src="/vitalillustration.jpg" 
                    alt="Activity Tracking"
                    fill
                    className="object-contain object-bottom"
                  />
                </div>
              </div>
              
              {/* Secondary Features */}
              <div className="rounded-2xl border border-border/40 bg-background p-6 transition-all hover:shadow-md flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Data Visualization</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  See your progress with elegant charts and insights tailored to your goals.
                </p>
                <Link href="/features/visualization" className="text-sm font-medium text-primary mt-4 flex items-center gap-1">
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="rounded-2xl border border-border/40 bg-background p-6 transition-all hover:shadow-md flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Goal Setting</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Set and achieve your fitness goals with clear milestones and reminders.
                </p>
                <Link href="/features/goals" className="text-sm font-medium text-primary mt-4 flex items-center gap-1">
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="rounded-2xl border border-border/40 bg-background p-6 transition-all hover:shadow-md flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Connect with like-minded fitness enthusiasts and share your journey.
                </p>
                <Link href="/features/community" className="text-sm font-medium text-primary mt-4 flex items-center gap-1">
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="rounded-2xl border border-border/40 bg-background p-6 transition-all hover:shadow-md flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Workout Planner</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Plan your workouts ahead with customizable templates and schedules.
                </p>
                <Link href="/features/planner" className="text-sm font-medium text-primary mt-4 flex items-center gap-1">
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="md:col-span-2 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-background p-6 md:p-8 transition-all hover:shadow-md relative">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Mobile App</h3>
                    <p className="text-muted-foreground mb-4">
                      Take VitalBeat with you anywhere. Track workouts on the go with our mobile app.
                    </p>
                    <div className="flex gap-4">
                      <Link href="/download/ios">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Smartphone className="h-4 w-4" />
                          iOS App
                        </Button>
                      </Link>
                      <Link href="/download/android">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Smartphone className="h-4 w-4" />
                          Android App
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="md:w-40 h-48 relative">
                    <Image 
                      src="/mobile-app-preview.png" 
                      alt="Mobile App"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary w-fit">
                <Users className="h-3.5 w-3.5" />
                <span>Testimonials</span>
              </div>
              <h2 className="text-3xl font-bold md:text-4xl">What Our Users Say</h2>
              <p className="text-muted-foreground text-lg max-w-[600px]">
                Join thousands of satisfied users who have transformed their fitness journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border/40 bg-background p-6 transition-all hover:shadow-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image 
                        src={`/avatars/testimonial-${i}.jpg`} 
                        alt={`Testimonial ${i}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">Jamie Smith</h4>
                      <p className="text-sm text-muted-foreground">Fitness Enthusiast</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "VitalBeat has completely transformed how I track my workouts. The intuitive interface and powerful analytics make it easy to stay motivated."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-16 bg-muted/30">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 to-background p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of users who are already transforming their fitness with VitalBeat.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/login">
                      <Button size="lg" className="px-6 font-medium">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="outline" size="lg" className="px-6 font-medium">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative h-64 md:h-full">
                  <Image 
                    src="/cta-image.jpg" 
                    alt="Start Your Journey"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 border-t border-border/40 bg-background/80">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <Link className="flex items-center gap-2 mb-4" href="/">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/logo.svg" 
                    alt="VitalBeat Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-lg">VitalBeat</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Track your fitness journey, set goals, and achieve results with our intuitive fitness platform.
              </p>
              <div className="flex gap-4">
                {["twitter", "instagram", "facebook"].map((social) => (
                  <Link key={social} href={`https://${social}.com/vitalbeat`} className="text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                      <Image 
                        src={`/social/${social}.svg`} 
                        alt={social}
                        width={16}
                        height={16}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                  <li key={item}>
                    <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${item.toLowerCase()}`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Company</h3>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${item.toLowerCase()}`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                {["Terms", "Privacy", "Cookies", "Licenses"].map((item) => (
                  <li key={item}>
                    <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href={`/${item.toLowerCase()}`}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Separator.Root className="h-px w-full bg-border my-6" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2025 VitalBeat. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="/accessibility">
                Accessibility
              </Link>
              <div className="h-3 w-px bg-border"></div>
              <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="/sitemap">
                Sitemap
              </Link>
              <div className="h-3 w-px bg-border"></div>
              <Link className="text-xs text-muted-foreground hover:text-foreground transition-colors" href="/changelog">
                Changelog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}