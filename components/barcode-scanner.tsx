"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Camera, X, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Import Quagga dynamically to avoid SSR issues
import dynamic from "next/dynamic"
const Quagga = dynamic(() => import("quagga").then((mod) => mod.default), {
  ssr: false,
})

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  isOpen: boolean
  onClose: () => void
}

export function BarcodeScanner({ onDetected, isOpen, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [camera, setCamera] = useState<MediaStream | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [activeCamera, setActiveCamera] = useState<string>("")
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize scanner when dialog opens
  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen])

  // Get available cameras
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setCameras(videoDevices)

      // Set default camera (usually back camera on mobile)
      if (videoDevices.length > 0) {
        // Try to find back camera
        const backCamera = videoDevices.find(
          (device) => device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear"),
        )
        setActiveCamera(backCamera?.deviceId || videoDevices[0].deviceId)
      }
    } catch (err) {
      console.error("Error getting cameras:", err)
      setError("Could not access camera list")
    }
  }

  // Initialize the barcode scanner
  const initializeScanner = async () => {
    try {
      setError(null)

      // Get camera permissions and available cameras
      await getCameras()

      if (!scannerRef.current) return

      if (Quagga) {
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                width: { min: 640 },
                height: { min: 480 },
                facingMode: "environment",
                deviceId: activeCamera ? { exact: activeCamera } : undefined,
              },
            },
            locator: {
              patchSize: "medium",
              halfSample: true,
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
              readers: [
                "ean_reader",
                "ean_8_reader",
                "code_128_reader",
                "code_39_reader",
                "code_93_reader",
                "upc_reader",
                "upc_e_reader",
              ],
            },
            locate: true,
          },
          (err) => {
            if (err) {
              console.error("Error initializing Quagga:", err)
              setError("Could not initialize barcode scanner")
              return
            }

            // Start scanning
            Quagga.start()
            setScanning(true)

            // Get camera stream for cleanup
            const videoEl = scannerRef.current?.querySelector("video")
            if (videoEl && videoEl.srcObject instanceof MediaStream) {
              setCamera(videoEl.srcObject)
            }
          },
        )

        // Set up barcode detection handler
        Quagga.onDetected((result) => {
          if (result && result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code

            // Play success sound
            const audio = new Audio("/barcode-beep.mp3")
            audio.play().catch(() => {
              // Ignore audio play errors
            })

            // Stop scanner and return the barcode
            stopScanner()
            onDetected(code)
            onClose()

            toast({
              title: "Barcode detected",
              description: `Scanned barcode: ${code}`,
            })
          }
        })
      }
    } catch (err) {
      console.error("Error setting up scanner:", err)
      setError("Could not access camera. Please check permissions.")
    }
  }

  // Stop the scanner and release camera
  const stopScanner = () => {
    if (Quagga) {
      Quagga.stop()
    }

    // Release camera stream
    if (camera) {
      camera.getTracks().forEach((track) => track.stop())
      setCamera(null)
    }

    setScanning(false)
  }

  // Switch between available cameras
  const switchCamera = () => {
    stopScanner()

    // Find next camera in the list
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex((cam) => cam.deviceId === activeCamera)
      const nextIndex = (currentIndex + 1) % cameras.length
      setActiveCamera(cameras[nextIndex].deviceId)

      // Reinitialize with new camera
      setTimeout(() => {
        initializeScanner()
      }, 300)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Position the barcode within the scanner area. It will be detected automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg border">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-muted">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={initializeScanner}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : (
            <div ref={scannerRef} className="relative aspect-video w-full overflow-hidden bg-black">
              {/* Scanner will be initialized here */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="border-2 border-primary w-2/3 h-1/3 rounded-lg opacity-70"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          {cameras.length > 1 && (
            <Button variant="outline" onClick={switchCamera} disabled={!scanning}>
              <Camera className="mr-2 h-4 w-4" />
              Switch Camera
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
