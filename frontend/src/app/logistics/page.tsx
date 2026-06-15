"use client";

import { useState, useEffect } from "react";
import { fetchLogisticsMetrics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Map, AlertCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Logistics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchLogisticsMetrics().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-neutral-500 animate-pulse">Loading Logistics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logistics Analytics</h1>
        <p className="text-neutral-400 mt-1">Track shipping performance, delays, and transportation costs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Delayed Shipments</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.delayed_percent.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Avg Delivery Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avg_delivery_time.toFixed(1)} Days</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transportation Modes Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.transportation_modes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="Transportation modes" stroke="#888" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#888" tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#888" tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                contentStyle={{backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px'}} 
              />
              <Bar yAxisId="left" dataKey="total_shipping_costs" name="Shipping Costs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avg_shipping_times" name="Avg Shipping Time" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
