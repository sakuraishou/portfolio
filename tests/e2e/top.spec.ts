import { test, expect } from '@playwright/test'

/**
 * トップページの主要導線。
 * CMS のデータ件数に依存しないよう、「1件以上ある」ことだけを確認する。
 */
test.describe('トップページ', () => {
  test('ファーストビューと各セクションが表示される', async ({ page }) => {
    await page.goto('/')

    // ファーストビュー（h1 とスペック表）
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Code With')
    await expect(page.getByText('Web / Product Engineer')).toBeVisible()
    await expect(page.getByText('Open to Work').first()).toBeVisible()

    // 主要セクションのアンカーが存在する
    for (const id of ['about', 'skills', 'works', 'contact']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
  })

  test('Skills と WORKS にコンテンツが1件以上表示される', async ({ page }) => {
    await page.goto('/')

    // Skills: スキル行が1件以上
    const skillItems = page.locator('#skills li')
    await expect
      .poll(async () => skillItems.count(), { message: 'スキルが1件も表示されていない' })
      .toBeGreaterThan(0)

    // WORKS: 詳細ページへのカードリンクが1件以上
    const workLinks = page.locator('#works a[href^="/works/"]')
    await expect
      .poll(async () => workLinks.count(), { message: 'WORKS カードが1件も表示されていない' })
      .toBeGreaterThan(0)
  })
})
