/**
 * Formats a Unix timestamp into a display date and optional time string
 * based on the precision level from the SpaceX API.
 */
export function formatLaunchDate(
    launchDateUnix: number | null | undefined,
    datePrecision: string | null | undefined
): { date: string; time: string } {
    if (!launchDateUnix) return { date: "", time: "" };

    const launchDate = new Date(launchDateUnix * 1000);
    let date = "";
    let time = "";

    if (datePrecision === "hour" || datePrecision === "minute") {
        date = launchDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        time = launchDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    } else {
        date = launchDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: datePrecision === "day" ? "numeric" : undefined,
        });
    }

    return { date, time };
}
