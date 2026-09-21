import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { consumePersistentRateLimit, rateLimitResponse } from '@/lib/persistent-rate-limit'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
 try {
 const session = await auth()

 // Check if user is authenticated
 if (!session?.user?.id) {
 return NextResponse.json(
 { error: 'You must be logged in to upload images' },
 { status: 401 }
 )
 }
 const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
 const limit = await consumePersistentRateLimit(`image-upload:${session.user.id}:${ip}`, { limit: 10, windowSeconds: 900 })
 if (!limit.success) {
  return NextResponse.json({ error: "Too many uploads. Please try again later." }, rateLimitResponse(limit))
 }

 const body = (await request.json()) as { image?: unknown; folder?: unknown }
 const image = typeof body.image === "string" ? body.image : ""
 const folder = typeof body.folder === "string" ? body.folder : "Coreforge-assets"

 if (!image || !/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(image)) {
 return NextResponse.json(
 { error: 'A valid PNG, JPEG, WEBP, or GIF data image is required' },
 { status: 400 }
 )
 }
 const base64Payload = image.slice(image.indexOf(",") + 1).replace(/\s/g, "")
 const estimatedBytes = Math.floor((base64Payload.length * 3) / 4)
 if (estimatedBytes > 10 * 1024 * 1024) {
  return NextResponse.json({ error: "Image exceeds the 10 MB upload limit." }, { status: 413 })
 }

 // Upload to Cloudinary
 const result = await uploadImage(image, folder)

 return NextResponse.json({
 success: true,
 url: result.url,
 publicId: result.publicId,
 })
 } catch (error) {
 console.error('Upload error:', error)
 return NextResponse.json(
 { error: 'Failed to upload image' },
 { status: 500 }
 )
 }
}
