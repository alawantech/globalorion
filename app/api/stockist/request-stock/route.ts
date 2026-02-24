import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Stock request endpoint moved to Firebase. Not yet implemented in this route." })
}
