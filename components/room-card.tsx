import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface RoomCardProps {
  title: string
  description: string
  price: number
  image: string
  features: string[]
  targetAudience?: string // Add this line
}

export function RoomCard({ title, description, price, image, features, targetAudience }: RoomCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {targetAudience && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 mt-1">
                {targetAudience}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-bold">${price}</span>
            <span className="text-sm text-muted-foreground"> / night</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="#booking">Request Reservation</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
