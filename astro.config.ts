// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
// import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const starlightConfig = starlight({
    title: 'My Docs',
    components: {
        Search: './src/components/starlight/Search.astro'
    },
    social: {
        github: 'https://github.com/withastro/starlight',
    },
    sidebar: [
        { label: 'Quick Start', link: '/docs/' },

        {
            label: 'Guides',
            autogenerate: { directory: 'docs/guides' },
        },
        {
            label: 'Reference',
            autogenerate: { directory: 'docs/reference' },
        },
    ],
})
// https://astro.build/config
export default defineConfig({
    integrations: [starlightConfig, tailwind(), sitemap()],

    //FIXME: change to your hosted url for other config see docs 
    // https://docs.astro.build/en/guides/integrations-guide/sitemap/#configuration
    site: 'https://quicksass.build',
    security: {
        checkOrigin: true
    },
    output: 'server',
    //FIXME: default is set to node server, but you can comment out the node adapter and enable the cloudflair adapter
    // if you do so make sure to uncomment the import up top too
    // adapter: cloudflare(),
    adapter: node({
        mode: 'standalone',
    }),
    vite: {
        optimizeDeps: {
            exclude: ["astro:db"]
        }
    }
});