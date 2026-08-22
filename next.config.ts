import type { NextConfig } from "next";

/** The 2-minute demo film. Same link the README points at. */
const DEMO_FILM_URL = "https://youtu.be/SLyXNW51g4I";

const nextConfig: NextConfig = {
  /**
   * `/video` is the short, sayable link to the demo film — it belongs on a slide or in a
   * sentence, where a raw YouTube id does not. Temporary (307) on purpose: the film can be
   * recut and re-uploaded without a permanent redirect stuck in everyone's browser cache.
   */
  async redirects() {
    return [{ source: "/video", destination: DEMO_FILM_URL, permanent: false }];
  },

  /**
   * `/lens` reads `.lens/*.json` at request time through a path it builds at runtime, which
   * static tracing cannot see. Without this the deployed page has nothing to render.
   */
  outputFileTracingIncludes: {
    "/lens": [".lens/*.json"],
  },
};

export default nextConfig;
