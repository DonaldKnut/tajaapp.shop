import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { FloatingCart } from "@/components/ui/FloatingCart";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taja.Shop - Nigeria's Trusted Marketplace",
  description:
    "Next-generation Nigerian e-commerce marketplace for thrift fashion, vintage items, and handmade crafts. From WhatsApp chaos to your own shop.",
  keywords: [
    "ecommerce",
    "nigeria",
    "marketplace",
    "thrift",
    "fashion",
    "handmade",
    "vintage",
  ],
  authors: [{ name: "Taja.Shop Team" }],
  openGraph: {
    title: "Taja.Shop - Nigeria's Trusted Marketplace",
    description:
      "Give every Nigerian seller their own online shop and trusted community marketplace.",
    url: "https://taja.shop",
    siteName: "Taja.Shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taja.Shop - Nigeria's Trusted Marketplace",
    description:
      "Give every Nigerian seller their own online shop and trusted community marketplace.",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#10B981" />
      </head>
      <body className={poppins.className}>
        <div className="min-h-screen bg-gradient-to-br from-taja-light to-white">
          {children}
          <FloatingCart />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
