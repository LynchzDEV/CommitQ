import type { AppProps } from "next/app";
import { useEffect } from "react";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize Socket.IO connection
    fetch("/api/socket");
  }, []);

  return <Component {...pageProps} />;
}
