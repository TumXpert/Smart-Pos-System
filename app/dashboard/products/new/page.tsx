"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Barcode, Search } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/ui/file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarcodeScanner } from "@/components/barcode-scanner"

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    price: "",
    costPrice: "",
    stock: "",
    reorderLevel: "",
    description: "",
  })
  const [productImages, setProductImages] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects a value
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImagesChange = (files: File[]) => {
    setProductImages(files)

    // Clear image error if it exists
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }))
    }
  }

  const handleBarcodeDetected = (barcode: string) => {
    setFormData((prev) => ({ ...prev, barcode }))

    // Clear barcode error if it exists
    if (errors.barcode) {
      setErrors((prev) => ({ ...prev, barcode: "" }))
    }

    // Lookup product information by barcode
    lookupProductByBarcode(barcode)
  }

  const lookupProductByBarcode = async (barcode: string) => {
    setIsLookupLoading(true)

    try {
      // In a real app, you would call an API to lookup product information
      // This is a mock implementation that simulates an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate finding product information for some barcodes
      if (barcode === "9781234567897") {
        // Example book
        setFormData((prev) => ({
          ...prev,
          name: "The Art of Programming",
          sku: "BOOK-" + barcode.slice(-4),
          category: "other",
          price: "29.99",
          costPrice: "15.50",
          description: "A comprehensive guide to programming fundamentals and best practices.",
        }))

        toast({
          title: "Product found",
          description: "Product information has been filled automatically.",
        })
      } else if (barcode === "5901234123457") {
        // Example electronics item
        setFormData((prev) => ({
          ...prev,
          name: "Wireless Earbuds Pro",
          sku: "ELEC-" + barcode.slice(-4),
          category: "electronics",
          price: "89.99",
          costPrice: "45.00",
          description: "Premium wireless earbuds with noise cancellation and long battery life.",
        }))

        toast({
          title: "Product found",
          description: "Product information has been filled automatically.",
        })
      } else {
        // No product found in database
        toast({
          title: "Product not found",
          description: "No product information found for this barcode. Please enter details manually.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lookup failed",
        description: "Failed to lookup product information. Please try again or enter details manually.",
      })
    } finally {
      setIsLookupLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters"
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required"
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.sku)) {
      newErrors.sku = "SKU can only contain letters, numbers, and hyphens"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = "Selling price is required"
    } else if (Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than zero"
    } else if (Number.parseFloat(formData.price) > 1000000) {
      newErrors.price = "Price cannot exceed 1,000,000"
    }

    // Cost price validation
    if (!formData.costPrice) {
      newErrors.costPrice = "Cost price is required"
    } else if (Number.parseFloat(formData.costPrice) < 0) {
      newErrors.costPrice = "Cost price cannot be negative"
    } else if (Number.parseFloat(formData.costPrice) > 1000000) {
      newErrors.costPrice = "Cost price cannot exceed 1,000,000"
    }

    // Stock validation
    if (!formData.stock) {
      newErrors.stock = "Initial stock is required"
    } else if (Number.parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock cannot be negative"
    } else if (!Number.isInteger(Number.parseFloat(formData.stock))) {
      newErrors.stock = "Stock must be a whole number"
    }

    // Reorder level validation
    if (formData.reorderLevel && Number.parseInt(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = "Reorder level cannot be negative"
    } else if (formData.reorderLevel && !Number.isInteger(Number.parseFloat(formData.reorderLevel))) {
      newErrors.reorderLevel = "Reorder level must be a whole number"
    }

    // Barcode validation (if provided)
    if (formData.barcode && !/^[0-9]+$/.test(formData.barcode)) {
      newErrors.barcode = "Barcode must contain only numbers"
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters"
    }

    // Image validation
    if (productImages.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form.",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would upload the images first
      // and then save the product with the image URLs

      // Simulate image upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Then save the product data
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Product created",
        description: "Your product has been added to inventory.",
      })
      router.push("/dashboard/products")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create product",
        description: "There was an error adding your product. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Enter the details of your new product</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList>
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className={errors.sku ? "text-destructive" : ""}>
                      SKU *
                    </Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      className={errors.sku ? "border-destructive" : ""}
                    />
                    {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className={errors.barcode ? "text-destructive" : ""}>
                      Barcode (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        className={cn(errors.barcode ? "border-destructive" : "", "flex-1")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsScannerOpen(true)}
                        className="shrink-0"
                      >
                        <Barcode className="h-4 w-4 mr-2" />
                        Scan
                      </Button>
                      {formData.barcode && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => lookupProductByBarcode(formData.barcode)}
                          disabled={isLookupLoading}
                          className="shrink-0"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          {isLookupLoading ? "Looking up..." : "Lookup"}
                        </Button>
                      )}
                    </div>
                    {errors.barcode && <p className="text-sm text-destructive">{errors.barcode}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className={errors.category ? "text-destructive" : ""}>
                      Category *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="food">Food & Beverages</SelectItem>
                        <SelectItem value="health">Health & Beauty</SelectItem>
                        <SelectItem value="home">Home & Kitchen</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className={errors.price ? "text-destructive" : ""}>
                      Selling Price *
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className={errors.price ? "border-destructive" : ""}
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice" className={errors.costPrice ? "text-destructive" : ""}>
                      Cost Price *
                    </Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={handleChange}
                      required
                      className={errors.costPrice ? "border-destructive" : ""}
                    />
                    {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  <p className="text-sm text-muted-foreground">{formData.description.length}/500 characters</p>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div className="space-y-2">
                  <Label className={errors.images ? "text-destructive" : ""}>Product Images *</Label>
                  <FileUpload
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024} // 5MB
                    value={productImages}
                    onFilesChange={handleImagesChange}
                    className={errors.images ? "border-destructive rounded-lg" : ""}
                  />
                  {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images. First image will be used as the product thumbnail.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stock" className={errors.stock ? "text-destructive" : ""}>
                      Initial Stock *
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      className={errors.stock ? "border-destructive" : ""}
                    />
                    {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel" className={errors.reorderLevel ? "text-destructive" : ""}>
                      Reorder Level
                    </Label>
                    <Input
                      id="reorderLevel"
                      name="reorderLevel"
                      type="number"
                      min="0"
                      value={formData.reorderLevel}
                      onChange={handleChange}
                      className={errors.reorderLevel ? "border-destructive" : ""}
                    />
                    {errors.reorderLevel && <p className="text-sm text-destructive">{errors.reorderLevel}</p>}
                    <p className="text-sm text-muted-foreground">
                      System will alert you when stock falls below this level
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />
    </div>
  )
}

// Helper function to conditionally join class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
