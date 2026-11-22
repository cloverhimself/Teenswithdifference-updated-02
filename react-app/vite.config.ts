import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
export default defineConfig({plugins:[react(),tailwindcss(),viteStaticCopy({targets:[{src:"../images/**/*",dest:"images"},{src:"../admin/**/*",dest:"admin"},{src:"../site.webmanifest",dest:"."},{src:"../sw.js",dest:"."},{src:"../offline.html",dest:"."}]} )],build:{outDir:"dist",emptyOutDir:true}});