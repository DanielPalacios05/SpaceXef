interface StatusBadgeProps {
    status?: "success" | "failed" | "upcoming" | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    if (!status) return null;

    const styles = {
        success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        failed: "bg-red-500/20 text-red-400 border border-red-500/30",
        upcoming: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    };

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${styles[status]}`}>
            {status}
        </span>
    );
}
