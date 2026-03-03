"use server";

import { PaginatedLaunchesSchema, LaunchSchema, RocketListResponseSchema, StatsSchema, Stats, PaginatedLaunches, Rocket, Launch } from "@/domain/models";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

export async function getStats(): Promise<Stats> {
    const res = await fetch(`${API_BASE_URL}/stats`, {
        next: { revalidate: 60 * 60 }, // Revalidate every hour
    });

    if (!res.ok) {
        throw new Error("Failed to fetch statistics");
    }

    const data = await res.json();
    return StatsSchema.parse(data);
}

export async function getLaunches(
    limit: number = 50,
    nextToken?: string | null,
    status?: "success" | "failed" | "upcoming",
    rocketId?: string,
    search?: string
): Promise<PaginatedLaunches> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    if (nextToken) params.append("next_token", nextToken);
    if (status) params.append("status", status);
    if (rocketId) params.append("rocket", rocketId);
    if (search) params.append("search", search);



    const res = await fetch(`${API_BASE_URL}/launches?${params.toString()}`, {
        next: { revalidate: 60 * 5 }, // Every 5 minutes
    });

    if (!res.ok) {
        throw new Error("Failed to fetch launches");
    }

    const data = await res.json();
    return PaginatedLaunchesSchema.parse(data);
}

export async function getRockets(): Promise<{ items: Rocket[], count: number }> {
    const res = await fetch(`${API_BASE_URL}/rockets`, {
        next: { revalidate: 60 * 60 * 24 }, // Daily
    });

    if (!res.ok) {
        throw new Error("Failed to fetch rockets");
    }

    const data = await res.json();
    return RocketListResponseSchema.parse(data);
}

export async function getLaunchById(id: string): Promise<Launch> {
    const res = await fetch(`${API_BASE_URL}/launches/${id}`, {
        next: { revalidate: 60 * 5 }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch launch ${id}`);
    }

    const data = await res.json();
    return LaunchSchema.parse(data);
}
