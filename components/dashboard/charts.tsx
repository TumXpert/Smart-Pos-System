"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const lineData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
]

const barData = [
  { name: "Smartphone X", sales: 400 },
  { name: "Laptop Pro", sales: 300 },
  { name: "Wireless Earbuds", sales: 200 },
  { name: "Smart Watch", sales: 278 },
  { name: "Bluetooth Speaker", sales: 189 },
]

const pieData = [
  { name: "New", value: 400 },
  { name: "Returning", value: 300 },
  { name: "Referred", value: 200 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function LineChart() {
  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={lineData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function BarChart() {
  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={barData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function PieChart() {
  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Card>
  )
}
