import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // .dark はソース中に現れず実行時に付与される (Storybook のテーマ切替) ため、
  // globals.css のダーク用トークン定義が purge されないよう明示的に残す
  safelist: ["dark"],
  theme: {
  	extend: {
  		colors: {
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
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			status: {
  				holiday: {
  					DEFAULT: 'hsl(var(--status-holiday))',
  					foreground: 'hsl(var(--status-holiday-foreground))'
  				},
  				rest: {
  					DEFAULT: 'hsl(var(--status-rest))',
  					foreground: 'hsl(var(--status-rest-foreground))'
  				}
  			},
  			avatar: {
  				'1': {
  					DEFAULT: 'hsl(var(--avatar-1))',
  					foreground: 'hsl(var(--avatar-1-foreground))'
  				},
  				'2': {
  					DEFAULT: 'hsl(var(--avatar-2))',
  					foreground: 'hsl(var(--avatar-2-foreground))'
  				},
  				'3': {
  					DEFAULT: 'hsl(var(--avatar-3))',
  					foreground: 'hsl(var(--avatar-3-foreground))'
  				},
  				'4': {
  					DEFAULT: 'hsl(var(--avatar-4))',
  					foreground: 'hsl(var(--avatar-4-foreground))'
  				},
  				'5': {
  					DEFAULT: 'hsl(var(--avatar-5))',
  					foreground: 'hsl(var(--avatar-5-foreground))'
  				},
  				'6': {
  					DEFAULT: 'hsl(var(--avatar-6))',
  					foreground: 'hsl(var(--avatar-6-foreground))'
  				},
  				'7': {
  					DEFAULT: 'hsl(var(--avatar-7))',
  					foreground: 'hsl(var(--avatar-7-foreground))'
  				},
  			},
  			feedback: {
  				info: {
  					subtle: 'hsl(var(--feedback-info-subtle))',
  					foreground: 'hsl(var(--feedback-info-foreground))',
  					border: 'hsl(var(--feedback-info-border))',
  					icon: 'hsl(var(--feedback-info-icon))',
  				},
  				success: {
  					subtle: 'hsl(var(--feedback-success-subtle))',
  					foreground: 'hsl(var(--feedback-success-foreground))',
  					border: 'hsl(var(--feedback-success-border))',
  					icon: 'hsl(var(--feedback-success-icon))',
  				},
  				warning: {
  					subtle: 'hsl(var(--feedback-warning-subtle))',
  					foreground: 'hsl(var(--feedback-warning-foreground))',
  					border: 'hsl(var(--feedback-warning-border))',
  					icon: 'hsl(var(--feedback-warning-icon))',
  				},
  				destructive: {
  					subtle: 'hsl(var(--feedback-destructive-subtle))',
  					foreground: 'hsl(var(--feedback-destructive-foreground))',
  					border: 'hsl(var(--feedback-destructive-border))',
  					icon: 'hsl(var(--feedback-destructive-icon))',
  				},
  			},
  			'site-header': {
  				DEFAULT: 'hsl(var(--site-header))',
  				foreground: 'hsl(var(--site-header-foreground))'
  			},
  			highlight: {
  				current: 'hsl(var(--highlight-current))'
  			},
  			border: 'hsl(var(--border))',
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
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
