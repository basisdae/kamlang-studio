import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_Thai } from "next/font/google";
import UndoToastHost from "../components/ui/UndoToastHost";
import BiInfoToastHost from "../components/ui/BiInfoToastHost";
import { AuthProvider } from "./auth/AuthProvider";
import { AppWorkspaceProvider } from "./providers/AppWorkspaceProvider";
import { CurrentBusinessProvider } from "./providers/CurrentBusinessProvider";
import WorkspaceGate from "../components/workspaces/WorkspaceGate";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Insight",
  description:
    "Every number tells a story. — วางแผนงบประมาณและวิเคราะห์ธุรกิจร้านอาหาร",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-kl-ivory text-kl-text font-sans antialiased">
        <AuthProvider>
          <CurrentBusinessProvider>
            <AppWorkspaceProvider>
              <WorkspaceGate>{children}</WorkspaceGate>
              <UndoToastHost />
              <BiInfoToastHost />
            </AppWorkspaceProvider>
          </CurrentBusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
