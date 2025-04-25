/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
		  colors: {
			// Light Mode Colors
			primary: {
			  DEFAULT: "#008A5A",
			  dark: "#019863"
			},
			secondary: {
			  DEFAULT: "#F9F5F0",
			  dark: "#2E2E2E"
			},
			accent: {
			  DEFAULT: "#C29955",
			  dark: "#E5B06E"
			},
			background: {
			  DEFAULT: "#FFFFFF",
			  dark: "#1A1A1A"
			},
			card: {
			  DEFAULT: "#FFFFFF",
			  dark: "#1A1A1A"
			},
			text: {
			  DEFAULT: "#1C160C",
			  muted: "#6B7280",
			  dark: "#FFFFFF",
			  'dark-muted': "#999999"
			},
			border: {
			  DEFAULT: "#E9DFCE",
			  dark: "#3D3D3D"
			},
			success: {
			  DEFAULT: "#4CAF50",
			  dark: "#059669"
			},
			error: {
			  DEFAULT: "#F44336",
			  dark: "#DC2626"
			}
		  },
		  fontFamily: {
			sans: ['"Inter"', '"Plus Jakarta Sans"', '"Noto Sans"', 'sans-serif'], // Inter for improved modern feel
		  },
		  boxShadow: {
			'soft': '0 2px 6px rgba(0, 0, 0, 0.12)',  // Slightly more visible soft shadow
			'card': '0 4px 16px rgba(0, 0, 0, 0.08)', // More pronounced card shadow
			'focus': '0 0 0 3px rgba(194, 153, 85, 0.4)', // Focus ring using accent color
		  },
		  borderRadius: {
			'xl': '12px',
			'2xl': '16px',
		  },
		  spacing: {
			'128': '32rem',
		  },
		},
	  },
	// plugins: [require("daisyui")],
	// daisyui: {
	//   themes: [
	// 	{
	// 	  netconnect: {
	// 		"primary": "#019863",
	// 		"secondary": "#F4EFE6",
	// 		"accent": "#A18249",
	// 		"neutral": "#1C160C",
	// 		"base-100": "#FFFFFF",
	// 		"info": "#3ABFF8",
	// 		"success": "#36D399",
	// 		"warning": "#FBBD23",
	// 		"error": "#F87272",
	// 	  },
	// 	},
	//   ],
	//   darkTheme: false,
	//   styled: true,
	//   utils: true,
	// },
  };