"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// FAQ data
const faqs = [
  {
    id: "chitral",
    label: "About Chitral",
    questions: [
      {
        q: "Where is Chitral located?",
        a: "Chitral is located in the northwestern part of Pakistan, in the province of Khyber Pakhtunkhwa. It's situated in the Hindu Kush mountain range, bordering Afghanistan.",
        keywords: ["location", "where", "chitral", "pakistan", "situated"],
      },
      {
        q: "What is the best time to visit Chitral?",
        a: "The best time to visit Chitral is from May to October when the weather is pleasant. July and August are ideal for witnessing the Kalash festivals. Winter (November to April) brings heavy snowfall, making some areas inaccessible.",
        keywords: ["best time", "when", "visit", "weather", "season", "month"],
      },
      {
        q: "How do I get to Chitral?",
        a: "You can reach Chitral by air from Islamabad (flights operate subject to weather conditions) or by road via the Lowari Tunnel from Dir, or through the Shandur Pass from Gilgit (open only in summer).",
        keywords: ["how", "get", "reach", "transport", "flight", "road", "travel"],
      },
      {
        q: "What are the main attractions in Chitral?",
        a: "Main attractions include the Kalash Valleys (Bumburet, Rumbur, and Birir), Chitral Fort, Shandur Pass, Garam Chashma hot springs, Chitral Gol National Park, and various Hindu Kush mountain peaks.",
        keywords: ["attractions", "places", "visit", "kalash", "fort", "shandur", "tourism"],
      },
    ],
  },
  {
    id: "planning",
    label: "Trip Planning",
    questions: [
      {
        q: "How many days should I spend in Chitral?",
        a: "We recommend at least 5-7 days to explore Chitral properly. This allows time to visit the Kalash Valleys, adjust to the altitude, and experience the local culture.",
        keywords: ["days", "duration", "how long", "stay", "spend", "time"],
      },
      {
        q: "Do I need a special permit to visit Chitral?",
        a: "Pakistani nationals don't need permits. Foreign tourists need to register with local authorities upon arrival. For certain areas like Kalash Valleys, a simple registration is required which our hotel can assist with.",
        keywords: ["permit", "visa", "registration", "documents", "foreign", "tourist"],
      },
      {
        q: "What should I pack for Chitral?",
        a: "Pack layers as temperatures can vary significantly. Include sunscreen, sunglasses, hiking shoes, warm clothes (even in summer), rain gear, and any personal medications. ATMs are limited, so carry sufficient cash.",
        keywords: ["pack", "packing", "clothes", "what to bring", "items", "gear"],
      },
      {
        q: "Is it safe to travel to Chitral?",
        a: "Chitral is generally considered safe for tourists. The local people are hospitable and welcoming. However, always check current travel advisories before your trip and respect local customs and traditions.",
        keywords: ["safe", "safety", "security", "dangerous", "travel advisory"],
      },
    ],
  },
  {
    id: "hotel",
    label: "Hotel Information",
    questions: [
      {
        q: "Does Hindukush Sarai have 24/7 electricity?",
        a: "Yes! Unlike many accommodations in Chitral, we provide 24/7 electricity through our solar backup system, ensuring uninterrupted comfort during your stay.",
        keywords: ["electricity", "power", "24/7", "solar", "backup", "outage"],
      },
      {
        q: "Do you offer airport/bus station pickup?",
        a: "Yes, we offer pickup services from Chitral Airport and the bus station for an additional fee. Please inform us of your arrival details at least 24 hours in advance.",
        keywords: ["pickup", "airport", "transport", "bus station", "arrival", "transfer"],
      },
      {
        q: "Do you have heating in winter?",
        a: "Absolutely. All our rooms are equipped with inverter air conditioners that provide both cooling and heating, ensuring comfort year-round regardless of Chitral's extreme temperature variations.",
        keywords: ["heating", "winter", "ac", "air conditioning", "temperature", "warm"],
      },
      {
        q: "Do you arrange local tours and guides?",
        a: "Yes, we can arrange guided tours to Kalash Valleys, Shandur Pass, and other local attractions with experienced guides who speak English. Please inquire at reception for details and pricing.",
        keywords: ["tours", "guide", "local", "arrange", "kalash", "sightseeing"],
      },
      {
        q: "Is WiFi available at the hotel?",
        a: "Yes, we provide complimentary WiFi throughout the property. The connection is generally reliable thanks to our power backup systems.",
        keywords: ["wifi", "internet", "connection", "online", "network"],
      },
      {
        q: "What are your room rates?",
        a: "Our room rates start from $80 for Standard Rooms, $120 for Deluxe Rooms, $180 for Family Suites, and $220 for Executive Suites. All rates include breakfast and are per night.",
        keywords: ["rates", "price", "cost", "room", "booking", "charges"],
      },
    ],
  },
]

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "👋 Welcome to Hindukush Sarai! I'm here to help you with information about Chitral, trip planning, and our hotel. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  // Improved keyword matching function
  const findBestMatch = (userInput: string) => {
    const lowercaseInput = userInput.toLowerCase()
    let bestMatch = null
    let highestScore = 0

    // Check all FAQs for keyword matches
    for (const category of faqs) {
      for (const qa of category.questions) {
        let score = 0

        // Check if the question itself is similar
        const questionWords = qa.q.toLowerCase().split(/\s+/)
        const inputWords = lowercaseInput.split(/\s+/)

        // Score based on question similarity
        for (const word of inputWords) {
          if (qa.q.toLowerCase().includes(word) && word.length > 2) {
            score += 2
          }
        }

        // Score based on keywords
        if (qa.keywords) {
          for (const keyword of qa.keywords) {
            if (lowercaseInput.includes(keyword.toLowerCase())) {
              score += 3
            }
          }
        }

        // Score based on answer content
        if (
          qa.a.toLowerCase().includes(lowercaseInput) ||
          lowercaseInput.includes(qa.a.toLowerCase().substring(0, 20))
        ) {
          score += 1
        }

        if (score > highestScore && score > 2) {
          highestScore = score
          bestMatch = qa
        }
      }
    }

    return bestMatch
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue.trim()
    setInputValue("")
    setIsTyping(true)

    // Simulate bot thinking time
    setTimeout(
      () => {
        setIsTyping(false)

        const lowercaseInput = currentInput.toLowerCase()
        let botResponse =
          "I'm sorry, I don't have specific information about that. Please try asking about:\n\n• Chitral location and attractions\n• Trip planning and travel tips\n• Hotel facilities and services\n• Room rates and booking\n\nOr you can contact us directly at +92 345 1234567 for personalized assistance."

        // Handle greetings
        if (lowercaseInput.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
          botResponse =
            "Hello! 👋 How can I help you today? Feel free to ask about Chitral, planning your trip, or our hotel facilities."
        }
        // Handle thanks
        else if (lowercaseInput.match(/\b(thank|thanks|appreciate)\b/)) {
          botResponse =
            "You're very welcome! 😊 Is there anything else you'd like to know about Hindukush Sarai or visiting Chitral?"
        }
        // Handle goodbye
        else if (lowercaseInput.match(/\b(bye|goodbye|see you|farewell)\b/)) {
          botResponse =
            "Thank you for chatting with us! We hope to welcome you to Hindukush Sarai soon. Have a wonderful day! 🌟"
        }
        // Handle booking inquiries
        else if (lowercaseInput.match(/\b(book|booking|reserve|reservation)\b/)) {
          botResponse =
            "Great! You can make a booking by:\n\n1. Using our online booking form on this website\n2. Calling us at +92 345 1234567\n3. Emailing us at info@hindukushsarai.com\n\nWould you like to know about our room rates or availability?"
        }
        // Handle contact inquiries
        else if (lowercaseInput.match(/\b(contact|phone|email|address)\b/)) {
          botResponse =
            "Here's how to reach us:\n\n📞 Phone: +92 345 1234567\n📧 Email: info@hindukushsarai.com\n📍 Address: Chitral City, Khyber Pakhtunkhwa, Pakistan\n\nWe're located in the peaceful Chitral Cantonment area. Our staff is available 24/7 to assist you!"
        }
        // Try to find the best matching FAQ
        else {
          const bestMatch = findBestMatch(currentInput)
          if (bestMatch) {
            botResponse = bestMatch.a
          }
        }

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: botResponse,
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
      },
      1000 + Math.random() * 1000,
    ) // Random delay between 1-2 seconds
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const selectFaqCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)

    // Add a bot message showing the category
    const category = faqs.find((c) => c.id === categoryId)
    if (category) {
      const botMessage: Message = {
        id: `bot-category-${Date.now()}`,
        content: `Here are some common questions about ${category.label}. Click on any question to get an answer:`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }
  }

  const askQuestion = (question: string) => {
    setInputValue(question)
    // Auto-send the question
    setTimeout(() => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: question,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsTyping(true)

      // Find and send the answer
      setTimeout(() => {
        setIsTyping(false)
        const bestMatch = findBestMatch(question)
        const botResponse = bestMatch
          ? bestMatch.a
          : "I'm sorry, I couldn't find information about that specific question."

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          content: botResponse,
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
      }, 800)
    }, 100)
  }

  const resetChat = () => {
    setSelectedCategory(null)
    setMessages([
      {
        id: "welcome",
        content:
          "👋 Welcome to Hindukush Sarai! I'm here to help you with information about Chitral, trip planning, and our hotel. How can I assist you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg z-40 bg-emerald-600 hover:bg-emerald-700"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[500px] shadow-xl flex flex-col z-50 border-2">
          <CardHeader className="bg-emerald-600 text-white py-3 px-4 flex flex-row justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Hindukush Assistant</h3>
                <p className="text-xs opacity-90">Ask me about Chitral & our hotel</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetChat}
                className="text-white h-8 w-8 hover:bg-emerald-700"
                title="Reset chat"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white h-8 w-8 hover:bg-emerald-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 border"
                      }`}
                    >
                      {message.sender === "bot" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <div
                        className={`text-xs mt-1 text-right ${message.sender === "user" ? "text-emerald-100" : "text-gray-500"}`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 border rounded-lg p-3 max-w-[85%]">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">Assistant</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-gray-600">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show FAQ categories if it's the first message */}
                {messages.length === 1 && !selectedCategory && (
                  <div className="my-4">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Popular topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {faqs.map((category) => (
                        <Badge
                          key={category.id}
                          className="cursor-pointer bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                          onClick={() => selectFaqCategory(category.id)}
                        >
                          {category.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show questions for selected category */}
                {selectedCategory && (
                  <div className="my-4 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-emerald-600"
                        onClick={() => setSelectedCategory(null)}
                      >
                        ← Back to topics
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {faqs
                        .find((c) => c.id === selectedCategory)
                        ?.questions.map((qa, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 border rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => askQuestion(qa.q)}
                          >
                            <p className="text-sm font-medium text-gray-800">{qa.q}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t bg-gray-50">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center w-full">Powered by Hindukush Sarai AI Assistant</div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
