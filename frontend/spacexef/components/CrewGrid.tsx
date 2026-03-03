import Image from "next/image";
import { Users } from "lucide-react";
import { Crew } from "@/domain/models";

interface CrewGridProps {
    crew: Crew[];
}

export function CrewGrid({ crew }: CrewGridProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm h-full">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <h2 className="text-2xl font-semibold text-white">Mission Crew</h2>
            </div>

            <div className="flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-1 md:gap-6">
                    {crew.map((member) => (
                        <div key={member.id} className="flex flex-col items-center text-center group">
                            <div className="w-30 h-30 sm:w-45 sm:h-45 relative rounded-2xl overflow-hidden mb-3 border-2 border-white/10 group-hover:border-purple-500/50 transition-colors bg-gray-900 shadow-xl">
                                {member.image ? (
                                    <Image
                                        src={member.image}
                                        alt={member.name || 'Crew astronaut'}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <Users className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600" />
                                )}
                            </div>
                            <h4 className="font-medium text-white text-sm line-clamp-1">{member.name}</h4>
                            <span className="text-xs text-gray-400 mt-0.5 capitalize">{member.role}</span>
                            {member.agency && <span className="text-[10px] text-purple-400/80 mt-1 uppercase font-mono tracking-wider">{member.agency}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function EmptyCrewCard() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col items-center justify-center text-center text-gray-500 h-full min-h-[320px]">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">No crew was attached to this autonomous vehicle.</p>
        </div>
    );
}
