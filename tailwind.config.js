/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

module.exports = {
	content: ["./pages/**/*.tsx", "./src/**/*.tsx"],
	theme: {
		extend: {
			screens: {
				"2xl": "1536px",
			},
		},
	},
	plugins: [require("daisyui"), require("tailwind-scrollbar-hide")],
	daisyui: {
		styled: true,
		themes: [
			{
				mytheme: {
					primary: "#1e40af",
					"primary-focus": "#1e3a8a",
					"primary-content": "#ffffff",
					secondary: "#ff0000",
					"secondary-focus": "#ad0000",
					"secondary-content": "#ffffff",
					accent: "#37cdbe",
					"accent-focus": "#2aa79b",
					"accent-content": "#ffffff",
					neutral: "#3d4451",
					"neutral-focus": "#2a2e37",
					"neutral-content": "#ffffff",
					"base-100": "#ffffff",
					"base-200": "#f9fafb",
					"base-300": "#d1d5db",
					"base-content": "#1f2937",
					info: "#2094f3",
					success: "#43A047",
					warning: "#ff9900",
					error: "#ff5724",
				},
			},
		],
		base: true,
		utils: true,
		logs: true,
		rtl: false,
	},
}
