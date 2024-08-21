import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import injectHTML from "vite-plugin-html-inject"

export default defineConfig({
  plugins: [
    injectHTML(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      manifest: {
        name: "CSS Colors",
        theme_color: "#242424",
        icons: [
          {
            src: "icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
})
