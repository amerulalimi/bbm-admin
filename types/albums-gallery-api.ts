/**
 * Type definitions for Albums & Gallery API Responses
 */

/**
 * Image structure returned by both APIs
 */
export interface ImageResponse {
  /** Image ID (cuid) */
  id: string
  
  /** Album ID if image belongs to an album, null otherwise */
  albumId: string | null
  
  /** Public image URL */
  url: string
  
  /** Storage path in Supabase */
  path: string
  
  /** Original filename */
  filename: string
  
  /** File size in bytes (optional) */
  size: number | null
  
  /** MIME type (e.g., "image/jpeg") (optional) */
  mimeType: string | null
  
  /** ISO 8601 date string when image was created */
  createdAt: string
}

/**
 * Album structure with images included
 * GET /api/albums (without summary=true)
 */
export interface AlbumWithImagesResponse {
  /** Album ID (cuid) */
  id: string
  
  /** Album name */
  name: string
  
  /** Album description (optional) */
  description: string | null
  
  /** Cover image URL (optional) */
  coverUrl: string | null
  
  /** ISO 8601 date string when album was created */
  createdAt: string
  
  /** ISO 8601 date string when album was last updated */
  updatedAt: string
  
  /** Array of images in this album */
  images: ImageResponse[]
}

/**
 * Album structure with image count only
 * GET /api/albums?summary=true
 */
export interface AlbumSummaryResponse {
  /** Album ID (cuid) */
  id: string
  
  /** Album name */
  name: string
  
  /** Album description (optional) */
  description: string | null
  
  /** Cover image URL (optional) */
  coverUrl: string | null
  
  /** ISO 8601 date string when album was created */
  createdAt: string
  
  /** ISO 8601 date string when album was last updated */
  updatedAt: string
  
  /** Count of images in album */
  _count: {
    images: number
  }
}

/**
 * Albums API Response
 * GET /api/albums
 */
export type AlbumsApiResponse = AlbumWithImagesResponse[]

/**
 * Albums API Response (with summary)
 * GET /api/albums?summary=true
 */
export type AlbumsSummaryApiResponse = AlbumSummaryResponse[]

/**
 * Gallery API Response
 * GET /api/gallery
 * GET /api/gallery?albumId=xxx
 */
export type GalleryApiResponse = ImageResponse[]
