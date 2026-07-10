// @ts-check
import {defineConfig, fontProviders} from "astro/config";

// https://astro.build/config
export default defineConfig({
    prefetch: {
        defaultStrategy: "viewport"
    },
    fonts: [
        {
            provider: fontProviders.local(),
            name: "Sofia Sans",
            cssVariable: "--font-sofia-sans",
            options: {
                variants: [{
                    src: ["./src/assets/fonts/sofia-sans-v20-cyrillic_latin-regular.woff2"],
                    weight: "400",
                    style: "normal",
                    display: "swap"
                }]
            }
        },
        {
            provider: fontProviders.local(),
            name: "PT Serif",
            cssVariable: "--font-pt-serif",
            options: {
                variants: [{
                    src: ["./src/assets/fonts/pt-serif-v19-cyrillic_latin-regular.woff2"],
                    weight: "400",
                    style: "normal",
                    display: "swap"
                }]
            }
        },
        {
            provider: fontProviders.local(),
            name: "PT Sans",
            cssVariable: "--font-pt-sans",
            options: {
                variants: [{
                    src: ["./src/assets/fonts/pt-sans-v18-cyrillic_latin-regular.woff2"],
                    weight: "400",
                    style: "normal",
                    display: "swap"
                }]
            }
        },
    ]
});
