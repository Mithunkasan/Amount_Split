"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

// Hydration guard wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-slate-900/10 border border-slate-700/10 rounded-xl flex items-center justify-center text-xs text-slate-500 font-bold animate-pulse">
        Loading analytics visualization...
      </div>
    );
  }
  return <>{children}</>;
}

// 1. Category Pie Chart
interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#3b82f6", "#6366f1", "#f59e0b", "#ec4899"];

export function CategoryExpenseChart({ data }: { data: CategoryData[] }) {
  const chartData = data.filter(item => item.value > 0);

  return (
    <ClientOnly>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "11px"
              }}
              formatter={(value: any) => [`$${value}`, "Spent"]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}

// 2. Spending Trend Area Chart
interface TrendData {
  date: string;
  amount: number;
}

export function SpendingTrendChart({ data }: { data: TrendData[] }) {
  return (
    <ClientOnly>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "11px"
              }}
              formatter={(value: any) => [`$${value}`, "Amount"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSpend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}

// 3. User Debt Comparison Chart (Spent vs Owed)
interface DebtData {
  name: string;
  spent: number;
  owed: number;
}

export function UserDebtComparisonChart({ data }: { data: DebtData[] }) {
  return (
    <ClientOnly>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "11px"
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }}
            />
            <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="owed" name="Owed Split" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}
