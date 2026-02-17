# Albums & Gallery API Response Structure

## GET /api/albums

Returns an array of Album objects. **Yes, albums include their images by default!**

### Query Parameters:
- `limit?: number` (max 100) - Limit number of albums
- `summary?: boolean` - If `true`, returns only album count instead of full images array

### Response Structure:

#### Without `summary=true` (default - includes images):
```typescript
[
  {
    id: string,                    // Album ID (cuid)
    name: string,                   // Album name
    description: string | null,     // Album description
    coverUrl: string | null,        // Cover image URL
    createdAt: string,             // ISO 8601 date
    updatedAt: string,              // ISO 8601 date
    images: [                        // Array of images in this album
      {
        id: string,
        albumId: string | null,
        url: string,                // Public image URL
        path: string,               // Storage path
        filename: string,
        size: number | null,
        mimeType: string | null,
        createdAt: string
      },
      ...
    ]
  },
  ...
]
```

#### With `summary=true` (only count, no images):
```typescript
[
  {
    id: string,
    name: string,
    description: string | null,
    coverUrl: string | null,
    createdAt: string,
    updatedAt: string,
    _count: {
      images: number              // Number of images in album
    }
  },
  ...
]
```

### Example Response (without summary):
```json
[
  {
    "id": "clx123abc",
    "name": "Summer 2024",
    "description": "Summer vacation photos",
    "coverUrl": null,
    "createdAt": "2024-06-15T10:00:00.000Z",
    "updatedAt": "2024-06-15T10:00:00.000Z",
    "images": [
      {
        "id": "clx456def",
        "albumId": "clx123abc",
        "url": "https://...supabase.co/storage/v1/object/public/portfolio/images/photo1.jpg",
        "path": "albums/clx123abc/photo1.jpg",
        "filename": "photo1.jpg",
        "size": 245678,
        "mimeType": "image/jpeg",
        "createdAt": "2024-06-15T10:05:00.000Z"
      }
    ]
  }
]
```

---

## GET /api/gallery

Returns an array of Image objects (all images or filtered by album).

### Query Parameters:
- `albumId?: string` - Filter images by album ID
- `limit?: number` (max 100) - Limit number of images

### Response Structure:

```typescript
[
  {
    id: string,                    // Image ID (cuid)
    albumId: string | null,        // Album ID if belongs to an album
    url: string,                   // Public image URL
    path: string,                  // Storage path
    filename: string,              // Original filename
    size: number | null,           // File size in bytes
    mimeType: string | null,       // MIME type (e.g., "image/jpeg")
    createdAt: string             // ISO 8601 date
  },
  ...
]
```

### Example Responses:

#### All images (`GET /api/gallery`):
```json
[
  {
    "id": "clx456def",
    "albumId": "clx123abc",
    "url": "https://...supabase.co/storage/v1/object/public/portfolio/albums/clx123abc/photo1.jpg",
    "path": "albums/clx123abc/photo1.jpg",
    "filename": "photo1.jpg",
    "size": 245678,
    "mimeType": "image/jpeg",
    "createdAt": "2024-06-15T10:05:00.000Z"
  },
  {
    "id": "clx789ghi",
    "albumId": null,
    "url": "https://...supabase.co/storage/v1/object/public/portfolio/images/photo2.jpg",
    "path": "images/photo2.jpg",
    "filename": "photo2.jpg",
    "size": 189234,
    "mimeType": "image/png",
    "createdAt": "2024-06-16T14:20:00.000Z"
  }
]
```

#### Images by album (`GET /api/gallery?albumId=clx123abc`):
```json
[
  {
    "id": "clx456def",
    "albumId": "clx123abc",
    "url": "https://...supabase.co/storage/v1/object/public/portfolio/albums/clx123abc/photo1.jpg",
    "path": "albums/clx123abc/photo1.jpg",
    "filename": "photo1.jpg",
    "size": 245678,
    "mimeType": "image/jpeg",
    "createdAt": "2024-06-15T10:05:00.000Z"
  }
]
```

---

## Summary

**To answer your question:**

✅ **YES!** When you call `GET /api/albums` (without `summary=true`), you **will get the images** included in each album object.

**Two ways to get images:**

1. **Via Albums API** - Get albums with images included:
   ```
   GET /api/albums
   → Returns albums, each with an `images` array
   ```

2. **Via Gallery API** - Get images directly:
   ```
   GET /api/gallery                    → All images
   GET /api/gallery?albumId=xxx        → Images in specific album
   ```

**Use Albums API when:** You want album metadata + images together  
**Use Gallery API when:** You only need images (or want to filter by album)
