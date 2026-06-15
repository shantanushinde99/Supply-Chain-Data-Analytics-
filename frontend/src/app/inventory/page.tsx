"use client";

import { useState, useEffect } from "react";
import { fetchInventoryMetrics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, ArrowRightLeft, TrendingUp } from "lucide-react";

export default function Inventory() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchInventoryMetrics().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-neutral-500 animate-pulse">Loading Inventory...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory & Demand</h1>
        <p className="text-neutral-400 mt-1">Monitor stock levels, fast-moving products, and stock-out risks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">SKUs at Stock-out Risk</CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stock_out_count}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-neutral-400">Inventory Turnover Ratio</CardTitle>
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inventory_turnover.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fast Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.fast_moving.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                  <div>
                    <p className="font-medium text-white">{p.SKU}</p>
                    <p className="text-xs text-neutral-400">{p['Product type']}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{p['Number of products sold']} Sold</p>
                    <p className="text-xs text-neutral-500">{p['Stock levels']} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slow Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.slow_moving.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                  <div>
                    <p className="font-medium text-white">{p.SKU}</p>
                    <p className="text-xs text-neutral-400">{p['Product type']}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-400">{p['Number of products sold']} Sold</p>
                    <p className="text-xs text-neutral-500">{p['Stock levels']} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
