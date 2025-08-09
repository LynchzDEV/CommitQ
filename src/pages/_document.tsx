import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="CommitQ is a real-time multi-team queue management system for efficient team collaboration, task tracking, and workflow management. Perfect for BMA Training, development teams, and project coordination." />
        <meta name="keywords" content="queue management, team collaboration, task tracking, real-time updates, multi-team, action items, workflow management, productivity tool, team coordination, project management" />
        <meta name="author" content="CommitQ Team" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Theme and App Meta */}
        <meta name="theme-color" content="#416c6d" />
        <meta name="msapplication-TileColor" content="#416c6d" />
        <meta name="application-name" content="CommitQ" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CommitQ" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CommitQ" />
        <meta property="og:title" content="CommitQ - Multi-Team Queue Management System" />
        <meta property="og:description" content="Streamline your team collaboration with CommitQ's real-time queue management system. Perfect for multi-team environments, task tracking, and workflow optimization." />
        <meta property="og:url" content="https://commitq.app" />
        <meta property="og:image" content="https://commitq.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CommitQ - Real-time Queue Management for Teams" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CommitQ - Multi-Team Queue Management System" />
        <meta name="twitter:description" content="Streamline your team collaboration with real-time queue management, task tracking, and multi-team workflow optimization." />
        <meta name="twitter:image" content="https://commitq.app/twitter-image.png" />
        <meta name="twitter:image:alt" content="CommitQ - Real-time Queue Management for Teams" />
        
        {/* Favicons and App Icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#416c6d" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS Prefetch for Performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Structured Data - WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CommitQ",
              "description": "Real-time multi-team queue management system for efficient team collaboration and task tracking",
              "url": "https://commitq.app",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Modern web browser required.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "CommitQ Team"
              },
              "featureList": [
                "Real-time queue management",
                "Multi-team collaboration",
                "Task tracking and action items",
                "Live updates with Socket.IO",
                "Team-specific workflows",
                "Responsive web design"
              ]
            })
          }}
        />
        
        {/* Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "CommitQ",
              "operatingSystem": "Web Browser",
              "applicationCategory": "BusinessApplication",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
