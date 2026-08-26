import { test, expect } from '@playwright/test'

/**
 * 取扱説明書ページ（/manual）と About からの導線。
 */
test.describe('取扱説明書', () => {
  test('About の CTA から /manual へ移動できる', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /わたしの取扱説明書を見る/ }).click()
    await expect(page).toHaveURL(/\/manual$/)
  })

  test('/manual が直接開ける', async ({ page }) => {
    const response = await page.goto('/manual')
    expect(response?.status()).toBe(200)
    // GSAP 演出があるため、見出しの存在（DOM にあること）だけを確認する
    await expect
      .poll(async () => page.getByRole('heading').count(), {
        message: '見出しが1つも描画されていない',
      })
      .toBeGreaterThan(0)
  })
})
