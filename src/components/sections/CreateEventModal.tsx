"use client"

import * as React from "react"
import { Sparkles, Calendar, MapPin, DollarSign, Users, Award, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventItem } from "@/data/mockData"

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventItem) => void;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    category: "tech",
    capacity: "",
    organizer: "",
    image: ""
  })
  
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Quick validation
    if (!formData.title || !formData.date || !formData.location || !formData.organizer) {
      return
    }

    // Default image fallbacks based on category if empty
    let finalImage = formData.image.trim()
    if (!finalImage) {
      const images: Record<string, string> = {
        tech: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
        music: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
        business: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60",
        food: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60",
        arts: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=60",
        sports: "https://images.unsplash.com/photo-1502904582529-0a1514896a2e?w=800&auto=format&fit=crop&q=60",
      }
      finalImage = images[formData.category] || images.tech
    }

    const priceText = formData.price ? (formData.price.startsWith("$") ? formData.price : `$${formData.price}`) : "Free"

    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title: formData.title,
      description: formData.description || "No description provided.",
      date: new Date(formData.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      time: formData.time || "09:00 AM - 05:00 PM EST",
      location: formData.location,
      image: finalImage,
      organizer: formData.organizer,
      price: priceText,
      category: formData.category,
      capacity: formData.capacity || "100",
      attendees: 1
    }

    onEventCreated(newEvent)
    setSuccess(true)

    // Reset Form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      price: "",
      category: "tech",
      capacity: "",
      organizer: "",
      image: ""
    })

    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="glass-card max-w-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-2xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              Host an Event
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Create a New Event
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Launch your event on RotaSphere. Fill out the details below to publish instantly.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 animate-bounce">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">Event Published!</h3>
            <p className="text-muted-foreground text-sm">
              Your event has been successfully registered and listed on RotaSphere.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Title */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="title" className="text-sm font-semibold">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Silicon Valley Venture Capital Meetup"
                  required
                  className="rounded-xl border-muted-foreground/20 bg-background/50 focus-visible:ring-indigo-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => { if (val) setFormData(prev => ({ ...prev, category: val })) }}
                >
                  <SelectTrigger className="rounded-xl border-muted-foreground/20 bg-background/50 focus:ring-indigo-500">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="tech">Tech & Innovation</SelectItem>
                    <SelectItem value="music">Music & Concerts</SelectItem>
                    <SelectItem value="business">Business & Startup</SelectItem>
                    <SelectItem value="food">Food & Culinary</SelectItem>
                    <SelectItem value="arts">Arts & Theater</SelectItem>
                    <SelectItem value="sports">Fitness & Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Organizer */}
              <div className="space-y-1.5">
                <Label htmlFor="organizer" className="text-sm font-semibold">Organizer Name *</Label>
                <div className="relative">
                  <Input
                    id="organizer"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    placeholder="Host organization or your name"
                    required
                    className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                  />
                  <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-sm font-semibold">Event Date *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-sm font-semibold">Time Slot</Label>
                <Input
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  placeholder="e.g., 10:00 AM - 04:00 PM EST"
                  className="rounded-xl border-muted-foreground/20 bg-background/50 focus-visible:ring-indigo-500"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="location" className="text-sm font-semibold">Location *</Label>
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Moscone Center, SF or Online Zoom Link"
                    required
                    className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                  />
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Ticket Price */}
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-semibold">Price (USD)</Label>
                <div className="relative">
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 49.00 (leave blank for Free)"
                    className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                  />
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <Label htmlFor="capacity" className="text-sm font-semibold">Max Capacity</Label>
                <div className="relative">
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                  />
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Custom Cover Image URL */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="image" className="text-sm font-semibold">Custom Cover Image URL</Label>
                <div className="relative">
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/cover.jpg (optional)"
                    className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                  />
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Share details about what attendees will learn, schedule, guest speakers, etc."
                  rows={3}
                  className="rounded-xl border-muted-foreground/20 bg-background/50 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-muted hover:bg-muted/50 text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20"
              >
                Publish Event
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
