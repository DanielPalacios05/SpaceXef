import { getLaunchById } from "@/actions/actions";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Target, Rocket } from "lucide-react";
import { notFound } from "next/navigation";
import { RocketCard } from "@/components/RocketCard";
import { StatusBadge } from "@/components/StatusBadge";
import { CrewGrid, EmptyCrewCard } from "@/components/CrewGrid";
import { PayloadGrid } from "@/components/PayloadGrid";
import { FailureList } from "@/components/FailureList";

export default async function LaunchDetail({ params }: { params: Promise<{ id: string }> }) {
    let launch;
    try {
        launch = await getLaunchById((await params).id);
    } catch {
        notFound();
    }

    const launchDate = launch.launch_date ? new Date(launch.launch_date * 1000) : null;
    const formattedDate = launchDate
        ? launchDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
        : "";

    const hasPayloads = launch.payloads && launch.payloads.length > 0;
    const hasCrew = launch.crew && launch.crew.length > 0;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-16">

            {/* Back Navigation Header */}
            <div className="mb-8">
                <Link
                    href="/launches"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    Back to Archive
                </Link>
            </div>

            {/* Hero Header Section */}
            <div className="w-full mb-12 flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start justify-between">

                {/* Left: Content */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400 mb-4">
                        {formattedDate && (
                            <span className="flex items-center gap-1.5 font-mono">
                                <CalendarDays className="w-4 h-4 text-blue-500/50" />
                                {formattedDate}
                            </span>
                        )}
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs">Flight #{launch.flight_number}</span>
                        <StatusBadge status={launch.status} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
                        {launch.name}
                    </h1>

                    <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                        {launch.details || "No detailed mission description was provided for this launch."}
                    </p>

                </div>

                {/* Right: Mission Patch Display */}
                <div className="w-64 h-64 md:w-80 md:h-80 shrink-0 relative flex items-center justify-center p-8 bg-black/20 rounded-full border border-white/5 shadow-2xl shadow-black/50 overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-blue-500/20 blur-[80px] rounded-full" />
                    {launch.patch ? (
                        <Image
                            src={launch.patch}
                            alt={`${launch.name} patch`}
                            fill
                            className="object-contain p-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700 ease-out z-10"
                            priority
                        />
                    ) : (
                        <Rocket className="w-32 h-32 text-gray-700 opacity-50 z-10" />
                    )}
                </div>
            </div>

            {/* Sections Divider */}
            <div className="w-full h-px bg-white/10 my-10" />

            {/* Grid Layout for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-start">

                {/* Watch Section - Spans Full Width */}
                {launch.youtube_id && (
                    <section className="col-span-1 md:col-span-2 lg:col-span-4">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                            <Target className="w-5 h-5 text-red-500" />
                            <h2 className="text-2xl font-semibold text-white">Watch Mission</h2>
                        </div>
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                            <iframe
                                src={`https://www.youtube.com/embed/${launch.youtube_id}`}
                                title={`${launch.name} YouTube Video`}
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </section>
                )}

                {/* Rocket Info - 2 Columns */}
                {launch.rocket && (
                    <section className="col-span-1 md:col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                            <Rocket className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-2xl font-semibold text-white">Flight Vehicle</h2>
                        </div>
                        <RocketCard rocket={launch.rocket} />
                    </section>
                )}

                {/* Crew Info - 2 Columns */}
                <section className="col-span-1 md:col-span-2 lg:col-span-2 h-full">
                    {hasCrew ? (
                        <CrewGrid crew={launch.crew!} />
                    ) : (
                        <EmptyCrewCard />
                    )}
                </section>

                {/* Payload Section - 2 Columns */}
                {hasPayloads && (
                    <section className="col-span-1 md:col-span-2 lg:col-span-2">
                        <PayloadGrid payloads={launch.payloads!} />
                    </section>
                )}

                {/* Failures Section - 2 Columns */}
                {launch.failures && launch.failures.length > 0 && (
                    <section className="col-span-1 md:col-span-2 lg:col-span-2">
                        <FailureList failures={launch.failures} />
                    </section>
                )}

            </div>

        </div>
    );
}
