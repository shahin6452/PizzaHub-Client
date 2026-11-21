import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import { SiteChrome } from "@/components/site-chrome";
export const metadata:Metadata={title:"PizzaHub — Fresh pizza from local favourites",description:"Discover local pizza shops, browse delicious menus and get your favourite pizza delivered."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><ClientProviders><SiteChrome>{children}</SiteChrome></ClientProviders></body></html>}
