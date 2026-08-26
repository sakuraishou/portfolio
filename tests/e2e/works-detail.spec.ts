import { test, expect } from '@playwright/test'

/**
 * WORKS 一覧 → 詳細 → 一覧へ戻る、の回遊導線。
 * 特定の案件データに依存しないよう、一覧の先頭カードを起点にする。
 */
test.describe('WORKS 詳細', () => {
  test('一覧の先頭カードから詳細を開き、一覧へ戻れる', async ({ page }) => {
    await page.goto('/')

    const firstCard = page.locator('#works a[href^="/works/"]').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 詳細ページ: タイトルとケーススタディの章が表示される
    await expect(page).toHaveURL(/\/works\/\d+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const sections = page.getByRole('heading', { level: 2 })
    await expect
      .poll(async () => sections.count(), { message: 'ケーススタディの章が表示されていない' })
      .toBeGreaterThan(0)

    // 戻る導線
    await page.getByRole('link', { name: /WORKS \/ 実績一覧へ/ }).click()
    await expect(page).toHaveURL(/\/#works$/)
  })

  test('存在しない実績IDは404を返す', async ({ page }) => {
    const response = await page.goto('/works/999999')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'ページが見つかりません' })).toBeVisible()
  })
})
