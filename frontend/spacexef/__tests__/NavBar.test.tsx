import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NavBar } from "@/components/NavBar";

// Mock next/navigation
vi.mock("next/navigation", () => {
    return {
        usePathname: () => "/",
    };
});

// Simple mock for Next.js router links and images
vi.mock("next/link", () => {
    return {
        default: ({ children, href, onClick, className }: { children: React.ReactNode; href: string; onClick?: () => void; className?: string }) => {
            return <a href={href} onClick={onClick} className={className}>{children}</a>;
        },
    };
});

vi.mock("next/image", () => {
    return {
        default: (props: Record<string, unknown>) => {
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            return <img {...props} />;
        },
    };
});

describe("NavBar component", () => {
    it("renders navigation links correctly", () => {
        render(<NavBar />);

        // Check if the logo exists by its specific alt text
        expect(screen.getByAltText("SpaceXef Logo")).toBeInTheDocument();

        // Check main links are present
        expect(screen.getAllByText(/Home/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Launches/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Rockets/i)[0]).toBeInTheDocument();
    });
});
