import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The UI package ships uncompiled TypeScript on purpose: the registry's source
  // of truth and the docs site's rendered preview must be the exact same file, so
  // there is no build artefact between them that could drift.
  transpilePackages: ["@pixeldosa/ui", "@pixeldosa/tokens"],
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
