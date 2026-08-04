import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Judul tab ditetapkan hardcode di app/(frontend)/page.tsx:142, jadi aman
    // diperiksa persis.
    await expect(page).toHaveTitle('ITSA - Information Technology Student Association')

    // Teks h1 SENGAJA tidak diperiksa persis. Isinya berasal dari global
    // SiteSettings (hero.judul) yang disunting lewat /admin — lihat
    // components/home/Hero.tsx:59 dan page.tsx:116 — sehingga memeriksa
    // teksnya membuat test ini patah begitu ada pengurus mengubah judul hero.
    // Yang diperiksa adalah hal yang stabil: h1-nya ada, terlihat, dan berisi.
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    await expect(heading).not.toBeEmpty()
  })
})
