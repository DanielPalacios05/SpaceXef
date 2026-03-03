import { Target } from "lucide-react";
import { Payload } from "@/domain/models";

interface PayloadGridProps {
    payloads: Payload[];
}

export function PayloadGrid({ payloads }: PayloadGridProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h2 className="text-2xl font-semibold text-white">Payload Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {payloads.map((payload) => (
                    <div key={payload.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                        <h3 className="text-lg font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">{payload.name}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <span className="capitalize">{payload.type}</span>
                            {payload.mass ? (
                                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                    {payload.mass.toLocaleString()} kg
                                </span>
                            ) : (
                                <span className="font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                                    Unknown
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
