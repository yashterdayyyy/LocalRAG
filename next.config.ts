import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["chromadb"],

  webpack: (config) => {
    config.externals.push({
      "onnxruntime-node": "commonjs onnxruntime-node",
      "@huggingface/transformers": "commonjs @huggingface/transformers",
    });
    return config;
  },
};

export default nextConfig;
