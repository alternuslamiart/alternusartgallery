import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Upload image to Cloudinary
export async function uploadImage(
  file: string, // base64 or URL
  folder: string = 'artworks'
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `alternus/${folder}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' },
      ],
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image')
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image')
  }
}

// Generate optimized image URL
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string
  } = {}
): string {
  const { width, height, quality = 'auto' } = options

  const transformations: string[] = [`q_${quality}`, 'f_auto']

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (width || height) transformations.push('c_fill')

  return cloudinary.url(publicId, {
    transformation: transformations.join(','),
  })
}
