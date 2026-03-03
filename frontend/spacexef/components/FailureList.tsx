import { AlertTriangle } from "lucide-react";
import { Failure } from "@/domain/models";

interface FailureListProps {
    failures: Failure[];
}

export function FailureList({ failures }: FailureListProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-2xl font-semibold text-red-400">Mission Anomalies</h2>
            </div>
            <div className="space-y-4">
                {failures.map((failure, idx) => (
                    <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {failure.time != null && (
                                <span className="inline-block px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs font-mono">
                                    T+{failure.time}s
                                </span>
                            )}
                            {failure.altitude != null && (
                                <span className="inline-block px-2 py-1 rounded bg-black/20 text-gray-300 text-xs font-mono">
                                    Alt: {failure.altitude}km
                                </span>
                            )}
                        </div>
                        <p className="text-red-200 capitalize leading-relaxed text-sm">
                            {failure.reason || "An unknown anomaly occurred."}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
