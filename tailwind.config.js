/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"',
          'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'
        ],
        mono: [
          '"SF Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco',
          'Consolas', 'monospace'
        ],
      },
      fontSize: {
        // iOS HIG dynamic type scale (approx)
        'caption2': ['11px', { lineHeight: '13px', letterSpacing: '0.06em' }],
        'caption1': ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.08px' }],
        'subhead':  ['15px', { lineHeight: '20px', letterSpacing: '-0.24px' }],
        'callout':  ['16px', { lineHeight: '21px', letterSpacing: '-0.32px' }],
        'body':     ['17px', { lineHeight: '22px', letterSpacing: '-0.41px' }],
        'headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.41px', fontWeight: '600' }],
        'title3':   ['20px', { lineHeight: '25px', letterSpacing: '-0.45px', fontWeight: '600' }],
        'title2':   ['22px', { lineHeight: '28px', letterSpacing: '-0.5px', fontWeight: '700' }],
        'title1':   ['28px', { lineHeight: '34px', letterSpacing: '-0.6px', fontWeight: '700' }],
        'ltitle':   ['34px', { lineHeight: '41px', letterSpacing: '-0.8px', fontWeight: '700' }],
      },
      colors: {
        // Brand tint (iOS "accent color" pattern) — refined indigo
        tint: {
          50:  '#EEF0FD',
          100: '#DDE1FB',
          200: '#BBC4F6',
          300: '#95A1EE',
          400: '#7580E2',
          500: '#5E6AD2',
          600: '#4B55B8',
          700: '#3C4596',
          800: '#2F3677',
          900: '#1F2545',
          DEFAULT: '#5E6AD2',
        },
        // iOS system background scale (grouped backgrounds)
        ios: {
          // Light
          'bg':         '#F2F2F7',
          'bg-elev':    '#FFFFFF',
          'bg-tert':    '#FFFFFF',
          'surface':    '#FFFFFF',
          'fill-1':     'rgba(120, 120, 128, 0.12)',
          'fill-2':     'rgba(120, 120, 128, 0.08)',
          'fill-3':     'rgba(118, 118, 128, 0.06)',
          'separator':  'rgba(60, 60, 67, 0.12)',
          'label':      '#000000',
          'label-2':    'rgba(60, 60, 67, 0.68)',
          'label-3':    'rgba(60, 60, 67, 0.42)',
          'label-4':    'rgba(60, 60, 67, 0.22)',
          // Dark
          'dbg':        '#000000',
          'dbg-elev':   '#1C1C1E',
          'dbg-tert':   '#2C2C2E',
          'dsurface':   '#1C1C1E',
          'dfill-1':    'rgba(118, 118, 128, 0.24)',
          'dfill-2':    'rgba(118, 118, 128, 0.18)',
          'dfill-3':    'rgba(118, 118, 128, 0.12)',
          'dseparator': 'rgba(84, 84, 88, 0.45)',
          'dlabel':     '#FFFFFF',
          'dlabel-2':   'rgba(235, 235, 245, 0.60)',
          'dlabel-3':   'rgba(235, 235, 245, 0.30)',
          'dlabel-4':   'rgba(235, 235, 245, 0.18)',
        },
        // iOS system colors
        sys: {
          blue:   '#007AFF',
          indigo: '#5E5CE6',
          purple: '#AF52DE',
          pink:   '#FF2D55',
          red:    '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green:  '#34C759',
          mint:   '#00C7BE',
          teal:   '#30B0C7',
          cyan:   '#32ADE6',
          brown:  '#A2845E',
          gray:   '#8E8E93',
        },
        primary: {
          DEFAULT: '#5E6AD2',
          hover:   '#4B55B8',
          light:   '#EEF0FD',
        },
      },
      borderRadius: {
        'ios-sm':  '8px',
        'ios':     '12px',
        'ios-md':  '16px',
        'ios-lg':  '20px',
        'ios-xl':  '24px',
        'ios-2xl': '28px',
      },
      boxShadow: {
        // Layered iOS-style elevation
        'ios-1':   '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)',
        'ios-2':   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)',
        'ios-3':   '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)',
        'ios-4':   '0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
        'ios-5':   '0 24px 64px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.08)',
        'tint-glow':  '0 8px 24px rgba(94,106,210,0.28), 0 2px 6px rgba(94,106,210,0.18)',
        'tint-ring':  '0 0 0 4px rgba(94,106,210,0.18)',
        'inner-hairline': 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
        'inner-hairline-dark': 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
        // Card press feedback
        'card-rest':  '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)',
      },
      backdropBlur: {
        'ios': '20px',
        'ios-xl': '40px',
      },
      animation: {
        'shimmer':      'shimmer 3.5s ease-in-out infinite',
        'pulse-soft':   'pulseSoft 2.4s ease-in-out infinite',
        'fade-up':      'fadeUp 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in':     'scaleIn 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up':     'slideUp 320ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
