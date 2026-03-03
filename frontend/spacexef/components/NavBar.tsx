"use client";

import Link from "next/link";
import Image from "next/image";
import { Rocket, CalendarDays, Globe, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Home", icon: Globe },
    { href: "/launches", label: "Launches", icon: CalendarDays },
    { href: "/rockets", label: "Rockets", icon: Rocket },
] as const;

export function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu on route change
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-50">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
                        <div className="relative w-32 h-8 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="SpaceXef Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-widest uppercase">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`transition-colors flex items-center gap-2 ${pathname === href ? "text-white" : "text-gray-400 hover:text-white"}`}
                            >
                                <Icon size={16} /> {label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-gray-400 hover:text-white transition-colors p-2"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-lg transition-all duration-300 ease-in-out flex flex-col items-center justify-center space-y-8 md:hidden ${isOpen ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible"
                    }`}
                style={{ paddingTop: "64px" }}
            >
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`transition-colors flex items-center gap-3 text-2xl font-medium tracking-widest uppercase ${pathname === href ? "text-white" : "text-gray-400 hover:text-white"
                            }`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Icon size={24} /> {label}
                    </Link>
                ))}
            </div>
        </>
    );
}
