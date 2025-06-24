"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Cross } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Select from "react-select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const australianStates = [
    { value: "nsw", label: "New South Wales" },
    { value: "vic", label: "Victoria" },
    { value: "qld", label: "Queensland" },
    { value: "wa", label: "Western Australia" },
    { value: "sa", label: "South Australia" },
    { value: "tas", label: "Tasmania" },
    { value: "act", label: "Australian Capital Territory" },
    { value: "nt", label: "Northern Territory" },
]

const australianCities = {
    nsw: ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Coffs Harbour", "Wagga Wagga", "Albury"],
    vic: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Mildura", "Warrnambool"],
    qld: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Mackay"],
    wa: ["Perth", "Bunbury", "Geraldton", "Kalgoorlie", "Albany", "Broome", "Port Hedland"],
    sa: ["Adelaide", "Mount Gambier", "Whyalla", "Port Augusta", "Port Lincoln", "Murray Bridge", "Victor Harbor"],
    tas: ["Hobart", "Launceston", "Devonport", "Burnie", "Kingston", "Ulverstone", "Wynyard"],
    act: ["Canberra", "Belconnen", "Tuggeranong", "Woden", "Gungahlin", "Queanbeyan"],
    nt: ["Darwin", "Alice Springs", "Palmerston", "Katherine", "Tennant Creek", "Nhulunbuy"],
}

type PersonalInfo = {
    firstName: string
    lastName: string
    email: string
    dob: string
    sex: { value: string; label: string }
    phone: string
    state: { value: string; label: string }
    city: { value: string; label: string }
}

export default function ProfilePage() {
    const [selectedState, setSelectedState] = useState("nsw")
    const [cities, setCities] = useState<{ value: string; label: string }[]>(
        australianCities["nsw"].map((city) => ({ value: city, label: city }))
    )

    const formMethods = useForm({
        defaultValues: {
            firstName: "Jane",
            lastName: "Doe",
            email: "jane.doe@example.com",
            dob: "2000-06-15",
            sex: { value: "female", label: "Female" },
            phone: "",
            state: { value: "nsw", label: "New South Wales" },
            city: { value: "Sydney", label: "Sydney" },
        },
    })

    const handleStateChange = (option: PersonalInfo["state"]) => {
        formMethods.setValue("state", option)
        formMethods.setValue("city", { value: "", label: "Select a city" })
        setSelectedState(option?.value)

        const stateKey = option?.value
        if (stateKey && stateKey in australianCities) {
            const newCities = australianCities[stateKey as keyof typeof australianCities].map((city) => ({
                value: city,
                label: city,
            }))
            setCities(newCities)
        } else {
            setCities([])
        }
    }

    const onSubmit = (data: PersonalInfo) => {
        console.log(data)
        alert("Personal information updated successfully!")
    }

    return (
        <main className="flex-1 overflow-auto">
            <div className="p-6 bg-slate-50">
                <h1 className="text-2xl font-semibold mb-2">Account Management</h1>
                <p className="text-muted-foreground mb-8">Update your personal details</p>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                        <TabsTrigger value="personal" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
                            Personal Info
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-4 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </CardHeader>

                            <Form {...formMethods}>
                                <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={formMethods.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
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
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={formMethods.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formMethods.control}
                                            name="dob"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date of Birth</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
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
                                                            {...field}
                                                            options={[
                                                                { value: "female", label: "Female" },
                                                                { value: "male", label: "Male" },
                                                                { value: "other", label: "Other" },
                                                            ]}
                                                            onChange={(val) => field.onChange(val)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input type="tel" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter an Australian mobile (04XX XXX XXX) or landline (0X XXXX XXXX)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formMethods.control}
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State/Territory</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            {...field}
                                                            options={australianStates}
                                                            onChange={(val) => {
                                                                field.onChange(val)
                                                                if (val) {
                                                                    handleStateChange(val)
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formMethods.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City/Suburb</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            {...field}
                                                            options={cities}
                                                            isDisabled={!selectedState}
                                                            onChange={(val) => field.onChange(val)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => formMethods.reset()}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Form>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Cross className="mr-2 h-5 w-5 text-teal-700" aria-hidden="true" />
                                    <span>Medical Conditions</span>
                                </CardTitle>
                                <CardDescription>Select any of these medical conditions you currently have</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <fieldset className="space-y-4">
                                    <legend className="sr-only">Medical conditions</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="condition-hypertension"
                                                        aria-describedby="condition-hypertension-description"
                                                    />
                                                    <p className="font-medium">
                                                        Hypertension (High Blood Pressure)
                                                    </p>
                                                </div>
                                                <p id="condition-hypertension-description" className="text-xs text-slate-600 ml-6 mt-1">
                                                    High blood pressure that requires monitoring or medication
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="condition-diabetes" aria-describedby="condition-diabetes-description" />
                                                    <p className="font-medium">
                                                        Diabetes
                                                    </p>
                                                </div>
                                                <p id="condition-diabetes-description" className="text-xs text-slate-600 ml-6 mt-1">
                                                    Type 1 or Type 2 diabetes requiring management
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="condition-asthma" />
                                                <p className="font-medium">
                                                    Asthma
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="condition-heart-disease" aria-describedby="condition-heart-description" />
                                                    <p className="font-medium">
                                                        Heart Disease
                                                    </p>
                                                </div>
                                                <p id="condition-heart-description" className="text-xs text-slate-600 ml-6 mt-1">
                                                    Any diagnosed heart condition
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="condition-arthritis" />
                                                <p className="font-medium">
                                                    Arrhythmia
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="condition-cancer" />
                                                <p className="font-medium">
                                                    Sleep Apnea
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="condition-depression" />
                                                <p className="font-medium">
                                                    Insomnia
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="condition-thyroid" />
                                                <p className="font-medium">
                                                    Narcolepsy
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>

                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" aria-label="Cancel changes to medical conditions">
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-teal-700 hover:bg-teal-800 text-white"
                                    aria-label="Save medical conditions changes"
                                    onClick={() => alert("Medical conditions updated successfully!")}
                                >
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
