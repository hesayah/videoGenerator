import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "@/src/styles/globals.css"
import Header from "../components/header";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "hesayah",
  description: "hesayah generation ai",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="fr">
      {/* <body className={inter.className}>{children}</body> */}
      <body className="flex flex-col h-[100vh]">
        <Header/>
        {children}
      </body>
    </html>
  );
}
