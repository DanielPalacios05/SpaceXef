import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black py-8 mt-20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                    © {new Date().getFullYear()} SpaceXef Platform
                </div>

                <div className="flex items-center space-x-6">
                    <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                        <Github size={20} />
                    </Link>
                    <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                        <Twitter size={20} />
                    </Link>
                </div>
            </div>
        </footer>
    );
}
