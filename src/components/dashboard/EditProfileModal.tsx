"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Mail, FileText, Building2, ShieldAlert, Check, Loader2, Sparkles, Image as ImageIcon, Camera
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAuthSession, UserRole, UserStatus } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

// 6 premium preset avatar seeds for Dicebear Adventurer style
const PRESET_AVATAR_SEEDS = [
  "Buster", "Luna", "Felix", "Aneka", "Coco", "Oliver"
]

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnboarding?: boolean; // If true, modal is locked as a first-time setup page
}

export function EditProfileModal({ isOpen, onClose, isOnboarding = false }: EditProfileModalProps) {
  const { user, updateProfile } = useAuthSession()
  
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [homeClub, setHomeClub] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("ATTENDEE")
  const [imageUrl, setImageUrl] = React.useState("")
  const [customImageMode, setCustomImageMode] = React.useState(false)
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  // Prefill profile values when modal opens or user data changes
  React.useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
      setBio(user.bio || "")
      setHomeClub(user.homeClub || "")
      setSelectedRole(user.role || "ATTENDEE")
      setImageUrl(user.imageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=Buster`)
      
      // If image is not a preset seed, show custom image mode
      const isPreset = PRESET_AVATAR_SEEDS.some(seed => 
        user.imageUrl === `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`
      )
      setCustomImageMode(!isPreset && !!user.imageUrl)
      setError("")
      setSuccess(false)
    }
  }, [isOpen, user])

  const handlePresetSelect = (seed: string) => {
    setCustomImageMode(false)
    setImageUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError("Profile name is required")
      return
    }
    if (!email.trim()) {
      setError("Email address is required")
      return
    }
    if (!homeClub.trim()) {
      setError("Please specify your Home Club")
      return
    }

    setIsSubmitting(true)
    setError("")
    
    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        bio: bio.trim(),
        homeClub: homeClub.trim(),
        imageUrl: imageUrl.trim(),
        role: selectedRole
      })

      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1500)
      } else {
        setError(res.error || "Failed to update profile configurations.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Warning whenAttendee requests Organizer role
  const showRoleWarning = selectedRole === "ORGANIZER" && user?.role === "ATTENDEE"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      // Prevent closing if onboarding mode is active
      if (!open && !isOnboarding) onClose() 
    }}>
      <DialogContent className={cn(
        "bg-gradient-to-br from-white via-[#fafafb] to-[#f4f4f6] dark:from-[#1b1b22] dark:via-[#15151b] dark:to-[#101014]",
        "w-full max-w-lg border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-3xl overflow-y-auto max-h-[90vh]"
      )} showCloseButton={!isOnboarding}>
        
        <div className="flex flex-col space-y-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                {isOnboarding ? "Welcome to RotaSphere" : "Account Setup"}
              </span>
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {isOnboarding ? "Complete Your Profile" : "Configure Your Profile"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
              {isOnboarding 
                ? "Let's set up your profile cards and details to unlock the district showcase and ticketing engine."
                : "Modify your personal card display, avatar picture, home club association, and roles."
              }
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce shadow-lg border border-emerald-500/20">
                <Check className="h-8 w-8 stroke-[3px]" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Profile Updated!</h3>
              <p className="text-muted-foreground text-xs max-w-xs">
                Your configurations have been synced securely to the platform.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-[8px] font-medium flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Avatar Selector Section */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Select Profile Avatar
                </Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Active Avatar Preview */}
                  <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 relative shadow-sm group">
                    <img src={imageUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Picker Choices */}
                  <div className="flex-1 space-y-2 w-full">
                    {!customImageMode ? (
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_AVATAR_SEEDS.map((seed) => {
                          const presetUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`
                          const isSelected = imageUrl === presetUrl
                          return (
                            <button
                              key={seed}
                              type="button"
                              onClick={() => handlePresetSelect(seed)}
                              className={cn(
                                "h-9 w-9 rounded-full border bg-card p-0.5 overflow-hidden transition-all",
                                isSelected 
                                  ? "border-accent ring-2 ring-accent/20 scale-105" 
                                  : "border-border hover:border-accent/40"
                              )}
                              title={seed}
                            >
                              <img src={presetUrl} alt={seed} className="h-full w-full rounded-full" />
                            </button>
                          )
                        })}
                        {/* Custom Button Trigger */}
                        <button
                          type="button"
                          onClick={() => setCustomImageMode(true)}
                          className="h-9 w-9 rounded-full border border-border hover:border-accent border-dashed flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
                          title="Use custom link"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Paste image url (https://...)"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="rounded-[8px] bg-background/50 text-xs py-1.5 focus-visible:ring-1 focus-visible:ring-accent"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handlePresetSelect("Buster")}
                          className="text-[10px] text-accent hover:underline shrink-0"
                        >
                          Presets
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Email inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Full Profile Name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-name"
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-[8px] border-border bg-background/50 pl-8 focus-visible:ring-1 focus-visible:ring-accent text-foreground text-xs"
                      required
                    />
                    <User className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-[8px] border-border bg-background/50 pl-8 focus-visible:ring-1 focus-visible:ring-accent text-foreground text-xs"
                      required
                      disabled={isOnboarding} // In onboarding, email is locked to login credential
                    />
                    <Mail className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Home Club Input */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-club" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Home Club Association *
                </Label>
                <div className="relative">
                  <Input
                    id="edit-club"
                    placeholder="e.g. Rotaract Club of Chennai"
                    value={homeClub}
                    onChange={(e) => setHomeClub(e.target.value)}
                    className="rounded-[8px] border-border bg-background/50 pl-8 focus-visible:ring-1 focus-visible:ring-accent text-foreground text-xs"
                    required
                  />
                  <Building2 className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  The Rotaract Club you are currently registered with.
                </span>
              </div>

              {/* Bio Textarea */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-bio" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Biography / Bio
                </Label>
                <div className="relative">
                  <Textarea
                    id="edit-bio"
                    placeholder="Tell us about yourself, your club projects, or interests..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="rounded-[8px] border-border bg-background/50 pl-8 focus-visible:ring-1 focus-visible:ring-accent text-foreground text-xs h-16 min-h-[60px]"
                  />
                  <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Role Selection Picker */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Assign Account Role
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "ATTENDEE" as UserRole, label: "Attendee", desc: "Book tickets & browse district events" },
                    { id: "ORGANIZER" as UserRole, label: "Organizer", desc: "List club events & moderate tickets" }
                  ].map((roleChoice) => {
                    const isSelected = selectedRole === roleChoice.id
                    return (
                      <button
                        key={roleChoice.id}
                        type="button"
                        onClick={() => setSelectedRole(roleChoice.id)}
                        className={cn(
                          "flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200",
                          isSelected
                            ? "bg-accent/8 border-accent ring-2 ring-accent/15 scale-[1.01]"
                            : "bg-background/40 border-border hover:bg-[#eeece7] dark:hover:bg-[#2c2c35]"
                        )}
                      >
                        <span className="text-xs font-bold text-foreground block mb-0.5">{roleChoice.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-normal">{roleChoice.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Role warning when selecting organizer */}
              <AnimatePresence>
                {showRoleWarning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex gap-2 font-medium overflow-hidden"
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Administrative Approval Required</span>
                      <p className="text-muted-foreground mt-0.5 leading-normal">
                        Switching your role to Organizer requires district admin verification. Your account status will transition to <span className="font-semibold text-amber-500 font-mono text-[9px]">PENDING</span> and you will wait for verification before accessing organizer consoles.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form submit */}
              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full h-10 bg-primary text-primary-foreground hover:opacity-90 font-semibold shadow-none flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      {isOnboarding ? "Complete Setup & Continue" : "Save Configurations"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
