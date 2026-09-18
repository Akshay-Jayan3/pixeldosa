import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The UI package ships uncompiled TypeScript on purpose: the registry's source
  // of truth and the docs site's rendered preview must be the exact same file, so
  // there is no build artefact between them that could drift.
  transpilePackages: ["@pixeldosa/ui", "@pixeldosa/tokens"],
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  // Static generation forks a worker per core by default. On a small machine that is
  // several V8 heaps at once against ~170 pages, and the build dies with an allocation
  // failure rather than a useful error. One worker is slower and finishes.
  experimental: { cpus: 1, workerThreads: false },
};

export default nextConfig;
