"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Rocket, Target, Activity } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
    const isTest = process.env.NODE_ENV === "test";
    const count = useMotionValue(isTest ? value : 0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const formatted = useTransform(rounded, (latest) => latest.toLocaleString());

    useEffect(() => {
        if (isTest) return;
        const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
        return animation.stop;
    }, [value, count, isTest]);

    return <motion.span>{formatted}</motion.span>;
}

interface CombinedStatsCardProps {
    delay?: number;
    totalLaunches: number;
    totalPayload: number;
    humansFlown: number;
}

export function CombinedStatsCard({ totalLaunches, totalPayload, humansFlown, delay = 0 }: CombinedStatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="@container relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm group hover:border-white/20 transition-colors"
        >
            <div className="flex flex-col @md:flex-col gap-6 justify-between w-full h-full">
                {/* Total Launches */}
                <div className="flex flex-col gap-2 relative flex-1">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Rocket className="w-12 h-12 text-blue-500/20" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Total Launches
                    </h3>
                    <p className="text-4xl md:text-5xl font-bold tracking-tight text-white relative z-10">
                        <AnimatedNumber value={totalLaunches} />
                    </p>
                </div>

                {/* Divider */}
                <div className="hidden @md:block w-px h-auto bg-white/10" />
                <div className="block @md:hidden w-full h-px bg-white/10" />

                {/* Total Payload */}
                <div className="flex flex-col gap-2 relative flex-1">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="w-12 h-12 text-emerald-500/20" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Total Payload
                    </h3>
                    <p className="text-4xl md:text-5xl font-bold tracking-tight text-white relative z-10">
                        <AnimatedNumber value={totalPayload} />
                    </p>
                    <p className="text-xs text-emerald-400 font-medium z-10 relative">Mass (kg)</p>
                </div>

                {/* Divider */}
                <div className="hidden @md:block w-px h-auto bg-white/10" />
                <div className="block @md:hidden w-full h-px bg-white/10" />

                {/* Humans Flown */}
                <div className="flex flex-col gap-2 relative flex-1">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-12 h-12 text-purple-500/20" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Humans Flown
                    </h3>
                    <p className="text-4xl md:text-5xl font-bold tracking-tight text-white relative z-10">
                        <AnimatedNumber value={humansFlown} />
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
