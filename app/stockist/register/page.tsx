"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Store, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { stateLgas, stateZones } from "./nigeria-locations"

const allStates = [
	"Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
	"Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
	"Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
	"Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
];

const PACKAGES = [
	{
		value: "5M",
		label: "₦5M Package",
		price: 5000000,
		products: 200,
		image: "/images/stockist-5m.png",
		features: [
			"When a customer takes a product package from your store, you earn ₦600 commission per package.",
			"You will also get product supplies from the company when your packages run out.",
			"200 product packages delivered to your store",
			"Free banner, flyers, mentorship, and training materials",
		],
	},
	{
		value: "10M",
		label: "₦10M Package",
		price: 10000000,
		products: 500,
		image: "/images/stockist-10m.png",
		features: [
			"When a customer takes a product package from your store, you earn ₦600 commission per package.",
			"You will also get product supplies from the company when your packages run out.",
			"500 product packages delivered to your store",
			"Free banner, flyers, mentorship, and training materials",
		],
	},
	{
		value: "15M",
		label: "₦15M Package",
		price: 15000000,
		products: 800,
		image: "/images/stockist-15m.png",
		features: [
			"When a customer takes a product package from your store, you earn ₦600 commission per package.",
			"You will also get product supplies from the company when your packages run out.",
			"800 product packages delivered to your store",
			"Free banner, flyers, mentorship, and training materials",
		],
	},
	{
		value: "20M",
		label: "₦20M Package",
		price: 20000000,
		products: 1200,
		image: "/images/stockist-20m.png",
		features: [
			"When a customer takes a product package from your store, you earn ₦600 commission per package.",
			"You will also get product supplies from the company when your packages run out.",
			"1200 product packages delivered to your store",
			"Free banner, flyers, mentorship, and training materials",
		],
	},
]

const TERMS = [
	"If you want to request a refund for your package (e.g. ₦5M), you can only do so after 6 months. If you request before 6 months, a 10% charge will be applied.",
	"You are responsible for renting your store yourself.",
	"Products will be delivered to your store according to your selected package.",
]

const BENEFITS = [
	"When a customer takes a product package from your store, you earn ₦600 commission per package.",
	"You will also get product supplies from the company when your packages run out.",
	"Receive banners, flyers, mentorship, and training materials from the company.",
	"Get your product packages delivered directly to your store.",
	"Access to exclusive stockist network and support.",
]

export default function StockistRegisterPage({ userId, visible, onSuccess }: { userId: string, visible: boolean, onSuccess?: () => void }) {
	const router = useRouter()
	const { toast } = useToast()
	const [step, setStep] = useState<"intro" | "form">("intro")
	const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null)
	const [termsAccepted, setTermsAccepted] = useState(false)
	const [pinMethod, setPinMethod] = useState<"existing" | "buy">("existing")
	const [formData, setFormData] = useState({
		fullName: "",
		storeAddress: "",
		state: "",
		lga: "",
		zone: "",
		phone: "",
		email: "",
		pin: "",
	})
	const [submitting, setSubmitting] = useState(false)

	// Ensure lgas and zones are always arrays and update when state changes
	const lgas = formData.state ? stateLgas[formData.state] ?? [] : []
	const zones = formData.state ? stateZones[formData.state] ?? [] : []

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
			...(name === "state" ? { lga: "", zone: "" } : {}),
		}))
	}

	if (!visible) return null; // Only show if visible

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedPackage) return
		setStep("form")
		setSubmitting(true)
		try {
			const response = await fetch("/api/stockist/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					packageType: selectedPackage.value,
					packageName: selectedPackage.label,
					products: selectedPackage.products,
					userId,
					pin: formData.pin,
				}),
			})
			const data = await response.json()
			if (response.ok) {
				toast({
					title: "Success",
					description: "Stockist application submitted and approved!",
				})
				// Instead of redirecting, update parent dashboard to show info section
				if (onSuccess) onSuccess()
				// Do NOT redirect: router.push("/dashboard")
				// The parent dashboard will now show the stockist info section
			} else {
				toast({
					title: "Error",
					description: data.error || "Failed to submit application",
					variant: "destructive",
				})
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Network error. Please try again.",
				variant: "destructive",
			})
		}
		setSubmitting(false)
	}

	const handleBuyPin = () => {
		window.open(
			"https://api.whatsapp.com/send?phone=2348087331428&text=Hi,%20Bright%20Orion%20I%20want%20to%20Buy%20a%20Stockist%20Pin",
			"_blank"
		)
	}

	if (step === "intro") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
				<div className="max-w-3xl w-full bg-white/90 rounded-2xl shadow-2xl p-8">
					<h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
						Become a Stockist
					</h1>
					<p className="text-lg text-gray-700 text-center mb-8">
						Join our network of authorized stockists and unlock exclusive benefits!
					</p>
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-gray-800 mb-2">Benefits:</h2>
						<ul className="list-disc pl-6 space-y-1 text-gray-700">
							{BENEFITS.map((b) => (
								<li key={b}>{b}</li>
							))}
						</ul>
					</div>
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-gray-800 mb-2">Available Packages:</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{PACKAGES.map((pkg) => (
								<button
									key={pkg.value}
									className={`border rounded-xl p-4 text-left transition-all duration-200 ${
										selectedPackage?.value === pkg.value
											? "border-blue-600 bg-blue-50 shadow"
											: "border-gray-200 bg-white hover:border-blue-400"
									}`}
									onClick={() => setSelectedPackage(pkg)}
									type="button"
								>
									<div className="flex items-center justify-between">
										<span className="font-bold text-lg">{pkg.label}</span>
										<span className="text-blue-700 font-bold">
											₦{pkg.price.toLocaleString()}
										</span>
									</div>
									<div className="text-sm text-gray-600 mt-2">
										Includes{" "}
										<span className="font-semibold">{pkg.products} product packages</span>
									</div>
								</button>
							))}
						</div>
					</div>
					{selectedPackage && (
						<div className="mb-8">
							<h2 className="text-lg font-semibold text-gray-800 mb-2">
								{selectedPackage.label} - Detailed Explanation
							</h2>
							<div className="mb-3 text-gray-700 text-sm leading-relaxed">
								<strong>What you will get:</strong>
								<ul className="list-disc pl-6 mt-1 mb-2">
									<li>
										<b>Product Packages:</b> You will receive <b>{selectedPackage.products} product packages</b> delivered directly to your store. These are physical products you can give to customers.
									</li>
									<li>
										<b>Commission:</b> For every product package a customer takes from your store, you will earn <b>₦600</b> as commission. For example, if you have {selectedPackage.products} packages, you can earn up to <b>₦{(selectedPackage.products * 600).toLocaleString()}</b> in commission if you sell all.
									</li>
									<li>
										<b>Continuous Supply:</b> When you finish your packages, the company will supply you with new product packages so you can keep earning.
									</li>
									<li>
										<b>Support Materials:</b> You will get free banners, flyers, mentorship, and training materials to help you succeed as a stockist.
									</li>
								</ul>
								<strong>How it works:</strong>
								<ul className="list-disc pl-6 mt-1 mb-2">
									<li>
										You are responsible for renting your own store where the products will be delivered.
									</li>
									<li>
										Whenever a customer comes to your store and takes a product package, you immediately earn your commission.
									</li>
									<li>
										Once your stock is finished, you can request more from the company.
									</li>
								</ul>
							</div>
							<div className="mb-3">
								<h3 className="font-semibold text-gray-800 mb-1">Terms &amp; Conditions (Please read carefully):</h3>
								<ul className="list-disc pl-6 space-y-1 text-gray-600 text-sm">
									{TERMS.map((t) => (
										<li key={t}>{t}</li>
									))}
									<li>
										<b>Refund Policy:</b> If you want to request a refund for your package (e.g. ₦5M), you can only do so after 6 months. If you request before 6 months, a 10% charge will be applied.
									</li>
									<li>
										<b>Store Responsibility:</b> You are responsible for renting and maintaining your store. The company will only deliver the products and support materials.
									</li>
									<li>
										<b>Product Delivery:</b> Products will be delivered to your store according to the package you select.
									</li>
								</ul>
							</div>
							<div className="mt-4 flex items-center">
								<input
									id="terms"
									type="checkbox"
									checked={termsAccepted}
									onChange={e => setTermsAccepted(e.target.checked)}
									className="mr-2"
								/>
								<label htmlFor="terms" className="text-sm text-gray-700 select-none">
									I have read and accept the terms and conditions above
								</label>
							</div>
						</div>
					)}
					<div className="flex justify-end">
						<Button
							disabled={!selectedPackage || !termsAccepted}
							onClick={() => setStep("form")}
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
						>
							{selectedPackage ? "Continue to Registration" : "Select a Package"}
						</Button>
					</div>
				</div>
			</div>
		)
	}

	// Registration form step
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
			<div className="max-w-2xl w-full bg-white/90 rounded-2xl shadow-2xl p-8">
				{/* Selected package summary */}
				{selectedPackage && (
					<div className="mb-6 flex flex-col md:flex-row gap-6 items-center">
						{selectedPackage.image && (
							<img src={selectedPackage.image} alt={selectedPackage.label} className="w-32 h-32 object-contain rounded-xl border" />
						)}
						<div>
							<h3 className="font-bold text-xl text-blue-900 mb-2">{selectedPackage.label}</h3>
							<ul className="list-disc pl-6 text-blue-800 text-sm mb-2">
								{selectedPackage.features.map((f) => (
									<li key={f}>{f}</li>
								))}
							</ul>
							<div className="text-xs text-gray-600">
								<strong>Terms:</strong>
								<ul className="list-disc pl-6">
									{TERMS.map((t) => (
										<li key={t}>{t}</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name *</Label>
							<Input
								id="fullName"
								name="fullName"
								value={formData.fullName}
								onChange={handleInputChange}
								required
								placeholder="Enter your full name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number *</Label>
							<Input
								id="phone"
								name="phone"
								type="tel"
								value={formData.phone}
								onChange={handleInputChange}
								required
								placeholder="+234 xxx xxx xxxx"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email Address *</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleInputChange}
							required
							placeholder="your@email.com"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="storeAddress">Store Address (Street/Line) *</Label>
						<Input
							id="storeAddress"
							name="storeAddress"
							value={formData.storeAddress}
							onChange={handleInputChange}
							required
							placeholder="e.g. 12, Aminu Kano Crescent, Wuse 2"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="space-y-2">
							<Label htmlFor="state">State *</Label>
							<select
								id="state"
								name="state"
								value={formData.state}
								onChange={handleInputChange}
								required
								className="w-full border rounded px-3 py-2"
							>
								<option value="">Select State</option>
								{allStates.map((state) => (
									<option key={state} value={state}>{state}</option>
								))}
							</select>
							<div className="text-xs text-gray-500">
								Select the <b>state</b> where your store is located.
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lga">Local Government Area (LGA) *</Label>
							<select
								id="lga"
								name="lga"
								value={formData.lga}
								onChange={handleInputChange}
								required
								className="w-full border rounded px-3 py-2"
								disabled={!formData.state || lgas.length === 0}
							>
								<option value="">Select LGA</option>
								{lgas.map((lga) => (
									<option key={lga} value={lga}>{lga}</option>
								))}
							</select>
							<div className="text-xs text-gray-500">
								Select the <b>local government</b> where your store is located.
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="zone">Zone/Senatorial District *</Label>
							<select
								id="zone"
								name="zone"
								value={formData.zone}
								onChange={handleInputChange}
								required
								className="w-full border rounded px-3 py-2"
								disabled={!formData.state || zones.length === 0}
							>
								<option value="">Select Zone</option>
								{zones.map((zone) => (
									<option key={zone} value={zone}>{zone}</option>
								))}
							</select>
							<div className="text-xs text-gray-500">
								Select the senatorial zone for your store (e.g. Kano Central, Lagos West, etc.)
							</div>
						</div>
					</div>

					{/* PIN Section */}
					<div className="space-y-2">
						<Label>Stockist Registration PIN</Label>
						<div className="flex gap-2 mb-2">
							<Button
								type="button"
								variant={pinMethod === "existing" ? "default" : "outline"}
								onClick={() => setPinMethod("existing")}
							>
								I have a PIN
							</Button>
							<Button
								type="button"
								variant={pinMethod === "buy" ? "default" : "outline"}
								onClick={() => setPinMethod("buy")}
							>
								Buy PIN on WhatsApp
							</Button>
						</div>
						{pinMethod === "existing" ? (
							<Input
								id="pin"
								name="pin"
								value={formData.pin}
								onChange={handleInputChange}
								placeholder="Enter your Stockist PIN"
								required
							/>
						) : (
							<Button
								type="button"
								className="w-full bg-green-600 text-white"
								onClick={handleBuyPin}
							>
								Contact Admin on WhatsApp to Buy PIN
							</Button>
						)}
					</div>

					<div className="pt-4 flex justify-end">
						<Button
							type="submit"
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
							disabled={submitting}
						>
							{submitting ? (
								<span className="flex items-center gap-2">
									<span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-blue-600"></span>
									Submitting...
								</span>
							) : (
								"Submit Application"
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}