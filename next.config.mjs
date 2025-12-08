import send from "next/dist/compiled/send/index.js";

// Add HEIC/HEIF so Next's image optimizer can derive an extension
send.mime.define({
    "image/heic": ["heic", "heif"],
    "image/heif": ["heif", "heic"]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                protocol:"https",
                hostname:"*"
            }
        ]
    }
};

export default nextConfig;
