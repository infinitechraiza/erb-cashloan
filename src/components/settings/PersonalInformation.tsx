// components/settings/PersonalInformation.tsx
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Loader2, MapPin } from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  profileImageUrl: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface PersonalInformationProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
  onError: (error: string) => void
  onSuccess: (message: string) => void
}

export default function PersonalInformation({
  profileData,
  onUpdate,
  onError,
  onSuccess
}: PersonalInformationProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [tempProfileData, setTempProfileData] = useState<ProfileData>(profileData)

  // Update tempProfileData when profileData changes
  useEffect(() => {
    setTempProfileData(profileData)
  }, [profileData])

  const handleSaveProfile = async () => {
    if (!tempProfileData.firstName.trim() || !tempProfileData.lastName.trim()) {
      onError("First name and last name are required")
      return
    }

    try {
      setIsSaving(true)

      const formData = new FormData()
      formData.append('first_name', tempProfileData.firstName)
      formData.append('last_name', tempProfileData.lastName)
      formData.append('address', tempProfileData.address || '')
      formData.append('city', tempProfileData.city || '')
      formData.append('state', tempProfileData.state || '')
      formData.append('postal_code', tempProfileData.postalCode || '')
      formData.append('country', tempProfileData.country || '')
      formData.append('_method', 'PUT')

      // Update profile (name)
      const profileResponse = await fetch('/api/settings/update-profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      // Update contact info if changed
      if (tempProfileData.email !== profileData.email || tempProfileData.phone !== profileData.phone) {
        if (!tempProfileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error("Please enter a valid email address")
        }

        if (!tempProfileData.phone.match(/^[0-9]{11}$/)) {
          throw new Error("Phone number must be exactly 11 digits")
        }

        const contactResponse = await fetch('/api/settings/update-information', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: tempProfileData.email,
            phone: tempProfileData.phone,
            address: tempProfileData.address,
            city: tempProfileData.city,
            state: tempProfileData.state,
            postalCode: tempProfileData.postalCode,
            country: tempProfileData.country
          }),
        })

        if (!contactResponse.ok) {
          const error = await contactResponse.json()
          throw new Error(error.message || 'Failed to update contact info')
        }
      }

      // Include profileImageUrl when updating
      onUpdate({ ...tempProfileData, profileImageUrl: profileData.profileImageUrl })
      onSuccess("Profile updated successfully!")
    } catch (error: any) {
      console.error('Error updating profile:', error)
      onError(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save when user stops typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        (tempProfileData.firstName !== profileData.firstName ||
          tempProfileData.lastName !== profileData.lastName ||
          tempProfileData.email !== profileData.email ||
          tempProfileData.phone !== profileData.phone ||
          tempProfileData.address !== profileData.address ||
          tempProfileData.city !== profileData.city ||
          tempProfileData.state !== profileData.state ||
          tempProfileData.postalCode !== profileData.postalCode ||
          tempProfileData.country !== profileData.country) &&
        tempProfileData.firstName.trim() &&
        tempProfileData.lastName.trim()
      ) {
        handleSaveProfile()
      }
    }, 1500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempProfileData])

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Changes are saved automatically
        </p>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              First Name
            </Label>
            <Input
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.firstName}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, firstName: e.target.value })
              }
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Last Name
            </Label>
            <Input
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.lastName}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, lastName: e.target.value })
              }
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Email Address
            </Label>
            <Input
              type="email"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.email}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, email: e.target.value })
              }
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" />
              Phone Number
            </Label>
            <Input
              type="tel"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.phone}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, phone: e.target.value.replace(/\D/g, "") })
              }
              placeholder="09123456789"
              maxLength={11}
            />
            <p className="text-xs text-slate-500">11-digit mobile number</p>
          </div>
        </div>

        {/* Address Field */}
        <div className="grid md:grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Address
            </Label>
            <textarea
              name="address"
              id="address"
              className="w-full border-2 border-slate-300 focus:border-primary focus:ring-primary bg-white h-24 w-full p-2 rounded-md"
              value={tempProfileData.address}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, address: e.target.value })
              }
              placeholder="Enter your full address"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* City Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              City
            </Label>
            <Input
              type="text"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.city}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, city: e.target.value })
              }
              placeholder="City"
            />
          </div>

          {/* State Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              State
            </Label>
            <Input
              type="text"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.state}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, state: e.target.value })
              }
              placeholder="State"
            />
          </div>
        </div>


        <div className="grid md:grid-cols-2 gap-4">
          {/* Postal Code Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Postal Code
            </Label>
            <Input
              type="text"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.postalCode}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, postalCode: e.target.value })
              }
              placeholder="Postal Code"
            />
          </div>

          {/* Country Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Country
            </Label>
            <Input
              type="text"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.country}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, country: e.target.value })
              }
              placeholder="Country"
            />
          </div>
        </div>

      </div>
    </div>
  )
}