/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.google.com',
                port: '',
                pathname: '/s2/favicons',
            },
            // https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=481378&theme=light
            {
                protocol: 'https',
                hostname: 'api.producthunt.com',
                port: '',
                pathname: '/widgets/embed-image/v1/featured.svg',
            },

        ]
    }
};

export default nextConfig;
