import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), basicSsl()],
	server: {
		host: "0.0.0.0",
		port: 5173,
		https: {},
		proxy: {
			"/api": {
				target: process.env.VITE_API_TARGET ?? "http://localhost:3001",
				changeOrigin: true,
				// Allow the proxy to forward to a plain-HTTP backend
				secure: false,
			},
		},
	},
});
