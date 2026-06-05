import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AppForge — AI App Generator",
  description: "Build production-ready apps from natural language prompts. Powered by Groq AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "DM Sans, sans-serif",
              background: "white",
              color: "#1e1b4b",
              border: "1px solid #e9d5ff",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(168, 85, 247, 0.15)",
            },
            success: { iconTheme: { primary: "#a855f7", secondary: "white" } },
            error: { iconTheme: { primary: "#ec4899", secondary: "white" } },
          }}
        />
      </body>
    </html>
  );
}
