import { getStats, getLaunches } from "@/actions/actions";
import { StatCard } from "@/components/StatCard";
import { CombinedStatsCard } from "@/components/CombinedStatsCard";
import { SuccessRateChart } from "@/components/SuccessRateChart";
import { Rocket, Target, Activity } from "lucide-react";
import Image from "next/image";

export default async function Home() {
  // Fetch data in parallel
  const [stats, launchesResponse] = await Promise.all([
    getStats(),
    getLaunches(1) // Get the latest launch
  ]);

  const latestLaunch = launchesResponse.docs[0];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full flex my-6 items-center justify-center overflow-hidden">
        {/* Abstract Background Blur */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-900/20 rounded-full blur-[120px] opacity-50" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="SpaceXef"
            width={400}
            height={100}
            className="mb-8 object-contain opacity-90"
            priority
          />
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-center text-white mb-6">
            Explore the Universe of <div className="inline-block max-w-[220px]">
              <img src="/space.png" alt="SpaceX" className=" min-w-[270px]" />
            </div>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl">
            Delve into mission statistics, view historical launches, and explore the engineering marvels of the rockets that make it all possible.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 my-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <CombinedStatsCard
              totalLaunches={stats.total}
              totalPayload={stats.total_payload_mass || 0}
              humansFlown={stats.humans_traveled || 0}
            />
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full min-h-[300px]">
            <SuccessRateChart total={stats.total} failures={stats.failures} />
          </div>

          {/* Latest Mission Card */}
          {latestLaunch && (
            <div className="col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-white/20 transition-colors min-h-[300px]">

              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider self-start mb-4">
                Latest Mission
              </h3>

              {latestLaunch.patch ? (
                <div className="w-24 h-24 relative mb-4 shrink-0">
                  <Image
                    src={latestLaunch.patch}
                    alt={`${latestLaunch.name} patch`}
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border border-white/20 flex flex-col justify-center items-center text-gray-500 shrink-0 mb-4">
                  <Rocket size={24} className="mb-1 opacity-50" />
                  <span className="text-[10px] uppercase">No Patch</span>
                </div>
              )}

              <h4 className="text-2xl font-semibold text-white mb-2">{latestLaunch.name}</h4>

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${latestLaunch.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  latestLaunch.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                  {latestLaunch.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(latestLaunch.launch_date! * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {latestLaunch.details && (
                <p className="text-xs text-gray-400 line-clamp-2 mt-2">
                  {latestLaunch.details}
                </p>
              )}

              {latestLaunch.rocket?.name && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10">
                  <Rocket size={14} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Flown on {latestLaunch.rocket.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
