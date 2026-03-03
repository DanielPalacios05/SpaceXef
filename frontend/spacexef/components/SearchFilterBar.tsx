"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useRef } from "react";

export function SearchFilterBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load initial states from URL query parameters
    const defaultSearch = searchParams.get("search") || "";
    const defaultStatus = searchParams.get("status") || "all";

    const handleSearchChange = (term: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (term) {
                params.set("search", term);
            } else {
                params.delete("search");
            }
            params.delete("next_token");
            router.push(`${pathname}?${params.toString()}`);
        }, 300);
    };

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status && status !== "all") {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        params.delete("next_token");
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
            {/* Search Bar */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-colors sm:text-sm backdrop-blur-sm"
                    placeholder="Search missions (Case sensitive)..."
                    defaultValue={defaultSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48 shrink-0">
                <select
                    value={defaultStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 text-base border-white/10 bg-white/5 text-gray-300 focus:outline-none focus:ring-white/20 focus:border-white/20 sm:text-sm rounded-xl border backdrop-blur-sm appearance-none"
                >
                    <option value="all" className="bg-gray-900 text-white">All</option>
                    <option value="success" className="bg-gray-900 text-white">Success</option>
                    <option value="failed" className="bg-gray-900 text-white">Failed</option>
                    <option value="upcoming" className="bg-gray-900 text-white">Upcoming</option>
                </select>
            </div>
        </div>
    );
}
