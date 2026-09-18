"use client";

import { ToggleTheme } from "@/components/ui/toggle-theme";
import { ExportDropdown } from "./_components/ExportDropdown";
import { FileNameInput } from "./_components/FileNameInput";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
    return (
        <header className="flex h-12 items-center justify-between border-b px-4 bg-background/95 backdrop-blur-xs">
            <div className="flex items-center gap-3">
                {/* Brand Logo & Name: Formatly */}
                {/* <div className="flex items-center gap-2 select-none">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <Sparkles className="size-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground">
                        Formatly
                    </span>
                </div> */}

                {/* Sidebar Toggle (Mobile only) */}
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground md:hidden" />

                <Separator orientation="vertical" className="h-4 md:hidden mx-0.5" />

                {/* File Path & Editable File Name Input */}
                <FileNameInput />
            </div>

            <div className="flex items-center gap-2">
                <ExportDropdown />
                <ToggleTheme
                    duration={600}
                    animationType="circle-spread"
                />
            </div>
        </header>
    );
}
