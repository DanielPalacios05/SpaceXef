"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getLaunches } from "@/actions/actions";
import { LaunchListCard } from "@/components/LaunchListCard";
import { Launch } from "@/domain/models";

interface InfiniteLaunchScrollProps {
    initialNextToken?: string | null;
    search?: string;
    status?: "success" | "failed" | "upcoming";
}

export function InfiniteLaunchScroll({ initialNextToken, search, status }: InfiniteLaunchScrollProps) {
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [nextToken, setNextToken] = useState<string | null | undefined>(initialNextToken);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Load more data when targeted intersection arrives
    const loadMore = useCallback(async () => {
        if (!nextToken || loading) return;

        setLoading(true);
        try {
            const response = await getLaunches(20, nextToken, status, search);
            setLaunches(prev => [...prev, ...response.docs]);
            setNextToken(response.next_token);
        } catch (error) {
            console.error("Failed to fetch more launches", error);
        } finally {
            setLoading(false);
        }
    }, [nextToken, loading, status, search]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <>
            {launches.map((launch) => (
                <LaunchListCard key={`${launch.id}-${launch.flight_number}`} launch={launch} />
            ))}

            {nextToken && (
                <div ref={observerTarget} className="w-full py-12 flex justify-center items-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-500 text-sm animate-pulse tracking-wider uppercase">Loading Core Stages...</span>
                        </div>
                    ) : (
                        <div className="h-8 w-8" />
                    )}
                </div>
            )}

            {!nextToken && launches.length > 0 && (
                <div className="w-full py-12 text-center text-gray-500 tracking-wider text-sm uppercase">
                    You have reached the end of the archive.
                </div>
            )}
        </>
    );
}
