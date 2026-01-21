import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			ink: '#1e293b',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			surface: '#ffffff',
  			'surface-alt': '#f8fafc',
  			border: 'hsl(var(--border))',
  			brand: '#3b82f6',
  			'brand-soft': '#dbeafe',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'accent-soft': '#ffedd5',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			heading: [
  				'Lora',
  				'serif'
  			],
  			body: [
  				'Raleway',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			soft: '0 18px 45px rgba(15, 23, 42, 0.12)',
  			lift: '0 12px 30px rgba(15, 23, 42, 0.12)',
  			glow: '0 0 0 3px rgba(59, 130, 246, 0.2)'
  		},
  		keyframes: {
  			pulseSoft: {
  				'0%, 100%': {
  					transform: 'scale(0.96)',
  					opacity: '0.6'
  				},
  				'50%': {
  					transform: 'scale(1.04)',
  					opacity: '1'
  				}
  			},
  			ringPulse: {
  				'0%': {
  					transform: 'scale(0.9)',
  					opacity: '0.7'
  				},
  				'100%': {
  					transform: 'scale(1.15)',
  					opacity: '0'
  				}
  			},
  			spinSlow: {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			expand: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-4px) scaleY(0.98)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0) scaleY(1)'
  				}
  			}
  		},
  		animation: {
  			'pulse-soft': 'pulseSoft 2.6s ease-in-out infinite',
  			'ring-pulse': 'ringPulse 1.2s ease-out infinite',
  			'spin-slow': 'spinSlow 0.8s linear infinite',
  			expand: 'expand 0.18s ease-out'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate]
};
