import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "SSC",
 description: "Strength & conditioning coaching portal",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" data-theme="paper">
 <body
 className={`${geistSans.variable} ${geistMono.variable} antialiased`}
 >
 <ThemeProvider>
 <ToastProvider>{children}</ToastProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
