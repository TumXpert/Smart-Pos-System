"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, FileDown, FileUp, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // In a real app, fetch this data from your API
    const dummyProducts: Product[] = [
      { id: "1", name: "Smartphone X", sku: "PHN-001", price: 499.99, stock: 15, category: "Electronics" },
      { id: "2", name: "Laptop Pro", sku: "LPT-002", price: 899.99, stock: 8, category: "Electronics" },
      { id: "3", name: "Wireless Earbuds", sku: "AUD-003", price: 79.99, stock: 25, category: "Audio" },
      { id: "4", name: "Smart Watch", sku: "WCH-004", price: 199.99, stock: 12, category: "Wearables" },
      { id: "5", name: "Bluetooth Speaker", sku: "SPK-005", price: 59.99, stock: 20, category: "Audio" },
      { id: "6", name: "USB-C Cable", sku: "CBL-006", price: 12.99, stock: 50, category: "Accessories" },
      { id: "7", name: "Power Bank", sku: "PWR-007", price: 39.99, stock: 18, category: "Accessories" },
      { id: "8", name: "Wireless Mouse", sku: "MUS-008", price: 24.99, stock: 30, category: "Peripherals" },
    ]
    setProducts(dummyProducts)
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    // In a real app, call your API to delete the product
    setProducts(products.filter((product) => product.id !== id))
    toast({
      title: "Product deleted",
      description: "The product has been removed from your inventory.",
    })
  }

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your product data is being exported to CSV.",
    })
    // In a real app, implement CSV export functionality
  }

  const handleImport = () => {
    // Navigate to the import page
    window.location.href = "/dashboard/products/import"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your inventory and product catalog</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">More Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImport}>
                <FileUp className="h-4 w-4 mr-2" />
                Import CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>You have {products.length} products in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <StockBadge stock={product.stock} />
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/dashboard/products/${product.id}`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 5) {
    return <Badge variant="destructive">{stock} left</Badge>
  } else if (stock <= 10) {
    return <Badge variant="warning">{stock} left</Badge>
  } else {
    return <Badge variant="outline">{stock} in stock</Badge>
  }
}
