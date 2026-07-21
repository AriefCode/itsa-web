/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              // Prose mewarisi warna teks section-nya, jadi blok rich text
              // otomatis benar baik di atas cream (teks forest) maupun di
              // atas hijau (teks cream). Lihat DESIGN.md §2 & §6.
              '--tw-prose-body': 'inherit',
              '--tw-prose-headings': 'inherit',
              '--tw-prose-bold': 'inherit',
              '--tw-prose-quotes': 'inherit',
              '--tw-prose-lead': 'inherit',
              '--tw-prose-counters': 'inherit',
              '--tw-prose-bullets': 'currentColor',
              '--tw-prose-hr': 'currentColor',
              '--tw-prose-quote-borders': 'var(--color-gold)',
              '--tw-prose-links': 'inherit',
              maxWidth: '75ch', // lebar baca 65–75 karakter (DESIGN.md §3)
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
