"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  onFilesChange?: (files: File[]) => void
  value?: File[]
  disabled?: boolean
  className?: string
}

export function FileUpload({
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  onFilesChange,
  value = [],
  disabled = false,
  className,
  ...props
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value)
  const [rejected, setRejected] = React.useState<File[]>([])
  const [uploadProgress, setUploadProgress] = React.useState<number>(0)

  // Update internal files state when value prop changes
  React.useEffect(() => {
    setFiles(value)
  }, [value])

  // Simulate upload progress
  React.useEffect(() => {
    if (files.length > 0 && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          return newProgress > 100 ? 100 : newProgress
        })
      }, 300)
      return () => clearTimeout(timer)
    }
    // Reset progress when files change
    if (files.length === 0) {
      setUploadProgress(0)
    }
  }, [files, uploadProgress])

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      const newFiles = maxFiles === 1 ? acceptedFiles.slice(0, 1) : [...files, ...acceptedFiles].slice(0, maxFiles)

      setFiles(newFiles)
      setRejected(rejectedFiles.map((r) => r.file))
      setUploadProgress(0)

      if (onFilesChange) {
        onFilesChange(newFiles)
      }
    },
    [files, maxFiles, onFilesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    onDrop,
    disabled,
  })

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
    if (onFilesChange) {
      onFilesChange(newFiles)
    }
  }

  const removeRejected = (index: number) => {
    const newRejected = [...rejected]
    newRejected.splice(index, 1)
    setRejected(newRejected)
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag & drop {maxFiles === 1 ? "file" : "files"} here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            {maxFiles === 1 ? "Image" : `Up to ${maxFiles} images`} (max {(maxSize / 1024 / 1024).toFixed(0)}MB each)
          </p>
        </div>
      </div>

      {/* Preview of uploaded files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-md border p-2 bg-background">
              {file.type.startsWith("image/") && (
                <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden border">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={file.name}
                    className="h-full w-full object-cover"
                    onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                <Progress value={uploadProgress} className="h-1 mt-1" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Display rejected files */}
      {rejected.length > 0 && (
        <div className="space-y-2">
          {rejected.map((file, index) => (
            <div
              key={`${file.name}-${index}-rejected`}
              className="flex items-center gap-2 rounded-md border border-destructive/50 p-2 bg-destructive/5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-destructive">
                  File rejected: {(file.size / 1024 / 1024).toFixed(2)}MB
                  {file.size > maxSize ? " (exceeds size limit)" : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeRejected(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
