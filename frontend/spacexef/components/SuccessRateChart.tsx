"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface SuccessRateChartProps {
    total: number;
    failures: number;
}

export function SuccessRateChart({ total, failures }: SuccessRateChartProps) {
    const success = total - failures;
    const data = [
        { name: "Success", value: success },
        { name: "Failures", value: failures },
    ];

    const COLORS = ["#46b861", "#ef4444"]; // Emerald for success, Red for failure

    const successRatePercentage = total > 0 ? ((success / total) * 100).toFixed(1) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col items-center justify-center h-full relative"
        >
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider self-start mb-4">
                Success Rate
            </h3>

            <div className="relative w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px" }}
                            itemStyle={{ color: "#fff" }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-light text-white">{successRatePercentage}%</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#46b861]"></span>
                    <span className="text-sm text-gray-400">Success ({success})</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                    <span className="text-sm text-gray-400">Failed ({failures})</span>
                </div>
            </div>
        </motion.div>
    );
}
