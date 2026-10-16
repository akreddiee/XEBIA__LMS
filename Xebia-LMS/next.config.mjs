/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const backendUrl = rawBackendUrl.replace(/\/+$/, "").endsWith("/api")
      ? rawBackendUrl.replace(/\/+$/, "")
      : `${rawBackendUrl.replace(/\/+$/, "")}/api`;

    const endpoints = [
      "classes", "assessments", "submissions", "materials", "certificates", 
      "batches", "upload", "dashboard", "courses", "categories", "modules", 
      "submodules", "contents", "content", "iam", "analytics", "files", "events",
      "notifications", "verification", "auth"
    ];
    
    const rewrites = [];
    for (const ep of endpoints) {
      rewrites.push({ source: `/api/${ep}`, destination: `${backendUrl}/${ep}` });
      rewrites.push({ source: `/api/${ep}/:path*`, destination: `${backendUrl}/${ep}/:path*` });
    }
    
    return rewrites;
  },
};

export default nextConfig;
