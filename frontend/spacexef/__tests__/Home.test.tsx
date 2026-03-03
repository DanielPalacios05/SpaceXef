import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";

// Mock the Next.js image component
vi.mock("next/image", () => ({
    default: (props: Record<string, unknown>) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

// Mock the server actions
vi.mock("@/actions/actions", () => ({
    getStats: vi.fn().mockResolvedValue({ total: 150, failures: 10 }),
    getLaunches: vi.fn().mockResolvedValue({
        docs: [
            {
                id: "test-id",
                name: "Test Launch",
                status: "success",
                launch_date: 1700000000,
                details: "This is a mocked latest launch for testing.",
            },
        ],
    }),
}));

describe("Home page", () => {
    it("renders the hero section correctly", async () => {
        // Home is an async server component, so we need to await it
        const HomeComponent = await Home();
        render(HomeComponent);

        expect(screen.getByText(/Explore the Universe of/i)).toBeInTheDocument();
        expect(screen.getByAltText("SpaceX")).toBeInTheDocument();
        expect(screen.getByText(/Delve into mission statistics/i)).toBeInTheDocument();
    });

    it("renders the stats from the mocked server actions", async () => {
        const HomeComponent = await Home();
        render(HomeComponent);

        // Total Launches Stat Card value (150 mocked)
        expect(screen.getByText("150")).toBeInTheDocument();

        // Success Rate percentage computation (140/150 * 100 = 93.3%)
        expect(screen.getByText("93.3%")).toBeInTheDocument();
    });

    it("renders the mocked latest launch", async () => {
        const HomeComponent = await Home();
        render(HomeComponent);

        expect(screen.getAllByText("Test Launch").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("This is a mocked latest launch for testing.")).toBeInTheDocument();
    });
});
