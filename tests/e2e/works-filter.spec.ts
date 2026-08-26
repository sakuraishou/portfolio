import { test, expect } from '@playwright/test'

/**
 * WORKS 一覧の絞り込みタブ。
 * クリックはページ遷移せず data-filter + CSS で切り替える（白フラッシュ防止）。
 * URL は replaceState で同期し、?type= 直リンクはサーバー側で初期絞り込みされる。
 */
test.describe('WORKS 絞り込み', () => {
  test('SITE WORK で絞り込み、ALL で全件へ戻れる', async ({ page }) => {
    await page.goto('/')

    const visibleCards = page.locator('#works li[data-reveal]:visible')
    const initial = await visibleCards.count()
    expect(initial).toBeGreaterThan(0)

    const filterNav = page.getByRole('navigation', { name: '実績の絞り込み' })
    await filterNav.getByRole('link', { name: /SITE WORK/ }).click()

    // 遷移せず即座に絞り込まれ、URL も同期される
    await expect(page).toHaveURL(/type=site-work/)
    await expect.poll(async () => visibleCards.count()).toBeLessThan(initial)
    const labels = await page
      .locator('#works li[data-reveal]:visible [class*="cardTag"]')
      .allTextContents()
    expect(labels.length).toBeGreaterThan(0)
    expect(labels.every((l) => l === 'SITE WORK')).toBe(true)

    await filterNav.getByRole('link', { name: /^ALL/ }).click()
    await expect.poll(async () => visibleCards.count()).toBe(initial)
  })

  test('?type= 直リンクはサーバー側で絞り込まれて表示される', async ({ page }) => {
    await page.goto('/?type=case-study#works')
    const labels = await page
      .locator('#works li[data-reveal]:visible [class*="cardTag"]')
      .allTextContents()
    expect(labels.length).toBeGreaterThan(0)
    expect(labels.every((l) => l === 'CASE STUDY')).toBe(true)
  })

  test('不正な type は全件表示にフォールバックする', async ({ page }) => {
    await page.goto('/?type=unknown#works')
    const count = await page.locator('#works li[data-reveal]:visible').count()
    expect(count).toBeGreaterThan(10)
  })
})
