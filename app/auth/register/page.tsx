"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const RegisterPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    sponsorId: "",
    uplineId: "",
    pin: "",
    location: "",
    packageType: "starter",
    agreeTerms: false,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [pinMethod, setPinMethod] = useState<"existing" | "new">("existing")

  // Single package configuration
  const PACKAGE = {
    name: "Bright Orion Starter Package",
    price: 36000,
    currency: "NGN",
    features: [
      "Access to 6-Level Matrix System",
      "Commission on All Levels",
      "Mobile App Access",
      "Email & Phone Support",
      "Training Materials",
      "Referral Link Generation",
    ],
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setMessage({ text: "Full name is required.", type: "error" })
      return false
    }
    if (!formData.email.trim()) {
      setMessage({ text: "Email address is required.", type: "error" })
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ text: "Please enter a valid email address.", type: "error" })
      return false
    }
    if (!formData.phone.trim()) {
      setMessage({ text: "Phone number is required.", type: "error" })
      return false
    }
    if (!formData.password) {
      setMessage({ text: "Password is required.", type: "error" })
      return false
    }
    if (formData.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" })
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" })
      return false
    }
    if (!formData.sponsorId.trim()) {
      setMessage({ text: "Sponsor ID is required.", type: "error" })
      return false
    }
    if (!formData.uplineId.trim()) {
      setMessage({ text: "Upline ID is required.", type: "error" })
      return false
    }
    if (!formData.agreeTerms) {
      setMessage({ text: "You must agree to the terms and conditions.", type: "error" })
      return false
    }
    if (pinMethod === "existing" && !formData.pin) {
      setMessage({ text: "Registration PIN is required.", type: "error" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const submissionData = {
        ...formData,
        pinMethod,
        packagePrice: PACKAGE.price,
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({ text: result.message, type: "success" })

        // Store user data for payment
        if (result.user) {
          localStorage.setItem("pending_user", JSON.stringify(result.user))
          localStorage.setItem("package_info", JSON.stringify(PACKAGE))
        }

        // Redirect to payment page
        setTimeout(() => {
          router.push("/payment")
        }, 2000)
      } else {
        setMessage({ text: result.message || "Registration failed", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error registering user. Please try again.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0066E0] to-[#003366] px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0066E0] mb-2">Create Your Bright Orion Account</h2>
          <p className="text-gray-600">Join our growing community today</p>
        </div>

        {/* Package Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-[#0066E0] mb-2">{PACKAGE.name}</h3>
            <div className="text-2xl sm:text-3xl font-bold text-[#0066E0] mb-4">{formatCurrency(PACKAGE.price)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {PACKAGE.features.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Your city or state"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>

            <div>
              <label htmlFor="sponsorId" className="block text-sm font-medium text-gray-700 mb-1">
                Sponsor ID *
              </label>
              <input
                type="text"
                id="sponsorId"
                name="sponsorId"
                required
                placeholder="Who invited you?"
                value={formData.sponsorId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>

            <div>
              <label htmlFor="uplineId" className="block text-sm font-medium text-gray-700 mb-1">
                Upline ID *
              </label>
              <input
                type="text"
                id="uplineId"
                name="uplineId"
                required
                placeholder="Matrix placement"
                value={formData.uplineId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            </div>
          </div>

          {/* PIN Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Registration PIN *</label>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
              <button
                type="button"
                onClick={() => setPinMethod("existing")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  pinMethod === "existing" ? "border-[#0066E0] bg-blue-50 text-[#0066E0]" : "border-gray-300"
                }`}
              >
                I have a PIN
              </button>
              <button
                type="button"
                onClick={() => setPinMethod("new")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  pinMethod === "new" ? "border-[#0066E0] bg-blue-50 text-[#0066E0]" : "border-gray-300"
                }`}
              >
                Get New PIN
              </button>
            </div>

            {pinMethod === "existing" ? (
              <input
                type="text"
                id="pin"
                name="pin"
                required
                placeholder="Enter your registration PIN"
                value={formData.pin}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
              />
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">
                      {"You'll receive your PIN after completing registration and payment."}
                    </p>
                    <p className="mt-1">PIN will be sent to your email and phone number within 24 hours.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
              />
            </div>
            <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
              I agree to the{" "}
              <a href="/terms" className="text-[#0066E0] hover:underline">
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-[#0066E0] hover:underline">
                Privacy Policy
              </a>{" "}
              *
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0066E0] text-white font-semibold rounded-lg hover:bg-[#0054c2] transition duration-200 flex items-center justify-center disabled:opacity-50 text-base sm:text-lg"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Registration...
              </>
            ) : (
              `${pinMethod === "new" ? "Register & Get PIN" : "Complete Registration"} - ${formatCurrency(PACKAGE.price)}`
            )}
          </button>
        </form>

        {message.text && (
          <div
            className={`mt-6 p-4 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center justify-center">
              {message.type === "success" ? (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="text-sm sm:text-base">{message.text}</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/login" className="text-[#0066E0] font-medium hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
