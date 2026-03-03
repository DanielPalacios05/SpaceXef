import Image from "next/image";
import Link from "next/link";
import { Rocket as RocketIcon, Ruler, Weight, Activity } from "lucide-react";
import { Rocket } from "@/domain/models";

interface RocketCardProps {
    rocket: Rocket;
}

export function RocketCard({ rocket }: RocketCardProps) {
    return (
        <div className="flex flex-col rounded-3xl overflow-hidden bg-white/5 border border-white/10 group hover:border-white/20 transition-colors backdrop-blur-md">
            {/* Image Section */}
            <div className="w-full h-80 relative overflow-hidden bg-black/50">
                {rocket.image ? (
                    <Image
                        src={rocket.image}
                        alt={rocket.name || "Rocket"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                        <RocketIcon size={64} className="mb-4 opacity-20" />
                        <span className="text-sm uppercase tracking-widest">No Image</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] to-transparent shrink-0" />

                <h2 className="absolute bottom-6 left-6 text-3xl font-semibold text-white tracking-tight">
                    {rocket.name}
                </h2>

                {/* Wikipedia Link */}
                {rocket.wikipedia && (
                    <Link
                        href={rocket.wikipedia}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-2.5 transition-colors group/wiki"
                        title="Read more on Wikipedia"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m14.97 18.95l-2.56-6.03c-1.02 1.99-2.14 4.08-3.1 6.03c-.01.01-.47 0-.47 0C7.37 15.5 5.85 12.1 4.37 8.68C4.03 7.84 2.83 6.5 2 6.5v-.45h5.06v.45c-.6 0-1.62.4-1.36 1.05c.72 1.54 3.24 7.51 3.93 9.03c.47-.94 1.8-3.42 2.37-4.47c-.45-.88-1.87-4.18-2.29-5c-.32-.54-1.13-.61-1.75-.61c0-.15.01-.25 0-.44l4.46.01v.4c-.61.03-1.18.24-.92.82c.6 1.24.95 2.13 1.5 3.28c.17-.34 1.07-2.19 1.5-3.16c.26-.65-.13-.91-1.21-.91c.01-.12.01-.33.01-.43c1.39-.01 3.48-.01 3.85-.02v.42c-.71.03-1.44.41-1.82.99L13.5 11.3c.18.51 1.96 4.46 2.15 4.9l3.85-8.83c-.3-.72-1.16-.87-1.5-.87v-.45l4 .03v.42c-.88 0-1.43.5-1.75 1.25c-.8 1.79-3.25 7.49-4.85 11.2z" /></svg>                    </Link>
                )}
            </div>

            {/* Details Section */}
            <div className="p-6 flex flex-col grow">
                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                    {rocket.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5 pt-6">
                    <div className="flex flex-col items-center text-center">
                        <Ruler className="text-blue-500 mb-2 opacity-70" size={20} />
                        <span className="text-xl font-light text-white">{rocket.height || "--"} <span className="text-sm text-gray-200">m</span></span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Height</span>
                    </div>
                    <div className="flex flex-col items-center text-center sm:border-x border-white/5">
                        <RocketIcon className="text-emerald-500 mb-2 opacity-70" size={20} />
                        <span className="text-xl font-light text-white">{rocket.diameter || "--"} <span className="text-sm text-gray-200">m</span></span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Diameter</span>
                    </div>
                    <div className="flex flex-col items-center text-center border-t sm:border-t-0 sm:border-r border-white/5 pt-4 sm:pt-0">
                        <Weight className="text-purple-500 mb-2 opacity-70" size={20} />
                        <span className="text-xl font-light text-white">{rocket.mass ? (rocket.mass / 1000).toFixed(0) : "--"} <span className="text-sm text-gray-200">t</span></span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Mass</span>
                    </div>
                    <div className="flex flex-col items-center text-center border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <Activity className="text-amber-500 mb-2 opacity-70" size={20} />
                        <span className="text-xl font-light text-white">{rocket.total_launches ?? "--"}</span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Launches</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
