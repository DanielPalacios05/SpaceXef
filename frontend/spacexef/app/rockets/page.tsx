import { getRockets } from "@/actions/actions";
import Image from "next/image";
import { Rocket as RocketIcon, Ruler, Weight } from "lucide-react";

export default async function RocketsPage() {
    const rocketsResponse = await getRockets();
    const rockets = rocketsResponse.items;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-2 text-center">
                SpaceX <span className="font-semibold text-emerald-500">Fleet</span>
            </h1>
            <p className="text-gray-400 mb-16 text-center max-w-2xl">
                Discover the engineering marvels that power humanity&apos;s journey to the stars.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {rockets.map((rocket) => (
                    <div key={rocket.id} className="flex flex-col rounded-3xl overflow-hidden bg-white/5 border border-white/10 group hover:border-white/20 transition-colors backdrop-blur-md">

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
                        </div>

                        {/* Details Section */}
                        <div className="p-6 flex flex-col grow">
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                                {rocket.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <Ruler className="text-blue-500 mb-2 opacity-70" size={20} />
                                    <span className="text-xl font-light text-white">{rocket.height || "--"} <span className="text-xs text-gray-500">m</span></span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Height</span>
                                </div>
                                <div className="flex flex-col items-center text-center border-x border-white/5">
                                    <RocketIcon className="text-emerald-500 mb-2 opacity-70" size={20} />
                                    <span className="text-xl font-light text-white">{rocket.diameter || "--"} <span className="text-xs text-gray-500">m</span></span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Diameter</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <Weight className="text-purple-500 mb-2 opacity-70" size={20} />
                                    <span className="text-xl font-light text-white">{rocket.mass ? (rocket.mass / 1000).toFixed(0) : "--"} <span className="text-xs text-gray-500">t</span></span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Mass</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
