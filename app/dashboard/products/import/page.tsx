"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, AlertCircle, Check, X, HelpCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the expected product fields
type ProductField =
  | "name"
  | "sku"
  | "barcode"
  | "category"
  | "price"
  | "costPrice"
  | "stock"
  | "reorderLevel"
  | "description"

// Define the product data structure
interface ProductData {
  [key: string]: string
}

// Define the field mapping structure
interface FieldMapping {
  csvField: string
  productField: ProductField | ""
}

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    successful: number
    failed: number
    errors: string[]
  }>({ successful: 0, failed: 0, errors: [] })
  const [showResults, setShowResults] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Product fields with descriptions
  const productFields: { field: ProductField; label: string; description: string; required: boolean }[] = [
    { field: "name", label: "Product Name", description: "The name of the product", required: true },
    { field: "sku", label: "SKU", description: "Stock Keeping Unit - unique identifier", required: true },
    { field: "barcode", label: "Barcode", description: "Product barcode (EAN, UPC, etc.)", required: false },
    { field: "category", label: "Category", description: "Product category", required: true },
    { field: "price", label: "Selling Price", description: "Retail price of the product", required: true },
    { field: "costPrice", label: "Cost Price", description: "Cost price of the product", required: true },
    { field: "stock", label: "Initial Stock", description: "Initial inventory quantity", required: true },
    { field: "reorderLevel", label: "Reorder Level", description: "Stock level to trigger reorder", required: false },
    { field: "description", label: "Description", description: "Product description", required: false },
  ]

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check if it's a CSV file
    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a CSV file",
      })
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  // Parse CSV file
  const parseCSV = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string
      const lines = content.split(/\r\n|\n/)

      // Parse CSV content
      const parsedData = lines.map((line) => {
        // Handle quoted values with commas inside
        const result = []
        let inQuotes = false
        let currentValue = ""

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            result.push(currentValue)
            currentValue = ""
          } else {
            currentValue += char
          }
        }

        // Add the last value
        result.push(currentValue)

        // Clean up quotes
        return result.map((val) => val.replace(/^"|"$/g, "").trim())
      })

      // Filter out empty lines
      const filteredData = parsedData.filter((line) => line.some((cell) => cell.trim() !== ""))

      if (filteredData.length < 2) {
        toast({
          variant: "destructive",
          title: "Invalid CSV file",
          description: "The CSV file must contain headers and at least one data row",
        })
        setFile(null)
        return
      }

      // Extract headers and data
      const csvHeaders = filteredData[0]
      setCsvData(filteredData.slice(1))
      setHeaders(csvHeaders)

      // Create initial field mappings
      const initialMappings = csvHeaders.map((header) => {
        // Try to auto-map fields based on header names
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "")

        // Find matching product field
        const matchedField = productFields.find((field) => {
          const normalizedField = field.field.toLowerCase()
          return (
            normalizedHeader === normalizedField ||
            normalizedHeader === field.label.toLowerCase().replace(/[^a-z0-9]/g, "") ||
            normalizedHeader.includes(normalizedField)
          )
        })

        return {
          csvField: header,
          productField: matchedField ? matchedField.field : "",
        }
      })

      setFieldMappings(initialMappings)
    }

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Error reading file",
        description: "There was an error reading the CSV file",
      })
    }

    reader.readAsText(file)
  }

  // Update field mapping
  const updateFieldMapping = (index: number, productField: ProductField | "") => {
    const newMappings = [...fieldMappings]
    newMappings[index].productField = productField
    setFieldMappings(newMappings)
  }

  // Check if all required fields are mapped
  const areRequiredFieldsMapped = () => {
    const mappedFields = fieldMappings
      .filter((mapping) => mapping.productField !== "")
      .map((mapping) => mapping.productField)

    return productFields
      .filter((field) => field.required)
      .every((requiredField) => mappedFields.includes(requiredField.field))
  }

  // Start the import process
  const startImport = async () => {
    if (!areRequiredFieldsMapped()) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please map all required fields before importing",
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    try {
      // Process each row
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i]
        const productData: ProductData = {}

        // Map CSV data to product fields
        fieldMappings.forEach((mapping, index) => {
          if (mapping.productField) {
            productData[mapping.productField] = row[index] || ""
          }
        })

        try {
          // Validate the product data
          const validationErrors = validateProductData(productData)

          if (validationErrors.length > 0) {
            results.failed++
            results.errors.push(`Row ${i + 2}: ${validationErrors.join(", ")}`)
          } else {
            // In a real app, you would call your API to create the product
            // This is a mock implementation that simulates an API call
            await new Promise((resolve) => setTimeout(resolve, 100))
            results.successful++
          }
        } catch (error) {
          results.failed++
          results.errors.push(`Row ${i + 2}: Unknown error occurred`)
        }

        // Update progress
        setImportProgress(Math.round(((i + 1) / csvData.length) * 100))
      }

      // Show results
      setImportResults(results)
      setShowResults(true)

      toast({
        title: "Import completed",
        description: `Successfully imported ${results.successful} products with ${results.failed} failures`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "There was an error during the import process",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Validate product data
  const validateProductData = (data: ProductData): string[] => {
    const errors: string[] = []

    // Check required fields
    productFields.forEach((field) => {
      if (field.required && (!data[field.field] || data[field.field].trim() === "")) {
        errors.push(`${field.label} is required`)
      }
    })

    // Validate numeric fields
    if (data.price && isNaN(Number(data.price))) {
      errors.push("Price must be a number")
    } else if (data.price && Number(data.price) <= 0) {
      errors.push("Price must be greater than zero")
    }

    if (data.costPrice && isNaN(Number(data.costPrice))) {
      errors.push("Cost Price must be a number")
    } else if (data.costPrice && Number(data.costPrice) < 0) {
      errors.push("Cost Price cannot be negative")
    }

    if (data.stock && isNaN(Number(data.stock))) {
      errors.push("Stock must be a number")
    } else if (data.stock && Number(data.stock) < 0) {
      errors.push("Stock cannot be negative")
    }

    if (data.reorderLevel && isNaN(Number(data.reorderLevel))) {
      errors.push("Reorder Level must be a number")
    } else if (data.reorderLevel && Number(data.reorderLevel) < 0) {
      errors.push("Reorder Level cannot be negative")
    }

    // Validate barcode format
    if (data.barcode && !/^[0-9]+$/.test(data.barcode)) {
      errors.push("Barcode must contain only numbers")
    }

    return errors
  }

  // Reset the import process
  const resetImport = () => {
    setFile(null)
    setCsvData([])
    setHeaders([])
    setFieldMappings([])
    setImportProgress(0)
    setImportResults({ successful: 0, failed: 0, errors: [] })
    setShowResults(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const requiredFields = productFields.filter((field) => field.required).map((field) => field.field)
    const optionalFields = productFields.filter((field) => !field.required).map((field) => field.field)

    // Create CSV content
    const headers = [...requiredFields, ...optionalFields].join(",")
    const sampleRow = [
      "Sample Product", // name
      "PROD-001", // sku
      "5901234123457", // barcode
      "electronics", // category
      "99.99", // price
      "50.00", // costPrice
      "100", // stock
      "10", // reorderLevel
      "This is a sample product description", // description
    ].join(",")

    const csvContent = `${headers}\n${sampleRow}`

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "product_import_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Import Products</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShowHelpDialog(true)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help with CSV import</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>Import multiple products at once using a CSV file</CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Upload a CSV file containing your product data</p>
                <Button variant="outline" onClick={downloadSampleCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">Click to select a CSV file</p>
                  <p className="text-sm text-muted-foreground">or drag and drop</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{file.name}</span>
                  <Badge variant="outline">{csvData.length} products</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={resetImport}>
                  <X className="h-4 w-4 mr-2" />
                  Change File
                </Button>
              </div>

              {!showResults ? (
                <Tabs defaultValue="mapping" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
                    <TabsTrigger value="preview">Data Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="mapping" className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Map your CSV columns to product fields</AlertTitle>
                      <AlertDescription>
                        Required fields are marked with an asterisk (*). All required fields must be mapped.
                      </AlertDescription>
                    </Alert>

                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>CSV Column</TableHead>
                            <TableHead>Product Field</TableHead>
                            <TableHead>Sample Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fieldMappings.map((mapping, index) => (
                            <TableRow key={index}>
                              <TableCell>{mapping.csvField}</TableCell>
                              <TableCell>
                                <Select
                                  value={mapping.productField}
                                  onValueChange={(value) => updateFieldMapping(index, value as ProductField | "")}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">-- Do not import --</SelectItem>
                                    {productFields.map((field) => (
                                      <SelectItem key={field.field} value={field.field}>
                                        {field.label} {field.required && "*"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {csvData[0] && csvData[0][index] ? csvData[0][index] : ""}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        {!areRequiredFieldsMapped() && (
                          <p className="text-sm text-destructive">Please map all required fields before importing</p>
                        )}
                      </div>
                      <Button onClick={startImport} disabled={isImporting || !areRequiredFieldsMapped()}>
                        {isImporting ? (
                          <>Importing...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Import {csvData.length} Products
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {headers.map((header, index) => (
                              <TableHead key={index}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvData.slice(0, 5).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {csvData.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing first 5 of {csvData.length} rows
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Import Results</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{importResults.successful} successful</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-destructive" />
                        <span>{importResults.failed} failed</span>
                      </div>
                    </div>
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="border rounded-md p-4 bg-destructive/5 space-y-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {importResults.errors.slice(0, 10).map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                        {importResults.errors.length > 10 && (
                          <li className="text-sm">...and {importResults.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetImport}>
                      Import Another File
                    </Button>
                    <Button onClick={() => router.push("/dashboard/products")}>Go to Products</Button>
                  </div>
                </div>
              )}

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing products...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CSV Import Help</DialogTitle>
            <DialogDescription>Learn how to prepare your CSV file for importing products</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">CSV Format Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>The first row should contain column headers</li>
                <li>Use comma (,) as the delimiter</li>
                <li>Enclose text with commas in double quotes ("example, text")</li>
                <li>Make sure all required fields are included</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Required Fields</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productFields
                      .filter((field) => field.required)
                      .map((field) => (
                        <TableRow key={field.field}>
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell>{field.description}</TableCell>
                          <TableCell>
                            {field.field === "name" && "Wireless Earbuds"}
                            {field.field === "sku" && "PROD-001"}
                            {field.field === "category" && "electronics"}
                            {field.field === "price" && "99.99"}
                            {field.field === "costPrice" && "50.00"}
                            {field.field === "stock" && "100"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Optional Fields</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productFields
                      .filter((field) => !field.required)
                      .map((field) => (
                        <TableRow key={field.field}>
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell>{field.description}</TableCell>
                          <TableCell>
                            {field.field === "barcode" && "5901234123457"}
                            {field.field === "reorderLevel" && "10"}
                            {field.field === "description" && "High-quality wireless earbuds..."}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Download the template CSV to get started quickly</li>
                <li>The system will try to automatically map columns with matching names</li>
                <li>You can import up to 1000 products at once</li>
                <li>Make sure your SKUs are unique to avoid duplicates</li>
                <li>
                  For categories, use one of the predefined categories: electronics, clothing, food, health, home, other
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
