import { getLaunches } from "@/actions/actions";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { LaunchListCard } from "@/components/LaunchListCard";
import { InfiniteLaunchScroll } from "@/components/InfiniteLaunchScroll";

export default async function LaunchesPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) {
    // Parse Search Params
    const search = (await searchParams).search;
    const status = (await searchParams).status === "all" ? undefined : (await searchParams).status as "success" | "failed" | "upcoming";
    const nextToken = (await searchParams).next_token;

    // Fetch Data (awaiting Search Params natively supported in Next.js 14+)
    const launchesResponse = await getLaunches(20, nextToken, status, undefined, search);
    const launches = launchesResponse.docs;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-16 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2 text-center">
                Mission <span className="font-semibold text-blue-500">Archive</span>
            </h1>
            <p className="text-gray-400 mb-12 text-center max-w-2xl">
                Explore the rich history of SpaceX launches, chronicling every ascent into the cosmos.
            </p>

            {/* Query Filters */}
            <SearchFilterBar />

            {/* Launch List */}
            <div className="w-full flex flex-col gap-4">
                {launches.length > 0 ? (
                    <>
                        {launches.map((launch) => (
                            <LaunchListCard key={launch.id} launch={launch} />
                        ))}

                        {/* Infinite Scroll trigger handling subsequent pages */}
                        <InfiniteLaunchScroll
                            key={`${search || ''}-${status || ''}`}
                            initialNextToken={launchesResponse.next_token}
                            search={search}
                            status={status}
                        />
                    </>
                ) : (
                    <div className="w-full py-20 text-center flex flex-col items-center border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <p className="text-gray-400 text-lg">No launches found matching your query.</p>
                        <button className="mt-4 text-blue-400 hover:text-blue-300 transition-colors" tabIndex={-1}>
                            Try adjusting your search filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
