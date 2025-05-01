"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { BarChart, LineChart, PieChart } from "@/components/dashboard/charts"
import { DollarSign, Users, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesGrowth: 0,
  })

  useEffect(() => {
    // In a real app, fetch this data from your API
    setStats({
      totalSales: 12580,
      totalCustomers: 48,
      totalProducts: 156,
      salesGrowth: 12.5,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.businessName || "User"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pos">
            <Button>Open POS</Button>
          </Link>
          <Link href="/dashboard/products/new">
            <Button variant="outline">Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          description="Total sales this month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          description="Total customers"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts.toString()}
          description="In your inventory"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Growth"
          value={`${stats.salesGrowth}%`}
          description="Sales increase from last month"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Your sales performance over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Your best-selling products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Breakdown of your customer base</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Your most recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent sales data available.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No low stock alerts at this time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
