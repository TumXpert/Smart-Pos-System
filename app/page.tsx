import type React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, BarChart4, Package, ShoppingCart, Smartphone, Bell } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Smart POS+</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-6">Smart POS+ System</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A comprehensive Point of Sale system designed specifically for small and medium-sized businesses in
              Africa.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Package className="h-10 w-10" />}
                title="Inventory Management"
                description="Track stock levels, receive low inventory alerts, and manage products with ease."
              />
              <FeatureCard
                icon={<ShoppingCart className="h-10 w-10" />}
                title="Sales Processing"
                description="Process sales quickly with an intuitive POS interface that works offline."
              />
              <FeatureCard
                icon={<Smartphone className="h-10 w-10" />}
                title="Mobile Money Integration"
                description="Accept payments via M-Pesa, Airtel Money and other mobile payment platforms."
              />
              <FeatureCard
                icon={<BarChart4 className="h-10 w-10" />}
                title="Reports & Analytics"
                description="Gain insights with comprehensive sales and inventory reports."
              />
              <FeatureCard
                icon={<Bell className="h-10 w-10" />}
                title="SMS & WhatsApp Alerts"
                description="Receive notifications for important events via SMS or WhatsApp."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-10 w-10" />}
                title="Secure Access Control"
                description="Manage user roles and permissions for your team members."
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Start your 14-day free trial today. No credit card required.
            </p>
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="container text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Smart POS+ System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
