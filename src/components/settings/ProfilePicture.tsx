// components/settings/ProfilePicture.tsx
"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, Camera, Loader2, Upload, X } from "lucide-react"

// Image validation constants
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Helper function to validate image file
const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Please upload: JPEG, PNG, GIF, or WebP images only.`
        }
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
        }
    }

    return { valid: true }
}

// Helper function to convert WebP to JPEG
const convertWebPToJPEG = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        if (file.type !== 'image/webp') {
            resolve(file)
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new window.Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0)

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image'))
                        return
                    }

                    const convertedFile = new File([blob], file.name.replace('.webp', '.jpg'), {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    })

                    resolve(convertedFile)
                }, 'image/jpeg', 0.95)
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

interface ProfilePictureProps {
    profileImage: string | null
    onImageUpdate: (imageUrl: string) => void
    onError: (error: string) => void
    onSuccess: (message: string) => void
}

export default function ProfilePicture({
    profileImage,
    onImageUpdate,
    onError,
    onSuccess
}: ProfilePictureProps) {
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            onError(validation.error || 'Invalid file')
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
            return
        }

        try {
            setIsSaving(true)

            // Preview image immediately
            const reader = new FileReader()
            reader.onloadend = () => {
                onImageUpdate(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Convert WebP to JPEG if necessary
            let fileToUpload = file
            if (file.type === 'image/webp') {
                try {
                    fileToUpload = await convertWebPToJPEG(file)
                } catch (conversionError) {
                    console.error('WebP conversion failed, uploading original:', conversionError)
                }
            }

            // Upload to server
            const formData = new FormData()
            formData.append('profile_url', fileToUpload)
            formData.append('_method', 'PUT')

            const response = await fetch('/api/settings/update-profile', {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to upload image')
            }

            onSuccess("Profile picture updated successfully!")

            // Update with server URL
            if (result.data?.profile_url) {
                onImageUpdate(result.data.profile_url)
            }
        } catch (error: any) {
            console.error('Error uploading image:', error)
            onError(error.message || "Failed to upload image")

            // Revert preview on error
            if (profileImage) {
                onImageUpdate(profileImage)
            }
        } finally {
            setIsSaving(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemoveImage = async () => {
        try {
            setIsSaving(true)

            const formData = new FormData()
            formData.append('remove_profile_url', 'true')
            formData.append('_method', 'PUT')

            const response = await fetch('/api/s/update-profile', {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Failed to remove image')
            }

            onImageUpdate("")
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }

            onSuccess("Profile picture removed successfully!")
        } catch (error: any) {
            console.error('Error removing image:', error)
            onError(error.message || "Failed to remove image")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Picture Display */}
                <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 shadow-lg bg-gradient-to-br from-slate-100 to-slate-200">
                        {profileImage ? (
                            <img
                                width={128}
                                height={128}
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <User className="w-16 h-16 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Change profile picture"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Camera className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Instructions and Actions */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Profile Photo Guidelines</h3>
                        <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Recommended: Square image, at least 400x400 pixels</li>
                            <li>• Supported formats: JPEG, PNG, GIF, WebP</li>
                            <li>• Maximum file size: 5MB</li>
                        </ul>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 text-white"
                            size="sm"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isSaving ? "Uploading..." : "Upload Photo"}
                        </Button>
                        {profileImage && (
                            <Button
                                variant="outline"
                                onClick={handleRemoveImage}
                                disabled={isSaving}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remove Photo
                            </Button>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isSaving}
                />
            </div>
        </div>
    )
}