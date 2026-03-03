import { z } from "zod";

export const RocketSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    height: z.number().nullable().optional(),
    diameter: z.number().nullable().optional(),
    mass: z.number().nullable().optional(),
    description: z.string().nullable().optional(),
    image: z.string().url().nullable().optional(),
    total_launches: z.number().nullable().optional(),
    wikipedia: z.string().url().nullable().optional(),
});
export type Rocket = z.infer<typeof RocketSchema>;

export const FailureSchema = z.object({
    time: z.number().nullable().optional(),
    altitude: z.number().nullable().optional(),
    reason: z.string().nullable().optional(),
});
export type Failure = z.infer<typeof FailureSchema>;

export const PayloadSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    mass: z.number().nullable().optional(),
});
export type Payload = z.infer<typeof PayloadSchema>;

export const CrewSchema = z.object({
    id: z.string(),
    role: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    agency: z.string().nullable().optional(),
    image: z.string().url().nullable().optional(),
});
export type Crew = z.infer<typeof CrewSchema>;

export const LaunchSchema = z.object({
    id: z.string(),
    SK: z.string().optional(),
    patch: z.string().url().nullable().optional(),
    flight_number: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
    launch_date: z.number().nullable().optional(),
    date_precision: z.string().nullable().optional(),
    youtube_id: z.string().nullable().optional(),
    status: z.enum(["success", "failed", "upcoming"]).nullable().optional(),
    failures: z.array(FailureSchema).nullable().optional(),
    rocket: RocketSchema.nullable().optional(),
    payloads: z.array(PayloadSchema).nullable().optional(),
    crew: z.array(CrewSchema).nullable().optional(),
});
export type Launch = z.infer<typeof LaunchSchema>;

export const StatsSchema = z.object({
    total: z.number(),
    failures: z.number(),
    total_payload_mass: z.number().optional(),
    humans_traveled: z.number().optional(),
});
export type Stats = z.infer<typeof StatsSchema>;

export const PaginatedLaunchesSchema = z.object({
    docs: z.array(LaunchSchema),
    count: z.number(),
    next_token: z.string().nullable().optional(),
    has_next_page: z.boolean(),
});
export type PaginatedLaunches = z.infer<typeof PaginatedLaunchesSchema>;

export const RocketListResponseSchema = z.object({
    items: z.array(RocketSchema),
    count: z.number()
});
