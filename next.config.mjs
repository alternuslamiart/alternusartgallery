/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  webpack(config, { webpack }) {
    // MapLibre v6's distributed worker is already minified ESM. Next 14's
    // asset optimizer otherwise reparses it as a classic script and fails.
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.compilation.tap("MapLibrePreminifiedWorker", compilation => {
          compilation.hooks.processAssets.tap({ name: "MapLibrePreminifiedWorker", stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL }, () => {
            for (const asset of compilation.getAssets()) {
              if (/^static\/media\/maplibre-gl-worker\.[a-f0-9]+\.mjs$/.test(asset.name)) {
                compilation.updateAsset(asset.name, asset.source, { ...asset.info, minimized: true });
              }
            }
          });
        });
      },
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.artprinta.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Security Headers
  async headers() {
    const rules = [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Prevent XSS attacks
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Cross-Origin isolation & resource protection
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy (disable unnecessary features)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagservices.com https://partner.googleadservices.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
              "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com https://res.cloudinary.com https://pagead2.googlesyndication.com https://adservice.google.com https://meshy.ai https://*.meshy.ai https://tripo3d.ai https://*.tripo3d.ai https://tripo3d.com https://*.tripo3d.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
          // Strict Transport Security (HTTPS only)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
    // Only Infrastructure loads map tiles and MapLibre's bundled blob worker.
    const mapOrigins = new Set(["https://tiles.openfreemap.org", ...(process.env.NODE_ENV === "development" ? ["https://demotiles.maplibre.org"] : [])]);
    const mapURLs = [process.env.NEXT_PUBLIC_INFRASTRUCTURE_MAP_STYLE, ...(process.env.INFRASTRUCTURE_MAP_ORIGINS || "").split(",")];
    for (const value of mapURLs.filter(Boolean)) {
      const url = new URL(value.trim());
      if (url.protocol !== "https:") throw new Error("Infrastructure map sources must use HTTPS.");
      if (process.env.NODE_ENV !== "development" && url.hostname === "demotiles.maplibre.org") throw new Error("MapLibre demo sources are development-only.");
      mapOrigins.add(url.origin);
    }
    const baseCSP = rules[0].headers.find(header => header.key === "Content-Security-Policy").value;
    const mapCSP = baseCSP.replace(/connect-src ([^;]+)/, (_, sources) => `connect-src ${sources} ${[...mapOrigins].join(" ")}`) + "; worker-src 'self' blob:";
    return [...rules, ...["/infrastructure", "/infrastructur", "/_next/static/media/maplibre-gl-worker.:asset*"].map(source => ({ source, headers: [{ key: "Content-Security-Policy", value: mapCSP }] }))];
  },
};

export default nextConfig;
