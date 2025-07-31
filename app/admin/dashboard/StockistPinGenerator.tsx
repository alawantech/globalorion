"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore"
import { Copy } from "lucide-react"

const PACKAGE_OPTIONS = [
	{ label: "₦5M Package", value: "5M" },
	{ label: "₦10M Package", value: "10M" },
	{ label: "₦15M Package", value: "15M" },
	{ label: "₦20M Package", value: "20M" },
]

function generateRandomPin(length = 8) {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	let pin = ""
	for (let i = 0; i < length; i++) {
		pin += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return pin
}

function StockistPinsDisplay() {
	const [pins, setPins] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [copiedPin, setCopiedPin] = useState<string | null>(null)
	const [sendingPinIds, setSendingPinIds] = useState<string[]>([])

	useEffect(() => {
		// Use Firestore real-time updates for pins
		const unsub = onSnapshot(collection(db, "stockistPins"), snap => {
			setPins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
			setLoading(false)
		})
		return () => unsub()
	}, [])

	// Group pins by packageType and status
	const grouped: Record<string, Record<string, any[]>> = {}
	for (const pkg of PACKAGE_OPTIONS) {
		grouped[pkg.value] = { unused: [], sent: [], used: [] }
	}
	for (const pin of pins) {
		if (grouped[pin.packageType]) {
			if (pin.status === "unused") grouped[pin.packageType].unused.push(pin)
			else if (pin.status === "sent") grouped[pin.packageType].sent.push(pin)
			else if (pin.status === "used") grouped[pin.packageType].used.push(pin)
		}
	}

	// Helper to format Firestore Timestamp or JS Date
	function formatDate(ts: any) {
		if (!ts) return ""
		if (typeof ts === "object" && typeof ts.toDate === "function") {
			return ts.toDate().toLocaleString()
		}
		if (typeof ts === "number") {
			return new Date(ts).toLocaleString()
		}
		return String(ts)
	}

	function handleCopyPin(pinValue: string) {
		navigator.clipboard.writeText(pinValue)
		setCopiedPin(pinValue)
		setTimeout(() => setCopiedPin(null), 1200)
	}

	// Mark pin as sent
	async function handleMarkPinSent(pinId: string) {
		setSendingPinIds(prev => [...prev, pinId])
		try {
			const pinRef = doc(db, "stockistPins", pinId)
			await updateDoc(pinRef, {
				status: "sent",
				sentAt: Timestamp.now(),
			})
			// Optimistically update UI immediately
			setPins(prev =>
				prev.map(pin =>
					pin.id === pinId
						? { ...pin, status: "sent", sentAt: new Date() }
						: pin
				)
			)
		} catch {}
		setSendingPinIds(prev => prev.filter(id => id !== pinId))
	}

	return (
		<div className="mb-8">
			<h3 className="text-xl font-bold mb-4">All Stockist PINs</h3>
			{loading ? (
				<div className="text-gray-500">Loading stockist pins...</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{PACKAGE_OPTIONS.map(pkg => (
						<div key={pkg.value} className="bg-white rounded-xl shadow p-4 border">
							<h4 className="text-lg font-semibold mb-2">{pkg.label}</h4>
							{/* Available */}
							<div className="mb-2">
								<span className="font-bold text-green-700">Available:</span>{" "}
								<span className="font-mono">{grouped[pkg.value].unused.length}</span>
							</div>
							<div className="flex flex-wrap gap-2 mb-4">
								{grouped[pkg.value].unused.slice(0, 10).map(pin => (
									<div key={pin.id} className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs flex items-center gap-1">
										<input
											type="checkbox"
											checked={false}
											disabled={sendingPinIds.includes(pin.id)}
											onChange={() => handleMarkPinSent(pin.id)}
											title="Mark as sent"
										/>
										<span>{pin.pin}</span>
										<button
											className="ml-1 text-gray-500 hover:text-blue-700"
											title="Copy PIN"
											style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
											onClick={() => handleCopyPin(pin.pin)}
										>
											<Copy className="w-4 h-4" />
										</button>
										{copiedPin === pin.pin && (
											<span className="ml-1 text-green-600 text-xs">Copied!</span>
										)}
										<span className="text-[10px] text-gray-500 ml-2">
											Created: {formatDate(pin.createdAt)}
										</span>
									</div>
								))}
								{grouped[pkg.value].unused.length > 10 && (
									<span className="text-xs text-gray-400">+{grouped[pkg.value].unused.length - 10} more</span>
								)}
							</div>
							{/* Sent */}
							<div className="mb-2">
								<span className="font-bold text-blue-700">Sent:</span>{" "}
								<span className="font-mono">{grouped[pkg.value].sent.length}</span>
							</div>
							<div className="flex flex-wrap gap-2 mb-4">
								{grouped[pkg.value].sent.slice(0, 10).map(pin => (
									<div key={pin.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs flex items-center gap-1">
										<span>{pin.pin}</span>
										<button
											className="ml-1 text-gray-500 hover:text-blue-700"
											title="Copy PIN"
											style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
											onClick={() => handleCopyPin(pin.pin)}
										>
											<Copy className="w-4 h-4" />
										</button>
										{copiedPin === pin.pin && (
											<span className="ml-1 text-green-600 text-xs">Copied!</span>
										)}
										<span className="text-[10px] text-gray-500 ml-2">
											Created: {formatDate(pin.createdAt)}
										</span>
									</div>
								))}
								{grouped[pkg.value].sent.length > 10 && (
									<span className="text-xs text-gray-400">+{grouped[pkg.value].sent.length - 10} more</span>
								)}
							</div>
							{/* Used */}
							<div className="mb-2">
								<span className="font-bold text-orange-700">Used:</span>{" "}
								<span className="font-mono">{grouped[pkg.value].used.length}</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{grouped[pkg.value].used.slice(0, 10).map(pin => (
									<div key={pin.id} className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-mono text-xs flex items-center gap-1">
										<span>{pin.pin}</span>
										<button
											className="ml-1 text-gray-500 hover:text-blue-700"
											title="Copy PIN"
											style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
											onClick={() => handleCopyPin(pin.pin)}
										>
											<Copy className="w-4 h-4" />
										</button>
										{copiedPin === pin.pin && (
											<span className="ml-1 text-green-600 text-xs">Copied!</span>
										)}
										<span className="text-[10px] text-gray-500 ml-2">
											Used: {formatDate(pin.usedAt)}
										</span>
										<span className="text-[10px] text-gray-500 ml-2">
											Used by: {pin.usedBy || "—"}
										</span>
										<span className="text-[10px] text-gray-400 ml-2">
											Created: {formatDate(pin.createdAt)}
										</span>
									</div>
								))}
								{grouped[pkg.value].used.length > 10 && (
									<span className="text-xs text-gray-400">+{grouped[pkg.value].used.length - 10} more</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default function StockistPinGenerator() {
	const [packageType, setPackageType] = useState(PACKAGE_OPTIONS[0].value)
	const [quantity, setQuantity] = useState(1)
	const [generating, setGenerating] = useState(false)
	const [message, setMessage] = useState<string | null>(null)

	const handleGenerate = async () => {
		setGenerating(true)
		setMessage(null)
		try {
			let created = 0
			const batch: any[] = []
			for (let i = 0; i < quantity; i++) {
				batch.push(
					addDoc(collection(db, "stockistPins"), {
						pin: generateRandomPin(10),
						packageType,
						status: "unused",
						createdAt: Timestamp.now(),
						usedAt: null,
						usedBy: null,
					})
				)
			}
			await Promise.all(batch)
			created = batch.length
			setMessage(`Generated ${created} pin(s) for ${PACKAGE_OPTIONS.find(p => p.value === packageType)?.label}`)
			// No need to manually update pins state; onSnapshot will update UI immediately
		} catch (err: any) {
			setMessage("Failed to generate pins")
		}
		setGenerating(false)
	}

	return (
		<>
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Generate Stockist PINs</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
						{PACKAGE_OPTIONS.map(opt => (
							<Button
								key={opt.value}
								variant={packageType === opt.value ? "default" : "outline"}
								className="w-full"
								onClick={() => setPackageType(opt.value)}
								disabled={generating}
							>
								{opt.label}
							</Button>
						))}
					</div>
					<div className="flex items-end gap-4 mb-4">
						<div>
							<Label htmlFor="stockist-pin-qty">Quantity</Label>
							<Input
								id="stockist-pin-qty"
								type="number"
								min={1}
								max={100}
								value={quantity}
								onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
								disabled={generating}
								className="w-24"
							/>
						</div>
						<Button onClick={handleGenerate} disabled={generating || quantity < 1}>
							{generating ? "Generating..." : "Generate PINs"}
						</Button>
					</div>
					{message && (
						<div className="mt-2 text-sm text-green-700">{message}</div>
					)}
				</CardContent>
			</Card>
			<StockistPinsDisplay />
		</>
	)
}
