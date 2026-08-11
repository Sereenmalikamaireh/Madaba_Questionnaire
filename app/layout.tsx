import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MPA-Index | Madaba Heritage Walking Trails",
  description: "Multisensory Perception and Place Attachment field questionnaire",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
