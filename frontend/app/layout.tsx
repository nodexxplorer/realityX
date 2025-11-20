// app/layout.tsx

"use client"
import "../styles/globals.css";
import { Inter } from "next/font/google";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from '@/components/admin/providers/QueryProvider';
import { ThemeProvider } from 'next-themes';
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
import { Toaster } from "sonner";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import type { Cluster } from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import React, { useMemo } from "react";
// import SplineBackground from '@/components/SplineBackground';
// import Spline from '@splinetool/react-spline';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const network: Cluster = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <html lang="en">
      <Head>
        <title>realityX ai</title>
        <meta name="description" content="Where dreams take shape on-chain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body suppressHydrationWarning className={`relative ${inter.className}`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>
                    <main>{children}</main>
                    <Toaster />
                  </WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}




{/* <Spline className="fixed bg-black items-center inset-0 -z-11 pointer-events-none select-none"
                        scene="https://prod.spline.design/V3WMbbL1uiv46vn2/scene.splinecode" 
                      /> */}