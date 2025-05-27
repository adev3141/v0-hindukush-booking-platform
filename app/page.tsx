"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Mountain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RoomCard } from "@/components/room-card"
import { TestimonialCard } from "@/components/testimonial-card"
import { AvailabilityChecker } from "@/components/availability-checker"
import { MultiStepBooking } from "@/components/multi-step-booking"
import { RoomAvailability } from "@/components/room-availability"
import { ErrorBoundary } from "@/components/error-boundary"
import { ChatBot } from "@/components/chat-bot"

export default function Home() {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState(null)

  const handleCheckAvailability = (data) => {
    if (data) {
      setBookingData(data)
      setShowBookingForm(true)

      // Scroll to booking section
      const bookingSection = document.getElementById("booking")
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-semibold">Hindukush Sarai</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="#rooms" className="text-sm font-medium hover:underline underline-offset-4">
              Rooms
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#gallery" className="text-sm font-medium hover:underline underline-offset-4">
              Gallery
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <Button asChild>
            <Link href="#booking">Book Now</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarai.%20facade.jpg-7hzULkTc5N2t1aU3fsQ9bex9jIZiRX.jpeg"
              alt="Hindukush Sarai Hotel Facade with Mountain View"
              fill
              className="object-cover brightness-[0.7]"
              priority
            />
          </div>
          <div className="container relative z-10 flex flex-col items-center text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Experience Affordable Luxury in Chitral
            </h1>
            <p className="mt-6 max-w-2xl text-lg">
              Nestled in the peaceful Chitral Cantonment area, our hotel offers uninterrupted comfort with 24/7 solar
              power, modern amenities, and beautiful garden views at accessible prices.
            </p>
            <div className="mt-10 flex gap-4">
              <Button size="lg" asChild>
                <Link href="#check-availability">Check Availability</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-background/20 hover:bg-background/40" asChild>
                <Link href="#gallery">View Gallery</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="check-availability" className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Check Room Availability</h2>
            <ErrorBoundary>
              <AvailabilityChecker onCheckAvailability={handleCheckAvailability} />
            </ErrorBoundary>

            <div className="mt-12">
              <ErrorBoundary>
                <RoomAvailability />
              </ErrorBoundary>
            </div>
          </div>
        </section>

        <section id="booking" className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Book Your Stay</h2>
            <div className="max-w-4xl mx-auto">
              <ErrorBoundary>
                {showBookingForm ? <MultiStepBooking initialData={bookingData} /> : <MultiStepBooking />}
              </ErrorBoundary>
            </div>
          </div>
        </section>

        <section id="rooms" className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Rooms</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <RoomCard
                title="Standard Room"
                description="Comfortable room with garden views, perfect for solo travelers or couples. Equipped with inverter AC for year-round comfort."
                price={80}
                image="/placeholder.svg?height=400&width=600"
                features={[
                  "Garden View",
                  "Inverter AC (Heating/Cooling)",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                ]}
                targetAudience="Perfect for Couples"
              />
              <RoomCard
                title="Deluxe Room"
                description="Spacious room with premium furnishings and views of our beautiful garden. Ideal for business travelers or small families."
                price={120}
                image="/placeholder.svg?height=400&width=600"
                features={[
                  "Garden View",
                  "Inverter AC (Heating/Cooling)",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                  "Work Desk",
                  "Mini Bar",
                ]}
                targetAudience="Business & Small Families"
              />
              <RoomCard
                title="Family Suite"
                description="Perfect for families, with separate living area and direct access to garden. Spacious enough for parents and children to relax comfortably."
                price={180}
                image="/placeholder.svg?height=400&width=600"
                features={[
                  "Garden Access",
                  "Inverter AC (Heating/Cooling)",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                  "Living Area",
                  "2 Bathrooms",
                ]}
                targetAudience="Family-Friendly"
              />
              <RoomCard
                title="Executive Suite"
                description="Our premium offering for corporate clients and NGO executives. Includes access to our conference facilities and business services."
                price={220}
                image="/placeholder.svg?height=400&width=600"
                features={[
                  "Park View",
                  "Inverter AC (Heating/Cooling)",
                  "24/7 Power",
                  "High-Speed WiFi",
                  "Breakfast Included",
                  "Conference Room Access",
                  "Business Services",
                  "Airport Pickup",
                ]}
                targetAudience="Corporate & NGOs"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=800&width=1200&text=Conference+Room"
                  alt="Conference Room at Hindukush Sarai"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Perfect for Corporate Retreats & NGOs</h2>
                <p className="mt-4 text-muted-foreground">
                  Our well-equipped conference room is ideal for corporate meetings, NGO workshops, and team-building
                  events. With uninterrupted power supply and modern amenities, your business functions will proceed
                  smoothly without the typical interruptions.
                </p>
                <p className="mt-4 text-muted-foreground">
                  We offer special packages for corporate groups and NGOs working in the Chitral region, including
                  accommodation, meals, and conference facilities all in one place.
                </p>
                <div className="mt-8 grid gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                    <span>Modern presentation equipment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <path d="M12 20h.01" />
                    </svg>
                    <span>High-speed WiFi connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path d="M12 8c-2.8 0-5 2.2-5 5 5 5 5-2.2 5-5-2.2-5-5-5Z" />
                      <path d="m3 3 3 2 3-2 3 2 3-2 3 2 3-2v18l-3-2-3 2-3-2-3 2-3-2-3 2Z" />
                    </svg>
                    <span>Catering services available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>Group accommodation packages</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="#contact">Inquire About Corporate Rates</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">About Hindukush Sarai</h2>
                <p className="mt-4 text-muted-foreground">
                  Hindukush Sarai is a boutique hotel nestled in the peaceful Chitral Cantonment area. Our hotel offers
                  a unique blend of traditional hospitality and modern comfort, with the distinction of being the only
                  hotel in Chitral with 24/7 power through our solar backup system.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Our beautiful garden ("bagh") and the adjacent park create a serene environment away from the chaos of
                  typical tourist accommodations. Families can relax while children enjoy the open spaces, and business
                  travelers appreciate our quiet, professional atmosphere.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Our mission is to provide affordable luxury to all our guests, ensuring comfort with modern amenities
                  like inverter air conditioners that provide both heating and cooling year-round - a rare feature in
                  Chitral accommodations.
                </p>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="#contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=800&width=1200"
                  alt="Hindukush Sarai Hotel"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Beautiful Garden & Park Access</h2>
                <p className="mt-4 text-muted-foreground">
                  Hindukush Sarai is uniquely situated with its own private garden ("bagh") and adjacent to a public
                  park, offering a peaceful retreat from the bustle of travel.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Families love our outdoor spaces where children can play safely while parents relax. Corporate guests
                  appreciate the serene environment for informal meetings and team discussions in the fresh mountain
                  air.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Located in the secure Chitral Cantonment area, our hotel provides both tranquility and safety - a
                  perfect combination for all our guests.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-emerald-600 mb-2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <h3 className="font-semibold text-center">Family-Friendly</h3>
                    <p className="text-sm text-center text-muted-foreground">Safe spaces for children to play</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-emerald-600 mb-2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                    <h3 className="font-semibold text-center">Secure Location</h3>
                    <p className="text-sm text-center text-muted-foreground">Located in Chitral Cantonment</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-emerald-600 mb-2"
                    >
                      <path d="M18 8c0 4-6 10-6 10s-6-6-6-10a6 6 0 0 1 12 0Z" />
                      <circle cx="12" cy="8" r="2" />
                    </svg>
                    <h3 className="font-semibold text-center">Peaceful Setting</h3>
                    <p className="text-sm text-center text-muted-foreground">Away from noisy tourist areas</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-emerald-600 mb-2"
                    >
                      <path d="M2 12h20" />
                      <path d="M2 12c0 5 3.5 8.5 8.5 8.5S19 17 19 12" />
                      <path d="M2 12c0-5 3.5-8.5 8.5-8.5S19 7 19 12" />
                    </svg>
                    <h3 className="font-semibold text-center">Outdoor Activities</h3>
                    <p className="text-sm text-center text-muted-foreground">Perfect for morning walks</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Garden+View"
                    alt="Hindukush Sarai Garden"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Park+View"
                    alt="Adjacent Park"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Outdoor+Seating"
                    alt="Outdoor Seating Area"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=400&text=Garden+Path"
                    alt="Garden Walking Path"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=600&width=600&text=Gallery+Image+${item}`}
                    alt={`Gallery image ${item}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">What Our Guests Say</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <TestimonialCard
                name="Ahmed Khan"
                location="Islamabad, Pakistan"
                quote="Perfect for our family vacation. The garden was wonderful for our children, and the uninterrupted power supply was a blessing during Chitral's hot summer."
                rating={5}
              />
              <TestimonialCard
                name="Sarah Johnson"
                location="UNDP Pakistan"
                quote="We held our NGO workshop here and were impressed with the conference facilities. The staff was accommodating and the peaceful location helped our team focus."
                rating={5}
              />
              <TestimonialCard
                name="Faisal Ahmed"
                location="Lahore, Pakistan"
                quote="As a corporate retreat venue, Hindukush Sarai exceeded our expectations. The cantonment location provided security and the amenities were perfect for our team-building activities."
                rating={4}
              />
            </div>
          </div>
        </section>

        <section id="contact" className="py-16">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
                <p className="mt-4 text-muted-foreground">
                  Have questions or need assistance with your booking? Our team is here to help you plan your perfect
                  stay at Hindukush Sarai.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <span>Chitral City, Khyber Pakhtunkhwa, Pakistan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-600"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>+92 345 1234567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-600"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>info@hindukushsarai.com</span>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=800&width=1200&text=Map+Location"
                  alt="Map location of Hindukush Sarai"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 bg-muted/20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mountain className="h-5 w-5 text-emerald-600" />
                <span className="text-lg font-semibold">Hindukush Sarai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Experience affordable luxury in Chitral Cantonment with 24/7 power, inverter ACs, and beautiful garden
                views. The perfect choice for families and corporate retreats.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#rooms" className="text-muted-foreground hover:text-foreground">
                    Rooms
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#gallery" className="text-muted-foreground hover:text-foreground">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Policies</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to our newsletter for special offers and updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Hindukush Sarai. All rights reserved.</p>
            <div className="mt-2">
              <Button variant="link" size="sm" asChild>
                <Link href="/hotel-admin">Hotel Staff Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Bot */}
      <ChatBot />
    </div>
  )
}
