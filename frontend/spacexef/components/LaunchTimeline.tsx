"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getLaunches } from "@/actions/actions";
import { LaunchListCard } from "@/components/LaunchListCard";
import { Launch } from "@/domain/models";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LaunchTimelineProps {
    initialLaunches: Launch[];
    initialNextToken?: string | null;
}

export function LaunchTimeline({ initialLaunches, initialNextToken }: LaunchTimelineProps) {
    const [launches, setLaunches] = useState<Launch[]>(initialLaunches);
    const [nextToken, setNextToken] = useState<string | null | undefined>(initialNextToken);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (!nextToken || loading) return;

        setLoading(true);
        try {
            const response = await getLaunches(10, nextToken);
            setLaunches(prev => [...prev, ...response.docs]);
            setNextToken(response.next_token);
        } catch (error) {
            console.error("Failed to load more timeline launches", error);
        } finally {
            setLoading(false);
        }
    }, [nextToken, loading]);

    // Horizontal IntersectionObserver on the sentinel
    useEffect(() => {
        const sentinel = sentinelRef.current;
        const scrollContainer = scrollRef.current;
        if (!sentinel || !scrollContainer) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            {
                root: scrollContainer,
                threshold: 0.1,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore]);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const scrollAmount = 380;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    if (!launches || launches.length === 0) return null;

    return (
        <div className="relative">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        Launch Timeline
                    </h2>
                </div>

                {/* Nav Arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollRef}
                className="overflow-x-auto pb-4 scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
            >
                {/* Timeline wrapper — fixed height to accommodate up/down stacked cards + center line */}
                <div className="relative" style={{ height: "520px", minWidth: `${launches.length * 340 + 160}px` }}>

                    {/* Horizontal center line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-[2px] bg-gradient-to-r from-blue-500/60 via-blue-500/30 to-transparent" />

                    {/* Timeline nodes */}
                    {launches.map((launch, index) => {
                        const isUp = index % 2 === 0;

                        return (
                            <div
                                key={`${launch.id}-${launch.flight_number}`}
                                className="absolute"
                                style={{
                                    left: `${index * 340}px`,
                                    width: "320px",
                                    ...(isUp
                                        ? { bottom: "calc(50% + 36px)" }
                                        : { top: "calc(50% + 36px)" }),
                                }}
                            >
                                <LaunchListCard launch={launch} />
                            </div>
                        );
                    })}

                    {/* Connectors: vertical lines + dots + date labels */}
                    {launches.map((launch, index) => {
                        const isUp = index % 2 === 0;
                        const centerX = index * 340 + 160; // midpoint of each card
                        const launchDate = launch.launch_date ? new Date(launch.launch_date * 1000) : null;
                        const shortDate = launchDate
                            ? launchDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                            : "";

                        return (
                            <div key={`connector-${launch.id}`}>
                                {/* Date label on the center line */}
                                {shortDate && (
                                    <div
                                        className="absolute z-20 flex items-center justify-center pointer-events-none"
                                        style={{
                                            left: `${centerX}px`,
                                            transform: "translateX(-50%)",
                                            ...(isUp
                                                ? { top: "calc(50% + 12px)" }
                                                : { bottom: "calc(50% + 12px)" }),
                                        }}
                                    >
                                        <span className="text-lg font-bold text-blue-300 tracking-wide whitespace-nowrap bg-black/80 px-2.5 py-1 rounded-md border border-blue-500/20">
                                            {shortDate}
                                        </span>
                                    </div>
                                )}

                                {/* Dot on the center line */}
                                <div
                                    className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-black shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10"
                                    style={{
                                        left: `${centerX - 6}px`,
                                        top: "calc(50% - 6px)",
                                    }}
                                />

                                {/* Vertical connector line */}
                                <div
                                    className="absolute w-[2px] bg-blue-500/40"
                                    style={{
                                        left: `${centerX - 1}px`,
                                        height: "32px",
                                        ...(isUp
                                            ? { bottom: "50%", top: "auto" }
                                            : { top: "50%" }),
                                    }}
                                />
                            </div>
                        );
                    })}

                    {/* Sentinel for infinite loading */}
                    {nextToken && (
                        <div
                            ref={sentinelRef}
                            className="absolute flex items-center justify-center"
                            style={{
                                left: `${launches.length * 340}px`,
                                top: "calc(50% - 24px)",
                                width: "120px",
                                height: "48px",
                            }}
                        >
                            {loading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Loading</span>
                                </div>
                            ) : (
                                <div className="w-6 h-6" />
                            )}
                        </div>
                    )}

                    {!nextToken && launches.length > 0 && (
                        <div
                            className="absolute flex items-center justify-center"
                            style={{
                                left: `${launches.length * 340}px`,
                                top: "calc(50% - 24px)",
                                width: "120px",
                                height: "48px",
                            }}
                        >
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest text-center leading-relaxed">
                                End of<br />Archive
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Left/Right Fade Gradients */}
            <div className="pointer-events-none absolute left-0 top-[68px] bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-[68px] bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-20" />
        </div>
    );
}
