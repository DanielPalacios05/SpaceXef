"use client";

import Link from "next/link";
import Image from "next/image";
import { Rocket, CalendarDays, Globe, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
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
                        <Link
                            href="/"
                            className={`transition-colors flex items-center gap-2 ${pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Globe size={16} /> Home
                        </Link>
                        <Link
                            href="/launches"
                            className={`transition-colors flex items-center gap-2 ${pathname === "/launches" ? "text-white" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <CalendarDays size={16} /> Launches
                        </Link>
                        <Link
                            href="/rockets"
                            className={`transition-colors flex items-center gap-2 ${pathname === "/rockets" ? "text-white" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Rocket size={16} /> Rockets
                        </Link>
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
                style={{ paddingTop: '64px' }}
            >
                <Link
                    href="/"
                    className={`transition-colors flex items-center gap-3 text-2xl font-medium tracking-widest uppercase ${pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"
                        }`}
                    onClick={() => setIsOpen(false)}
                >
                    <Globe size={24} /> Home
                </Link>
                <Link
                    href="/launches"
                    className={`transition-colors flex items-center gap-3 text-2xl font-medium tracking-widest uppercase ${pathname === "/launches" ? "text-white" : "text-gray-400 hover:text-white"
                        }`}
                    onClick={() => setIsOpen(false)}
                >
                    <CalendarDays size={24} /> Launches
                </Link>
                <Link
                    href="/rockets"
                    className={`transition-colors flex items-center gap-3 text-2xl font-medium tracking-widest uppercase ${pathname === "/rockets" ? "text-white" : "text-gray-400 hover:text-white"
                        }`}
                    onClick={() => setIsOpen(false)}
                >
                    <Rocket size={24} /> Rockets
                </Link>
            </div>
        </>
    );
}
