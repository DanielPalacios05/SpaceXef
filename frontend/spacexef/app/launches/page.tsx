"use client";

import { useEffect, useState } from "react";
import { Chrono } from "react-chrono";
import { getLaunches } from "@/actions/actions";
import { Launch } from "@/domain/models";

export default function LaunchesPage() {
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLaunches() {
            try {
                const data = await getLaunches(100);
                setLaunches(data.docs);
            } catch (error) {
                console.error("Failed to load launches:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLaunches();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 tracking-widest uppercase text-sm">Loading Timeline...</p>
                </div>
            </div>
        );
    }

    // Format launches for react-chrono
    const items = launches.map(launch => {
        const launchDate = launch.launch_date ? new Date(launch.launch_date * 1000) : new Date();
        return {
            title: launchDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }),
            cardTitle: launch.name || "Unknown Mission",
            cardDetailedText: launch.details || "No detailed description available.",
            media: {
                type: "IMAGE" as const,
                source: {
                    url: launch.patch || "/logo.png"
                }
            }
        };
    });

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-16 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2 text-center">
                Mission <span className="font-semibold text-blue-500">Timeline</span>
            </h1>
            <p className="text-gray-400 mb-12 text-center max-w-2xl">
                Explore the rich history of SpaceX launches, chronicling every ascent into the cosmos.
            </p>

            {items.length > 0 ? (
                <div className="w-full h-[800px] border border-white/10 p-4 md:p-8 rounded-2xl bg-white/5 backdrop-blur-sm">
                    <Chrono
                        items={items}
                        mode="VERTICAL_ALTERNATING"
                        theme={{
                            primary: '#3b82f6',
                            secondary: 'transparent',
                            cardBgColor: 'rgba(255, 255, 255, 0.05)',
                            titleColor: '#9ca3af',
                            titleColorActive: '#ffffff',
                        }}
                        cardWidth={400}
                        cardHeight={200}
                        disableTimelinePoint
                        fontSizes={{
                            cardSubtitle: '0.85rem',
                            cardText: '0.8rem',
                            cardTitle: '1.2rem',
                            title: '1rem',
                        }}
                    />
                </div>
            ) : (
                <div className="text-gray-500 text-center mt-10">No launches found.</div>
            )}
        </div>
    );
}
