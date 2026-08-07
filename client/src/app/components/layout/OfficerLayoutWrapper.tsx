import type { ReactNode } from "react";

interface OfficerLayoutWrapperProps {
    main: ReactNode;
    aside: ReactNode;
}

export function OfficerLayoutWrapper({
    main,
    aside,
}: OfficerLayoutWrapperProps) {
    return (
        <div className="flex-1 overflow-hidden">
            <div className="grid h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="overflow-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto space-y-6">{main}</div>
                </div>
                {aside}
            </div>
        </div>
    );
}
