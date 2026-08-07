import type { ReactNode } from "react";

interface OfficerLayoutShellProps {
    children: ReactNode;
}

export function OfficerLayoutShell({ children }: OfficerLayoutShellProps) {
    return (
        <div className="flex-1 overflow-hidden">
            <div className="flex h-[calc(100vh-4rem)]">
                <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
