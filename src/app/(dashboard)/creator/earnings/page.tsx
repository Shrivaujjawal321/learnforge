"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock earnings data
const monthlyRevenue = [
  { month: "Jul", revenue: 320 },
  { month: "Aug", revenue: 580 },
  { month: "Sep", revenue: 750 },
  { month: "Oct", revenue: 1120 },
  { month: "Nov", revenue: 980 },
  { month: "Dec", revenue: 1450 },
  { month: "Jan", revenue: 1680 },
  { month: "Feb", revenue: 2100 },
];

const courseRevenue = [
  { name: "Web Development", revenue: 4990 },
  { name: "Data Science", revenue: 3196 },
  { name: "UI/UX Design", revenue: 0 },
];

const recentTransactions = [
  {
    id: "txn_1",
    student: "Jamie Smith",
    course: "Complete Web Development Bootcamp",
    amount: 49.99,
    date: "2025-02-15",
    status: "completed",
  },
  {
    id: "txn_2",
    student: "Alex Kim",
    course: "Data Science with Python",
    amount: 39.99,
    date: "2025-02-14",
    status: "completed",
  },
  {
    id: "txn_3",
    student: "Morgan Lee",
    course: "Complete Web Development Bootcamp",
    amount: 49.99,
    date: "2025-02-13",
    status: "completed",
  },
  {
    id: "txn_4",
    student: "Taylor Chen",
    course: "Data Science with Python",
    amount: 39.99,
    date: "2025-02-12",
    status: "completed",
  },
  {
    id: "txn_5",
    student: "Jordan Park",
    course: "Complete Web Development Bootcamp",
    amount: 49.99,
    date: "2025-02-11",
    status: "completed",
  },
];

export default function EarningsPage() {
  const stats = [
    {
      title: "Total Earnings",
      value: "$8,186.00",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "This Month",
      value: "$2,100.00",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Payout",
      value: "$890.00",
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Available Balance",
      value: "$7,296.00",
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">
          Track your revenue and payouts (mock data)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(262, 83%, 58%)"
                  fill="hsl(262, 83%, 58%)"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course</CardTitle>
            <CardDescription>Total earnings per course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  fontSize={12}
                  width={120}
                />
                <Tooltip />
                <Bar
                  dataKey="revenue"
                  fill="hsl(262, 83%, 58%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest sales</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">{txn.student}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {txn.course}
                  </TableCell>
                  <TableCell>${txn.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {txn.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="capitalize">
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
