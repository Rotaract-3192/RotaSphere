import type { Metadata, Viewport } from "next";
import { Outfit, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "RotaSphere | Premium Event Management Platform for Rotaract",
  description: "Plan, customize, host, and analyze Rotaract service drives, professional webinars, fundraisers, and fellowships seamlessly with RotaSphere.",
  keywords: ["Rotaract", "Rotary", "event management", "event planning", "SaaS", "ticketing", "community service", "fundraisers", "fellowships"],
  authors: [{ name: "RotaSphere Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {clerkKey ? (
            <ClerkProvider publishableKey={clerkKey}>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ClerkProvider>
          ) : (
            <AuthProvider>
              {children}
            </AuthProvider>
          )}
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </ThemeProvider>
      </body>
    </html>
  );
}

