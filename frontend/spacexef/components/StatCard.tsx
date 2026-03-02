"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ReactNode, useEffect } from "react";

function AnimatedNumber({ value }: { value: number }) {
    const isTest = process.env.NODE_ENV === "test";
    const count = useMotionValue(isTest ? value : 0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (isTest) return;
        const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
        return animation.stop;
    }, [value, count, isTest]);

    return <motion.span>{rounded}</motion.span>;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    subtitle?: string;
    delay?: number;
}

export function StatCard({ title, value, icon, subtitle, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm group hover:border-white/20 transition-colors"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {title}
                </h3>
                <p className="text-4xl md:text-5xl font-light tracking-tight text-white">
                    {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
                </p>

                {subtitle && (
                    <p className="text-xs text-blue-400 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
