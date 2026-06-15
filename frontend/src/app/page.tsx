"use client";

import { useEffect, useState } from "react";
import { fetchKPIs, fetchRevenueTrend } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export default function Home() {
  const [kpis, setKpis] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);

  useEffect(() => {
    fetchKPIs().then(setKpis).catch(console.error);
    fetchRevenueTrend().then(setTrend).catch(console.error);
  }, []);

  if (!kpis || !trend) return <div className="animate-pulse flex space-x-4">Loading KPIs...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-neutral-400 mt-1">High-level supply chain performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value={`$${kpis.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={DollarSign} />
        <MetricCard title="Total Profit" value={`$${kpis.total_profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={TrendingUp} />
        <MetricCard title="Profit Margin" value={`${kpis.profit_margin.toFixed(2)}%`} icon={Activity} />
        <MetricCard title="Delivery Success" value={`${kpis.delivery_success_rate.toFixed(1)}%`} icon={ShoppingCart} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="Location" stroke="#888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px'}} 
                />
                <Bar dataKey="Revenue generated" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total Profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
          <Icon className="w-4 h-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
