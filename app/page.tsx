"use client";

import { useEffect, useState } from "react";
import { Header } from "./_components/Header";
import { AppSidebar } from "./_components/Sidebar";
import { Editor } from "./_components/Editor";
import { Viewer } from "./_components/Viewer";
import { Outlines } from "./_components/Outlines";
import { Footer } from "./_components/Footer";
import Loading from "./loading";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";

import { useContentStore } from "@/store/useContentStore";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const { fileName, viewerTab } = useContentStore();
  const isFlow = viewerTab === "flow" || fileName?.toLowerCase().endsWith(".flow");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden animate-in fade-in-50 duration-200">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <ResizablePanelGroup
          orientation={isMobile ? "vertical" : "horizontal"}
          key={`${isMobile ? "vertical" : "horizontal"}-${isFlow ? "flow-mode" : "md-mode"}`}
        >
          <ResizablePanel defaultSize={isMobile ? 50 : (isFlow ? 30 : 25)} minSize={isMobile ? 20 : 10}>
            <Editor />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={isMobile ? 50 : (isFlow ? 70 : 50)} minSize={isMobile ? 20 : 20}>
            <Viewer />
          </ResizablePanel>
          {!isMobile && !isFlow && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <Outlines />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      <Footer />
    </div>
  );
}
