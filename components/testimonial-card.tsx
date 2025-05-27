import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TestimonialCardProps {
  name: string
  location: string
  quote: string
  rating: number
}

export function TestimonialCard({ name, location, quote, rating }: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
          ))}
        </div>
        <blockquote className="mb-6 italic">"{quote}"</blockquote>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-emerald-100 text-emerald-800">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{location}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
