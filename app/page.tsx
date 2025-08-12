"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Mountain, Car, Building, Users, Wifi } from "lucide-react"

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
            <span className="text-xl font-semibold">Hindukush Sarai Chitral</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="#accommodation" className="text-sm font-medium hover:underline underline-offset-4">
              Accommodation
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#facilities" className="text-sm font-medium hover:underline underline-offset-4">
              Facilities
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
        {/* Hero Section with Real Image */}
        <section className="relative h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            {/* Method 1: Using existing blob URL (current approach) */}
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sarai.%20facade.jpg-7hzULkTc5N2t1aU3fsQ9bex9jIZiRX.jpeg"
              alt="Hindukush Sarai Chitral Hotel Facade with Tirch mir View"
              fill
              className="object-cover brightness-[0.7]"
              priority
            />
          </div>
          <div className="container relative z-10 flex flex-col items-center text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
               Heritage Hospitality in Chitral
            </h1>
            <p className="mt-6 max-w-2xl text-lg">
              Nestled in the heart of Chitral, Hindukush Sarai offers authentic mountain hospitality with modern
              comfort. From budget-friendly dormitories to premium suites, we welcome every traveler with warmth and
              tradition.
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

        <section id="accommodation" className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Accommodation</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              From budget-conscious travelers to luxury seekers, Hindukush Sarai Chitral offers diverse accommodation
              options that blend traditional mountain hospitality with modern amenities. Each space is designed to
              provide comfort while celebrating our rich cultural heritage.
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Method 2: Using generated images with specific queries */}
              <RoomCard
                title="Dormitory - Male"
                description="Clean, comfortable dormitory accommodation for male travelers. Perfect for backpackers and budget-conscious adventurers exploring the Hindukush region."
                price={2000}
                image="/images/male-dormitory.png"
                features={[
                  "Shared accommodation",
                  "Clean washrooms",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                  "Lockers available",
                ]}
                targetAudience="Budget Travelers"
                currency="Rs"
                priceUnit="per bed"
              />
              <RoomCard
                title="Dormitory - Female"
                description="Safe and comfortable dormitory accommodation exclusively for female travelers. Secure environment with all essential amenities for a pleasant stay."
                price={2000}
                image="/images/female-dormitory.png"
                features={[
                  "Female-only accommodation",
                  "Clean washrooms",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                  "Secure lockers",
                ]}
                targetAudience="Female Travelers"
                currency="Rs"
                priceUnit="per bed"
              />
              <RoomCard
                title="Budget Room - Single"
                description="Affordable private room with attached bathroom, perfect for solo travelers seeking privacy and comfort without breaking the budget."
                price={6000}
                image="/images/budget-single-room.png"
                features={[
                  "Private room",
                  "Attached bathroom",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                  "Mountain view",
                ]}
                targetAudience="Solo Travelers"
                currency="Rs"
                priceUnit="per night"
              />
              <RoomCard
                title="Budget Room - Double"
                description="Comfortable private room with attached bathroom for couples or friends. Excellent value accommodation with all essential amenities."
                price={10000}
                image="/images/budget-double-room.png"
                features={[
                  "Private room for 2",
                  "Attached bathroom",
                  "24/7 Power",
                  "Free WiFi",
                  "Breakfast Included",
                  "Garden view",
                ]}
                targetAudience="Couples & Friends"
                currency="Rs"
                priceUnit="per night"
              />
              <RoomCard
                title="Standard Room"
                description="Comfortable room with garden views, perfect for travelers seeking quality accommodation. Equipped with modern amenities for year-round comfort."
                price={80}
                image="/images/standard-room.png"
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
                image="/images/deluxe-room.png"
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
                image="/images/family-suite.png"
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
                image="/images/executive-suite.png"
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
                {/* Method 3: Conference room image */}
                <Image
                  src="/images/conference-room.png"
                  alt="Conference Room at Hindukush Sarai Chitral"
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
                    <Wifi className="h-5 w-5 text-emerald-600" />
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
                    <Users className="h-5 w-5 text-emerald-600" />
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
                <h2 className="text-3xl font-bold tracking-tight">About Hindukush Sarai Chitral</h2>
                <p className="mt-4 text-muted-foreground">
                  Hindukush Sarai Chitral is a heritage hotel that celebrates the rich cultural traditions of the
                  Hindukush region while providing modern comfort and convenience. Our hotel offers a unique blend of
                  traditional mountain hospitality and contemporary amenities, welcoming travelers from all walks of
                  life.
                </p>
                <p className="mt-4 text-muted-foreground">
                  From budget-conscious backpackers to luxury travelers, we provide diverse accommodation options that
                  cater to every need and budget. Our beautiful garden and the adjacent park create a serene environment
                  where families can relax while children enjoy the open spaces, and business travelers appreciate our
                  quiet, professional atmosphere.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Our mission is to provide authentic mountain hospitality to all our guests, ensuring comfort with
                  modern amenities while preserving the cultural heritage that makes Chitral special. We take pride in
                  being more than just accommodation – we're your gateway to experiencing the true spirit of the
                  Hindukush.
                </p>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="#contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/hotel-exterior.png"
                  alt="Hindukush Sarai Chitral Hotel Exterior"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="facilities" className="py-16">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Facilities & Services</h2>
                <p className="mt-4 text-muted-foreground">
                  Hindukush Sarai Chitral is strategically located to provide easy access to all essential services
                  and attractions. Our comprehensive facilities ensure that your stay is comfortable, convenient, and
                  memorable.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Whether you're here for business, leisure, or adventure, our range of services and prime location make
                  us the perfect base for exploring Chitral and the surrounding Hindukush region.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <Car className="h-8 w-8 text-emerald-600 mb-2" />
                    <h3 className="font-semibold text-center">Sightseeing Services</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Assortment of cars with experienced drivers available
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <Building className="h-8 w-8 text-emerald-600 mb-2" />
                    <h3 className="font-semibold text-center">Banking Services</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Askari Bank available on-site for your convenience
                    </p>
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
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    <h3 className="font-semibold text-center">Walking Distance</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Shops, restaurants, parks & riverside nearby
                    </p>
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
                      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                      <path d="M9 22v-4h6v4" />
                      <path d="M8 6h.01" />
                      <path d="M16 6h.01" />
                      <path d="M12 6h.01" />
                      <path d="M12 10h.01" />
                      <path d="M12 14h.01" />
                      <path d="M16 10h.01" />
                      <path d="M16 14h.01" />
                      <path d="M8 10h.01" />
                      <path d="M8 14h.01" />
                    </svg>
                    <h3 className="font-semibold text-center">Easy Transport Access</h3>
                    <p className="text-sm text-center text-muted-foreground">Close to Hindukush Express Bus Terminal</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/garden-view.png" alt="Hindukush Sarai Garden" fill className="object-cover" />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/park-view.png" alt="Adjacent Park" fill className="object-cover" />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/outdoor-seating.png" alt="Outdoor Seating Area" fill className="object-cover" />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/garden-path.png" alt="Garden Walking Path" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Beautiful Garden & Park Access</h2>
                <p className="mt-4 text-muted-foreground">
                  Hindukush Sarai Chitral is uniquely situated with its own private garden and adjacent to a public
                  park, offering a peaceful retreat from the bustle of travel.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Families love our outdoor spaces where children can play safely while parents relax. Corporate guests
                  appreciate the serene environment for informal meetings and team discussions in the fresh mountain
                  air.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Located in a secure area of Chitral, our hotel provides both tranquility and safety - a perfect
                  combination for all our guests.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <Users className="h-8 w-8 text-emerald-600 mb-2" />
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
                    <p className="text-sm text-center text-muted-foreground">Safe and peaceful environment</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
                    <MapPin className="h-8 w-8 text-emerald-600 mb-2" />
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
                  <Image src="/images/garden-morning.png" alt="Morning Garden View" fill className="object-cover" />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/park-children.png" alt="Children Playing in Park" fill className="object-cover" />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/outdoor-dining.png" alt="Outdoor Dining Area" fill className="object-cover" />
                </div>
                <div className="relative h-[200px] rounded-lg overflow-hidden">
                  <Image src="/images/mountain-view.png" alt="Mountain View from Hotel" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Method 4: Gallery with real images */}
              {[
                { src: "/images/gallery/exterior-day.png", alt: "Hotel exterior during daytime" },
                { src: "/images/gallery/lobby.png", alt: "Hotel lobby and reception area" },
                { src: "/images/gallery/restaurant.png", alt: "Hotel restaurant and dining area" },
                { src: "/images/gallery/garden-sunset.png", alt: "Garden view during sunset" },
                { src: "/images/gallery/room-interior.png", alt: "Room interior with mountain view" },
                { src: "/images/gallery/conference-setup.png", alt: "Conference room setup" },
                { src: "/images/gallery/local-culture.png", alt: "Local cultural activities" },
                { src: "/images/gallery/chitral-landscape.png", alt: "Beautiful Chitral landscape" },
              ].map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
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
                quote="Perfect for our family vacation. The garden was wonderful for our children, and the heritage atmosphere made our stay truly memorable. Great value for money!"
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
                quote="As a corporate retreat venue, Hindukush Sarai exceeded our expectations. The location provided security and the amenities were perfect for our team-building activities."
                rating={4}
              />
              <TestimonialCard
                name="Ali Hassan, Co Founder of 3Musafir"
                location="Lahore, Pakistan"
                quote="We executed our yearly flagship retreat at Sarai and we had a 10/10 experience. From Hotel staff to the property itself is one of the best in Chitral."
                rating={4}
              />
            </div>
          </div>
        </section>

        <section id="contact" className="py-16">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Contact Us & Getting Here</h2>
                <p className="mt-4 text-muted-foreground">
                  Have questions or need assistance with your booking? Our team is here to help you plan your perfect
                  stay at Hindukush Sarai Chitral.
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
                    <span>info@hindukushheights.com</span>
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
                      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                      <path d="M9 22v-4h6v4" />
                      <path d="M8 6h.01" />
                      <path d="M16 6h.01" />
                      <path d="M12 6h.01" />
                      <path d="M12 10h.01" />
                      <path d="M12 14h.01" />
                      <path d="M16 10h.01" />
                      <path d="M16 14h.01" />
                      <path d="M8 10h.01" />
                      <path d="M8 14h.01" />
                    </svg>
                    <span>Easy access to Hindukush Express Bus Terminal</span>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-2">How to Reach Us</h3>
                  <p className="text-sm text-emerald-700">
                    Conveniently located near the Hindukush Express Bus Terminal for easy travel connections. Our
                    central location puts you within walking distance of shops, restaurants, parks, and the riverside.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/location-map.png"
                  alt="Map location of Hindukush Sarai Chitral"
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
                <span className="text-lg font-semibold">Hindukush Sarai Chitral</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Experience authentic mountain hospitality in Chitral. From budget dormitories to luxury suites, we
                welcome every traveler with warmth and tradition.
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
                  <Link href="#accommodation" className="text-muted-foreground hover:text-foreground">
                    Accommodation
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#facilities" className="text-muted-foreground hover:text-foreground">
                    Facilities
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
            <p>© {new Date().getFullYear()} Hindukush Sarai Chitral. All rights reserved.</p>
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
