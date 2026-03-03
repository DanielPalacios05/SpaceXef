import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Rocket, CalendarDays, Users, AlertTriangle } from "lucide-react";
import { Launch } from "@/domain/models";
import { StatusBadge } from "@/components/StatusBadge";
import { formatLaunchDate } from "@/lib/formatDate";

interface LaunchListCardProps {
    launch: Launch;
}

export function LaunchListCard({ launch }: LaunchListCardProps) {
    const { date: formattedDate, time: formattedTime } = formatLaunchDate(launch.launch_date, launch.date_precision);

    const payloadCount = launch.payloads?.length || 0;
    const crewCount = launch.crew?.length || 0;

    return (
        <Link href={`/launches/${encodeURIComponent(launch.SK || launch.id)}`} className="block w-full @container">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 @[480px]:p-6 backdrop-blur-sm group hover:border-white/20 transition-all hover:bg-white/10 flex flex-col @[480px]:flex-row items-start @[480px]:items-center justify-between gap-3 @[480px]:gap-6">

                {/* Left Side: Thumbnail Patch & Details */}
                <div className="flex items-start @[480px]:items-center gap-4 @[480px]:gap-6 flex-1 min-w-0 w-full">
                    <div className="w-14 h-14 @[480px]:w-20 @[480px]:h-20 shrink-0 relative bg-black/20 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                        {launch.patch ? (
                            <Image
                                src={launch.patch}
                                alt={`${launch.name} patch`}
                                fill
                                className="object-contain p-2 drop-shadow-lg"
                            />
                        ) : (
                            <Rocket className="w-7 h-7 @[480px]:w-8 @[480px]:h-8 text-gray-500 opacity-50" />
                        )}
                    </div>

                    {/* Middle Content */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base @[480px]:text-2xl font-bold text-white line-clamp-2 @[480px]:truncate group-hover:text-blue-400 transition-colors">
                                {launch.name}
                            </h3>
                            {/* Compact Arrow — visible when container is narrow */}
                            <div className="@[480px]:hidden w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex justify-center items-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </div>
                        </div>

                        {/* Compact Date — visible when container is narrow */}
                        <div className="flex @[480px]:hidden items-center gap-1.5 text-xs text-gray-300">
                            <CalendarDays className="w-3 h-3 text-blue-500/50" />
                            <span className="truncate">{formattedDate} {formattedTime}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 @[480px]:gap-3 text-xs @[480px]:text-sm text-gray-400 mt-1">
                            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px] @[480px]:text-xs shrink-0">#{launch.flight_number}</span>

                            {/* Compact Status */}
                            <div className="@[480px]:hidden shrink-0">
                                <StatusBadge status={launch.status} />
                            </div>

                            {payloadCount > 0 && (
                                <span className="flex items-center gap-1 shrink-0">
                                    <TargetIcon className="w-3 h-3 @[480px]:w-3.5 @[480px]:h-3.5" />
                                    {payloadCount} payload{payloadCount !== 1 ? 's' : ''}
                                </span>
                            )}

                            {crewCount > 0 && (
                                <span className="flex items-center gap-1 shrink-0">
                                    <Users className="w-3 h-3 @[480px]:w-3.5 @[480px]:h-3.5" />
                                    {crewCount} crew
                                </span>
                            )}
                        </div>

                        {/* Failure Reason */}
                        {launch.failures && launch.failures.length > 0 && (
                            <div className="mt-1 flex items-start gap-1.5 text-[10px] @[480px]:text-xs text-red-400/90 bg-red-500/10 border border-red-500/20 px-2 py-1 @[480px]:px-2.5 @[480px]:py-1.5 rounded-lg w-fit">
                                <AlertTriangle className="w-3 h-3 @[480px]:w-3.5 @[480px]:h-3.5 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 @[480px]:line-clamp-1 leading-relaxed">
                                    {launch.failures[0].reason || "Mission experienced an anomaly."}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Wide Date & Status — visible when container is wide */}
                <div className="hidden @[480px]:flex items-center justify-end gap-5 shrink-0">

                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="flex items-center text-sm text-gray-300 gap-2 text-right">
                            {launch.status === 'upcoming' && <span className="text-xs text-gray-500 uppercase">Expected:</span>}
                            <div className="flex flex-col justify-end">
                                <span className="flex items-center gap-1 font-mono">
                                    <CalendarDays className="w-3.5 h-3.5 text-blue-500/50" />
                                    {formattedDate}
                                </span>
                                {formattedTime && <span className="text-xs text-gray-500 font-mono text-right">{formattedTime}</span>}
                            </div>
                        </div>

                        <StatusBadge status={launch.status} />
                    </div>

                    {/* Wide Arrow */}
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex flex-col justify-center items-center text-white shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <ChevronRight className="w-5 h-5 ml-0.5" />
                    </div>
                </div>

            </div>
        </Link>
    );
}

// Simple internal icon for layout consistency
function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    )
}
