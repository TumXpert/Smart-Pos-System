"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote, Receipt } from "lucide-react"

type Product = {
  id: string
  name: string
  price: number
  category: string
}

type CartItem = {
  id: string
  product: Product
  quantity: number
  total: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [amountReceived, setAmountReceived] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // In a real app, fetch this data from your API
    const dummyProducts: Product[] = [
      { id: "1", name: "Smartphone X", price: 499.99, category: "Electronics" },
      { id: "2", name: "Laptop Pro", price: 899.99, category: "Electronics" },
      { id: "3", name: "Wireless Earbuds", price: 79.99, category: "Audio" },
      { id: "4", name: "Smart Watch", price: 199.99, category: "Wearables" },
      { id: "5", name: "Bluetooth Speaker", price: 59.99, category: "Audio" },
      { id: "6", name: "USB-C Cable", price: 12.99, category: "Accessories" },
      { id: "7", name: "Power Bank", price: 39.99, category: "Accessories" },
      { id: "8", name: "Wireless Mouse", price: 24.99, category: "Peripherals" },
      { id: "9", name: "Keyboard", price: 49.99, category: "Peripherals" },
      { id: "10", name: "Monitor", price: 299.99, category: "Electronics" },
      { id: "11", name: "Headphones", price: 89.99, category: "Audio" },
      { id: "12", name: "Phone Case", price: 19.99, category: "Accessories" },
    ]
    setProducts(dummyProducts)
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.product.price }
            : item,
        )
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            product,
            quantity: 1,
            total: product.price,
          },
        ]
      }
    })
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity, total: newQuantity * item.product.price } : item,
      ),
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty cart",
        description: "Please add products to the cart before checkout.",
      })
      return
    }

    setIsPaymentDialogOpen(true)
  }

  const handlePayment = () => {
    // In a real app, process the payment based on the selected method
    setIsPaymentDialogOpen(false)

    toast({
      title: "Payment successful",
      description: `Payment of $${calculateTotal().toFixed(2)} processed successfully.`,
    })

    setIsReceiptDialogOpen(true)
  }

  const handlePrintReceipt = () => {
    // In a real app, implement receipt printing or PDF generation
    toast({
      title: "Receipt generated",
      description: "The receipt has been generated successfully.",
    })

    setIsReceiptDialogOpen(false)
    clearCart()
    setPaymentMethod("")
    setAmountReceived("")
    setCustomerPhone("")
  }

  const categories = Array.from(new Set(products.map((product) => product.category)))

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden">
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="mb-4">
            <div className="relative">
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

          <Card className="flex-1 overflow-hidden">
            <CardHeader className="p-4">
              <Tabs defaultValue="all">
                <TabsList className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto h-[calc(100%-5rem)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 text-center"
                    onClick={() => addToCart(product)}
                  >
                    <div className="font-medium truncate w-full">{product.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">${product.price.toFixed(2)}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col h-full">
          <CardHeader className="p-4">
            <CardTitle>Current Sale</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-2" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add products to begin a sale</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t p-4 flex flex-col gap-4">
            <div className="w-full flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={cart.length === 0}>
              Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>Select a payment method to complete the transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="flex flex-col h-24 gap-2"
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="h-6 w-6" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                className="flex flex-col h-24 gap-2"
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard className="h-6 w-6" />
                Card
              </Button>
              <Button
                variant={paymentMethod === "mpesa" ? "default" : "outline"}
                className="flex flex-col h-24 gap-2"
                onClick={() => setPaymentMethod("mpesa")}
              >
                <Smartphone className="h-6 w-6" />
                M-Pesa
              </Button>
              <Button
                variant={paymentMethod === "airtel" ? "default" : "outline"}
                className="flex flex-col h-24 gap-2"
                onClick={() => setPaymentMethod("airtel")}
              >
                <Smartphone className="h-6 w-6" />
                Airtel Money
              </Button>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="amount-received">Amount Received</Label>
                <Input
                  id="amount-received"
                  type="number"
                  min={calculateTotal()}
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                />
                {Number.parseFloat(amountReceived) > calculateTotal() && (
                  <div className="text-sm">
                    Change: ${(Number.parseFloat(amountReceived) - calculateTotal()).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {(paymentMethod === "mpesa" || paymentMethod === "airtel") && (
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Customer Phone Number</Label>
                <Input
                  id="customer-phone"
                  placeholder="e.g. 254712345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customer-phone-receipt">Customer Phone for Receipt (Optional)</Label>
              <Input
                id="customer-phone-receipt"
                placeholder="e.g. 254712345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={!paymentMethod}>
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>Transaction completed successfully.</DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-lg">Smart POS+ Receipt</h3>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} x {item.product.name}
                  </span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="text-sm">
              <p>Payment Method: {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
              {customerPhone && <p>Customer: {customerPhone}</p>}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Thank you for your business!</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePrintReceipt} className="w-full">
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ShoppingCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
