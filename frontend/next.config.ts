import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(), // 👈 Esto forza a usar el directorio actual como raíz
  },
};

export default nextConfig;