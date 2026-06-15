"use client";

import { useState, useEffect } from "react";
import { fetchSupplierMetrics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertTriangle, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function SupplierAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchSupplierMetrics().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-neutral-500 animate-pulse">Loading Supplier Analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supplier Analytics</h1>
        <p className="text-neutral-400 mt-1">Evaluate and rank supplier performance and risk.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-green-400">Best Supplier</CardTitle>
              <Trophy className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.best_supplier['Supplier name']}</div>
              <p className="text-xs text-neutral-400 mt-1">Score: {data.best_supplier.performance_score}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-red-400">Worst Supplier (At Risk)</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.worst_supplier['Supplier name']}</div>
              <p className="text-xs text-neutral-400 mt-1">Score: {data.worst_supplier.performance_score}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-900 border-b border-neutral-800 text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Revenue Gen.</th>
                  <th className="px-4 py-3">Avg Lead Time</th>
                  <th className="px-4 py-3">Avg Defect Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.suppliers.map((s: any, idx: number) => (
                  <tr key={idx} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{s['Supplier name']}</td>
                    <td className="px-4 py-3 text-indigo-400 font-bold">{s.performance_score}</td>
                    <td className="px-4 py-3">${s.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3">{s.avg_lead_time.toFixed(1)} days</td>
                    <td className="px-4 py-3">{s.avg_defect_rate.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
