import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `/lens` reads `.lens/*.json` at request time through a path it builds at runtime, which
   * static tracing cannot see. Without this the deployed page has nothing to render.
   */
  outputFileTracingIncludes: {
    "/lens": [".lens/*.json"],
  },
};

export default nextConfig;
