import { getRockets } from "@/actions/actions";
import { RocketCard } from "@/components/RocketCard";
export const dynamic = 'force-dynamic';

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
                    <RocketCard key={rocket.id} rocket={rocket} />
                ))}
            </div>
        </div>
    );
}
