import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Cross, UserCircle, Users, Camera, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "react-toastify"
import profileData from "./profile-data.json"
import { supabase } from "@/lib/supabase/client"

const australianStates = profileData.australianStates
const australianCities = profileData.australianCities

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5225/api'

// Types
interface UserProfileData {
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  sex?: string
  phoneNumber?: string
  countryCode?: string
  timezone?: string
  avatarUrl?: string
}

interface UserProfileResponse {
  success: boolean
  message: string
  user?: UserProfileData
  medicalConditions: string[]
  familyHistory: string[]
}

interface UpdateUserProfileRequest {
  firstName: string
  lastName: string
  dateOfBirth?: string
  sex?: string
  phoneNumber?: string
  countryCode?: string
  timezone?: string
  medicalConditions?: string[]
  familyHistory?: string[]
}

type FormData = {
  firstName: string
  lastName: string
  email: string
  dob: string
  sex: { value: string; label: string } | null
  phone: string
  city: string
}

export default function ProfileCompletePage() {
  // Get current user from Supabase
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [selectedState, setSelectedState] = useState("vic")
  const [cities, setCities] = useState<{ value: string; label: string }[]>(
    australianCities["vic"].map((city) => ({ value: city, label: city }))
  )
  
  // Medical conditions state
  const [medicalConditions, setMedicalConditions] = useState<string[]>([])
  const [familyHistory, setFamilyHistory] = useState<string[]>([])
  const [availableMedicalConditions, setAvailableMedicalConditions] = useState<string[]>([])
  const [availableFamilyConditions, setAvailableFamilyConditions] = useState<string[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [medicalLoading, setMedicalLoading] = useState(false)
  const [familyLoading, setFamilyLoading] = useState(false)

  const formMethods = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      sex: null,
      phone: "",
      city: "",
    },
  })

  // Get current user from Supabase on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      setAuthLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error("Unable to retrieve userId")
          toast.error("Please log in to access your profile")
          return
        }
        setCurrentUserId(user.id)
      } catch (error) {
        console.error("Error getting current user:", error)
        toast.error("Authentication error")
      } finally {
        setAuthLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  // API calls
  const makeRequest = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false, 
          message: `HTTP ${response.status}` 
        }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Load profile data when user ID is available
  useEffect(() => {
    if (!currentUserId) return

    const loadProfile = async () => {
        console.log('Current User ID:', currentUserId)
        console.log('PI Base URL:', API_BASE_URL)
        console.log('Full URL:', `${API_BASE_URL}/users/${currentUserId}/profile`)

      setInitialLoading(true)
      try {
        const profileResponse = await makeRequest<UserProfileResponse>(`/users/${currentUserId}/profile`)
        
        if (profileResponse.success && profileResponse.user) {
          const user = profileResponse.user
          
          // Set avatar URL
          setAvatarUrl(user.avatarUrl || null)
          
          formMethods.reset({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: 'jane.doe@example.com',
            dob: user.dateOfBirth || '',
            sex: user.sex ? { 
              value: user.sex.toLowerCase(), 
              label: user.sex.charAt(0).toUpperCase() + user.sex.slice(1) 
            } : null,
            phone: user.phoneNumber || '',
            city: 'Melbourne',
          })

          setMedicalConditions(profileResponse.medicalConditions || [])
          setFamilyHistory(profileResponse.familyHistory || [])
        }

        const [medicalConditionsResponse, familyConditionsResponse] = await Promise.all([
          makeRequest<string[]>('/users/medical-conditions/available'),
          makeRequest<string[]>('/users/family-history/available')
        ])

        setAvailableMedicalConditions(medicalConditionsResponse)
        setAvailableFamilyConditions(familyConditionsResponse)

      } catch (error) {
        toast.error("Failed to load profile data")
        console.error("Profile loading error:", error)
        
        setAvailableMedicalConditions([
          "Hypertension (High Blood Pressure)",
          "Diabetes",
          "Asthma",
          "Heart Disease",
          "Arthritis",
          "Cancer",
          "Depression/Anxiety",
          "Thyroid Disorder",
          "Migraine",
          "Other"
        ])
        
        setAvailableFamilyConditions([
          "Hypertension (High Blood Pressure)",
          "Diabetes",
          "Heart Disease",
          "Stroke",
          "Cancer",
          "Alzheimer's/Dementia",
          "Mental Health Disorders",
          "Thyroid Disorders",
          "Autoimmune Disorders",
          "Other"
        ])
      } finally {
        setInitialLoading(false)
      }
    }

    loadProfile()
  }, [currentUserId, formMethods])

  // Avatar upload functionality
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUserId) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum size is 5MB.")
      return
    }

    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/avatar`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setAvatarUrl(result.avatarUrl)
        toast.success("Avatar uploaded successfully!")
      } else {
        toast.error(`Failed to upload avatar: ${result.message}`)
      }
    } catch (error) {
      toast.error("An error occurred while uploading avatar")
      console.error("Avatar upload error:", error)
    } finally {
      setAvatarUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAvatarDelete = async () => {
    if (!currentUserId || !avatarUrl) return

    setAvatarUploading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUserId}/avatar`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setAvatarUrl(null)
        toast.success("Avatar removed successfully!")
      } else {
        toast.error(`Failed to remove avatar: ${result.message}`)
      }
    } catch (error) {
      toast.error("An error occurred while removing avatar")
      console.error("Avatar delete error:", error)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleMedicalConditionChange = (condition: string, checked: boolean) => {
    setMedicalConditions(prev => 
      checked 
        ? [...prev, condition]
        : prev.filter(c => c !== condition)
    )
  }

  const handleFamilyHistoryChange = (condition: string, checked: boolean) => {
    setFamilyHistory(prev => 
      checked 
        ? [...prev, condition]
        : prev.filter(c => c !== condition)
    )
  }

  const onSubmit = async (data: FormData) => {
    if (!currentUserId) {
      toast.error("User not authenticated")
      return
    }

    setLoading(true)
    try {
      const updateData: UpdateUserProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dob,
        sex: data.sex?.value,
        phoneNumber: data.phone,
        countryCode: 'AUS',
        timezone: 'Australia/Melbourne',
        medicalConditions,
        familyHistory
      }
      
      const response = await makeRequest<{ success: boolean; message: string }>(`/users/${currentUserId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      
      if (response.success) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error(`Failed to update profile: ${response.message}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Update error:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveMedicalConditions = async () => {
    if (!currentUserId) {
      toast.error("User not authenticated")
      return
    }

    setMedicalLoading(true)
    try {
      const formData = formMethods.getValues()
      const updateData: UpdateUserProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        sex: formData.sex?.value,
        phoneNumber: formData.phone,
        countryCode: 'AUS',
        timezone: 'Australia/Melbourne',
        medicalConditions,
        familyHistory
      }
      
      const response = await makeRequest<{ success: boolean; message: string }>(`/users/${currentUserId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      
      if (response.success) {
        toast.success("Medical conditions updated successfully!")
      } else {
        toast.error(`Failed to update medical conditions: ${response.message}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Medical conditions update error:", error)
    } finally {
      setMedicalLoading(false)
    }
  }

  const saveFamilyHistory = async () => {
    if (!currentUserId) {
      toast.error("User not authenticated")
      return
    }

    setFamilyLoading(true)
    try {
      const formData = formMethods.getValues()
      const updateData: UpdateUserProfileRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        sex: formData.sex?.value,
        phoneNumber: formData.phone,
        countryCode: 'AUS',
        timezone: 'Australia/Melbourne',
        medicalConditions,
        familyHistory
      }
      
      const response = await makeRequest<{ success: boolean; message: string }>(`/users/${currentUserId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      
      if (response.success) {
        toast.success("Family history updated successfully!")
      } else {
        toast.error(`Failed to update family history: ${response.message}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Family history update error:", error)
    } finally {
      setFamilyLoading(false)
    }
  }

  const getConditionDescription = (condition: string): string | undefined => {
    const descriptions: { [key: string]: string } = {
      "Hypertension (High Blood Pressure)": "High blood pressure that requires monitoring or medication",
      "Diabetes": "Type 1 or Type 2 diabetes requiring management",
      "Heart Disease": "Any diagnosed heart condition"
    }
    return descriptions[condition]
  }

  // Show loading state while getting user authentication
  if (authLoading) {
    return (
      <TabsContent value="personal" className="space-y-4 pt-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
              <span className="ml-2">Authenticating...</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    )
  }

  // Show error if no user is authenticated
  if (!currentUserId) {
    return (
      <TabsContent value="personal" className="space-y-4 pt-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Please log in to access your profile.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    )
  }

  if (initialLoading) {
    return (
      <TabsContent value="personal" className="space-y-4 pt-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
              <span className="ml-2">Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="personal" className="space-y-4 pt-4">
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>Update your personal details and profile picture</CardDescription>
        </CardHeader>

        <Form {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {avatarUrl ? (
                    <AvatarImage 
                      src={`${API_BASE_URL.replace('/api', '')}${avatarUrl}`} 
                      alt="Profile picture" 
                    />
                  ) : (
                    <AvatarFallback className="text-xl font-semibold bg-gray-200 text-gray-500">
                      {formMethods.watch('firstName')?.charAt(0) || 'U'}
                      {formMethods.watch('lastName')?.charAt(0) || 'S'}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex flex-col space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    <Camera className="h-4 w-4" />
                    <span>{avatarUploading ? "Uploading..." : "Change Photo"}</span>
                  </Button>
                  
                  {avatarUrl && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                      onClick={handleAvatarDelete}
                      disabled={avatarUploading}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formMethods.control}
                  name="firstName"
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name="lastName"
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formMethods.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your date of birth helps us provide age-appropriate health recommendations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.value || ""}
                          onValueChange={val => {
                            const selected = [
                              { value: "female", label: "Female" },
                              { value: "male", label: "Male" },
                              { value: "other", label: "Other" },
                            ].find(option => option.value === val)
                            field.onChange(selected)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Female" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Used for health screening recommendations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formMethods.control}
                name="phone"
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^(\+61|0)[2-478](\s?\d){8}$/,
                    message: "Enter a valid Australian phone number"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} placeholder="(+61) 412 345 678" />
                    </FormControl>
                    <FormDescription>
                      Used for appointment reminders and account verification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formMethods.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Melbourne" />
                    </FormControl>
                    <FormDescription>
                      Used to provide local health resources and recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => formMethods.reset()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-teal-700 hover:bg-teal-800 text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Medical Conditions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cross className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
            <span>Medical Conditions</span>
          </CardTitle>
          <CardDescription>Select any medical conditions you have been diagnosed with</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-4">
            <legend className="sr-only">Medical conditions</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {availableMedicalConditions.slice(0, Math.ceil(availableMedicalConditions.length / 2)).map((condition) => (
                  <div key={condition}>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`condition-${condition.replace(/\s+/g, '-').toLowerCase()}`}
                        checked={medicalConditions.includes(condition)}
                        onCheckedChange={(checked) => 
                          handleMedicalConditionChange(condition, checked as boolean)
                        }
                      />
                      <p className="font-medium">{condition}</p>
                    </div>
                    {getConditionDescription(condition) && (
                      <p className="text-xs text-slate-600 ml-6 mt-1">
                        {getConditionDescription(condition)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {availableMedicalConditions.slice(Math.ceil(availableMedicalConditions.length / 2)).map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`condition-${condition.replace(/\s+/g, '-').toLowerCase()}`}
                      checked={medicalConditions.includes(condition)}
                      onCheckedChange={(checked) => 
                        handleMedicalConditionChange(condition, checked as boolean)
                      }
                    />
                    <p className="font-medium">{condition}</p>
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={() => setMedicalConditions([])}
            disabled={medicalLoading}
          >
            Clear All
          </Button>
          <Button 
            className="bg-teal-700 hover:bg-teal-800 text-white"
            onClick={saveMedicalConditions}
            disabled={medicalLoading}
          >
            {medicalLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      {/* Family Medical History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
            <span>Family Medical History</span>
          </CardTitle>
          <CardDescription>Select medical conditions present in your immediate family</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Select conditions that affect your parents, siblings, or grandparents. This information helps identify potential health risks.
          </p>
          <fieldset className="space-y-4">
            <legend className="sr-only">Family medical history</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {availableFamilyConditions.slice(0, Math.ceil(availableFamilyConditions.length / 2)).map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`family-${condition.replace(/\s+/g, '-').toLowerCase()}`}
                      checked={familyHistory.includes(condition)}
                      onCheckedChange={(checked) => 
                        handleFamilyHistoryChange(condition, checked as boolean)
                      }
                    />
                    <p className="font-medium">{condition}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {availableFamilyConditions.slice(Math.ceil(availableFamilyConditions.length / 2)).map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`family-${condition.replace(/\s+/g, '-').toLowerCase()}`}
                      checked={familyHistory.includes(condition)}
                      onCheckedChange={(checked) => 
                        handleFamilyHistoryChange(condition, checked as boolean)
                      }
                    />
                    <p className="font-medium">{condition}</p>
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={() => setFamilyHistory([])}
            disabled={familyLoading}
          >
            Clear All
          </Button>
          <Button 
            className="bg-teal-700 hover:bg-teal-800 text-white"
            onClick={saveFamilyHistory}
            disabled={familyLoading}
          >
            {familyLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}