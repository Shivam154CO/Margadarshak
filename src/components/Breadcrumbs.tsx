import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Link>
                </li>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                    const isLast = index === pathnames.length - 1;
                    const label = name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

                    return (
                        <li key={name}>
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
                                {isLast ? (
                                    <span className="ml-1 text-sm font-bold text-slate-900 md:ml-2">
                                        {label}
                                    </span>
                                ) : (
                                    <Link
                                        to={routeTo}
                                        className="ml-1 text-sm font-medium text-slate-500 hover:text-indigo-600 md:ml-2 transition-colors"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
