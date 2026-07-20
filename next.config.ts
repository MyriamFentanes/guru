import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its bundled .afm font files from disk at runtime using a
  // path relative to its own module location; bundling it breaks that
  // lookup, so it needs to stay a plain require() from node_modules.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
