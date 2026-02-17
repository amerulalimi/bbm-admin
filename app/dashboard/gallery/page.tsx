"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPlus, IconUpload, IconPhoto, IconFolder, IconX, IconTrash, IconPencil } from "@tabler/icons-react"
import { toast } from "sonner"

type Image = {
  id: string
  url: string
  filename: string
  albumId: string | null
  createdAt: string
}

type Album = {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  images: Image[]
}

export default function GalleryPage() {
  const [images, setImages] = useState<Image[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<string | "all">("all")
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumDesc, setNewAlbumDesc] = useState("")
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false)
  const [uploadAlbumId, setUploadAlbumId] = useState<string | "">("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set())
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void | Promise<void>
  }>({ open: false, title: "", message: "", onConfirm: () => {} })
  const [editAlbumName, setEditAlbumName] = useState("")
  const [editAlbumDesc, setEditAlbumDesc] = useState("")
  const [editAlbumCoverUrl, setEditAlbumCoverUrl] = useState<string | null>(null)
  const [editAlbumCoverFile, setEditAlbumCoverFile] = useState<File | null>(null)
  const [savingAlbum, setSavingAlbum] = useState(false)
  const [newAlbumCoverUrl, setNewAlbumCoverUrl] = useState<string | null>(null)
  const [newAlbumCoverFile, setNewAlbumCoverFile] = useState<File | null>(null)
  const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false)
  const [coverImageMode, setCoverImageMode] = useState<"create" | "edit">("create")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  const currentAlbum =
    selectedAlbum !== "all" ? albums.find((a) => a.id === selectedAlbum) : null

  useEffect(() => {
    if (currentAlbum) {
      setEditAlbumName(currentAlbum.name)
      setEditAlbumDesc(currentAlbum.description ?? "")
      setEditAlbumCoverUrl(currentAlbum.coverUrl)
    }
  }, [currentAlbum?.id, currentAlbum?.name, currentAlbum?.description, currentAlbum?.coverUrl])

  function openConfirm(title: string, message: string, onConfirm: () => void | Promise<void>) {
    setConfirmModal({ open: true, title, message, onConfirm })
  }

  function closeConfirm() {
    setConfirmModal((prev) => ({ ...prev, open: false }))
  }

  async function handleDeleteAlbum(albumId: string, albumName: string) {
    openConfirm(
      "Delete album",
      `Delete album "${albumName}"? Images in this album will remain in the gallery.`,
      async () => {
        try {
          const res = await fetch(`/api/albums/${albumId}`, { method: "DELETE" })
          if (!res.ok) throw new Error("Failed to delete album")
          toast.success("Album deleted")
          closeConfirm()
          fetchData()
        } catch {
          toast.error("Failed to delete album")
          closeConfirm()
        }
      }
    )
  }

  async function handleDeleteImages(ids: string[]) {
    if (ids.length === 0) return
    const label = ids.length === 1 ? "this image" : `${ids.length} images`
    openConfirm(
      "Delete image(s)",
      `Are you sure you want to delete ${label}?`,
      async () => {
        try {
          const res = await fetch("/api/gallery", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          })
          if (!res.ok) throw new Error("Failed to delete")
          toast.success(ids.length === 1 ? "Image deleted" : "Images deleted")
          closeConfirm()
          setSelectedImageIds(new Set())
          fetchData()
        } catch {
          toast.error("Failed to delete image(s)")
          closeConfirm()
        }
      }
    )
  }

  function toggleImageSelection(id: string) {
    setSelectedImageIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const displayImages =
    selectedAlbum === "all"
      ? images
      : images.filter((img) => img.albumId === selectedAlbum)

  function toggleSelectAllDisplayed() {
    if (selectedImageIds.size === displayImages.length) {
      setSelectedImageIds(new Set())
    } else {
      setSelectedImageIds(new Set(displayImages.map((img) => img.id)))
    }
  }

  async function handleUpdateAlbum() {
    if (!currentAlbum || !editAlbumName.trim()) return
    setSavingAlbum(true)
    try {
      let coverUrl = editAlbumCoverUrl
      
      // If a new cover file was uploaded, upload it first
      if (editAlbumCoverFile) {
        const fd = new FormData()
        fd.append("file", editAlbumCoverFile)
        fd.append("albumId", currentAlbum.id)
        const uploadRes = await fetch("/api/gallery/upload", {
          method: "POST",
          body: fd,
        })
        if (!uploadRes.ok) throw new Error("Failed to upload cover image")
        const uploadedImage = await uploadRes.json()
        coverUrl = uploadedImage.url
      }

      const res = await fetch(`/api/albums/${currentAlbum.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editAlbumName.trim(),
          description: editAlbumDesc.trim() || null,
          coverUrl,
        }),
      })
      if (!res.ok) throw new Error("Failed to update album")
      toast.success("Album updated")
      setEditAlbumCoverUrl(coverUrl)
      setEditAlbumCoverFile(null)
      if (coverFileInputRef.current) coverFileInputRef.current.value = ""
      fetchData()
    } catch {
      toast.error("Failed to update album")
    } finally {
      setSavingAlbum(false)
    }
  }

  async function fetchData() {
    try {
      const [imagesRes, albumsRes] = await Promise.all([
        fetch("/api/gallery"),
        fetch("/api/albums"),
      ])
      if (imagesRes.ok) setImages(await imagesRes.json())
      if (albumsRes.ok) setAlbums(await albumsRes.json())
    } catch {
      toast.error("Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault()
    if (!newAlbumName.trim()) return
    try {
      let coverUrl: string | null = null
      
      // If cover image was selected from existing images
      if (newAlbumCoverUrl && !newAlbumCoverFile) {
        coverUrl = newAlbumCoverUrl
      }
      // If new cover file was uploaded, upload it first
      else if (newAlbumCoverFile) {
        const fd = new FormData()
        fd.append("file", newAlbumCoverFile)
        const uploadRes = await fetch("/api/gallery/upload", {
          method: "POST",
          body: fd,
        })
        if (!uploadRes.ok) throw new Error("Failed to upload cover image")
        const uploadedImage = await uploadRes.json()
        coverUrl = uploadedImage.url
      }

      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAlbumName.trim(),
          description: newAlbumDesc.trim() || undefined,
          coverUrl,
        }),
      })
      if (!res.ok) throw new Error("Failed to create album")
      toast.success("Album created")
      setNewAlbumName("")
      setNewAlbumDesc("")
      setNewAlbumCoverUrl(null)
      setNewAlbumCoverFile(null)
      setCreateAlbumOpen(false)
      if (coverFileInputRef.current) coverFileInputRef.current.value = ""
      fetchData()
    } catch {
      toast.error("Failed to create album")
    }
  }

  function handleCoverFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewAlbumCoverFile(file)
    setNewAlbumCoverUrl(null) // Clear selected image if file is selected
    e.target.value = ""
  }

  function handleCoverFileSelectEdit(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditAlbumCoverFile(file)
    const url = URL.createObjectURL(file)
    setEditAlbumCoverUrl(url)
    e.target.value = ""
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    const fileList = Array.from(files)
    setPendingFiles((prev) => [...prev, ...fileList])
    const urls = fileList.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...urls])
    e.target.value = ""
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index])
      next.splice(index, 1)
      return next
    })
  }

  function clearPendingAndClose() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setPendingFiles([])
    setUploadAlbumId("")
    setUploadDialogOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleUploadClick() {
    if (!pendingFiles.length) return
    setUploading(true)
    try {
      for (const file of pendingFiles) {
        const fd = new FormData()
        fd.append("file", file)
        if (uploadAlbumId) fd.append("albumId", uploadAlbumId)
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: fd,
        })
        if (!res.ok) throw new Error("Upload failed")
      }
      toast.success("Images uploaded")
      clearPendingAndClose()
      fetchData()
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Dialog open={confirmModal.open} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmModal.title}</DialogTitle>
            <DialogDescription>{confirmModal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeConfirm}>
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmModal.onConfirm()
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={coverImageDialogOpen} onOpenChange={setCoverImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Cover Image</DialogTitle>
            <DialogDescription>
              Choose an image from {coverImageMode === "edit" && currentAlbum ? "this album" : "the gallery"} to use as the cover image.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {coverImageMode === "edit" && currentAlbum ? (
              currentAlbum.images && currentAlbum.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                  {currentAlbum.images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        setEditAlbumCoverUrl(img.url)
                        setEditAlbumCoverFile(null)
                        setCoverImageDialogOpen(false)
                      }}
                      className="group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-primary"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="h-full w-full object-cover"
                      />
                      {editAlbumCoverUrl === img.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <IconPhoto className="size-6 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No images in this album yet.
                </p>
              )
            ) : images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setNewAlbumCoverUrl(img.url)
                      setNewAlbumCoverFile(null)
                      setCoverImageDialogOpen(false)
                    }}
                    className="group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="h-full w-full object-cover"
                    />
                    {newAlbumCoverUrl === img.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <IconPhoto className="size-6 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No images in gallery yet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCoverImageDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Gallery & Albums</h1>
        <div className="flex gap-2">
          <Dialog open={createAlbumOpen} onOpenChange={setCreateAlbumOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <IconFolder className="mr-2 size-4" />
                New Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateAlbum}>
                <DialogHeader>
                  <DialogTitle>Create Album</DialogTitle>
                  <DialogDescription>
                    Create a new album to organize your images
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="album-name">Name</Label>
                    <Input
                      id="album-name"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Album name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="album-desc">Description (optional)</Label>
                    <Textarea
                      id="album-desc"
                      value={newAlbumDesc}
                      onChange={(e) => setNewAlbumDesc(e.target.value)}
                      placeholder="Album description"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cover Image (optional)</Label>
                    <div className="flex flex-col gap-2">
                      {newAlbumCoverUrl && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={newAlbumCoverUrl}
                            alt="Cover preview"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 size-6"
                            onClick={() => {
                              setNewAlbumCoverUrl(null)
                              setNewAlbumCoverFile(null)
                            }}
                          >
                            <IconX className="size-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          ref={coverFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverFileSelect}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => coverFileInputRef.current?.click()}
                        >
                          <IconUpload className="mr-2 size-4" />
                          Upload Cover
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCoverImageMode("create")
                            setCoverImageDialogOpen(true)
                          }}
                        >
                          <IconPhoto className="mr-2 size-4" />
                          Select from Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateAlbumOpen(false)
                      setNewAlbumCoverUrl(null)
                      setNewAlbumCoverFile(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog
            open={uploadDialogOpen}
            onOpenChange={(open) => {
              setUploadDialogOpen(open)
              if (!open) {
                previewUrls.forEach((url) => URL.revokeObjectURL(url))
                setPreviewUrls([])
                setPendingFiles([])
                setUploadAlbumId("")
                if (fileInputRef.current) fileInputRef.current.value = ""
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <IconUpload className="mr-2 size-4" />
                Upload Images
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Images</DialogTitle>
                <DialogDescription>
                  Select images to preview, then click Upload to add them to the gallery.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Images
                  </Button>
                  {albums.length > 0 && (
                    <Select
                      value={uploadAlbumId}
                      onValueChange={setUploadAlbumId}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Album (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {albums.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {pendingFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {pendingFiles.length} image(s) selected — click Upload to add them.
                    </p>
                    <div className="grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto rounded-lg border p-2 sm:grid-cols-4">
                      {pendingFiles.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="group relative aspect-square overflow-hidden rounded-md bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrls[i]}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePendingFile(i)}
                            className="absolute right-1 top-1 rounded-full bg-destructive/90 p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Remove"
                          >
                            <IconX className="size-3.5" />
                          </button>
                          <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[10px] text-white">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearPendingAndClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadClick}
                  disabled={pendingFiles.length === 0 || uploading}
                >
                  {uploading ? "Uploading..." : "Upload Images"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {albums.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedAlbum === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlbum("all")}
          >
            All Images ({images.length})
          </Button>
          {albums.map((a) => (
            <div key={a.id} className="flex items-center gap-1">
              <Button
                variant={selectedAlbum === a.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAlbum(a.id)}
              >
                {a.name} ({a.images?.length ?? 0})
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteAlbum(a.id, a.name)
                }}
                aria-label={`Delete album ${a.name}`}
              >
                <IconTrash className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {currentAlbum && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <IconPencil className="size-4" />
            <span className="text-sm font-medium">Album details</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-album-name">Name</Label>
              <Input
                id="edit-album-name"
                value={editAlbumName}
                onChange={(e) => setEditAlbumName(e.target.value)}
                placeholder="Album name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-album-desc">Description</Label>
              <Textarea
                id="edit-album-desc"
                value={editAlbumDesc}
                onChange={(e) => setEditAlbumDesc(e.target.value)}
                placeholder="Album description (optional)"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Cover Image</Label>
              <div className="flex flex-col gap-2">
                {editAlbumCoverUrl && (
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editAlbumCoverUrl}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 size-6"
                      onClick={() => {
                        setEditAlbumCoverUrl(null)
                        setEditAlbumCoverFile(null)
                        if (coverFileInputRef.current) coverFileInputRef.current.value = ""
                      }}
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileSelectEdit}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    <IconUpload className="mr-2 size-4" />
                    Upload New Cover
                  </Button>
                  {currentAlbum.images && currentAlbum.images.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCoverImageMode("edit")
                        setCoverImageDialogOpen(true)
                      }}
                    >
                      <IconPhoto className="mr-2 size-4" />
                      Select from Album
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button
                size="sm"
                onClick={handleUpdateAlbum}
                disabled={savingAlbum || !editAlbumName.trim()}
              >
                {savingAlbum ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {displayImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
          <IconPhoto className="size-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            {selectedAlbum === "all"
              ? "No images yet. Upload some images to get started."
              : "No images in this album."}
          </p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <IconPlus className="mr-2 size-4" />
            Upload Images
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleSelectAllDisplayed}
            >
              {selectedImageIds.size === displayImages.length
                ? "Deselect all"
                : "Select all"}
            </Button>
            {selectedImageIds.size > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteImages(Array.from(selectedImageIds))}
              >
                <IconTrash className="mr-2 size-4" />
                Delete selected ({selectedImageIds.size})
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {displayImages.map((img) => (
              <Card
                key={img.id}
                className="group relative overflow-hidden transition-shadow hover:shadow-md"
              >
                <div
                  className="absolute left-2 top-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedImageIds.has(img.id)}
                    onCheckedChange={() => toggleImageSelection(img.id)}
                    aria-label={`Select ${img.filename}`}
                    className="border-background bg-background/80 shadow"
                  />
                </div>
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImages([img.id])
                  }}
                  aria-label={`Delete ${img.filename}`}
                >
                  <IconTrash className="size-4" />
                </button>
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate p-2 text-xs text-muted-foreground">
                  {img.filename}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
