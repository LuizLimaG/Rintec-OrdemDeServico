import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, CustomTrigger } from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rintec - Ordem de Serviço",
  description: "Sistema de geração de ordens de serviço Rintec",
  icons: {
    icon: "/shorcut-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full bg-gray-100 print:bg-white`}
      >
        <Toaster position="top-center" />
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <main className="w-full">
            <AppHeader>
              <CustomTrigger />
            </AppHeader>
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
