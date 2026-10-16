/**
 * トップの初回ローディング（ブートシーケンス）の共有定義。
 * layout.tsx（インラインスクリプト）・BootSequence・FirstView から使う。
 *
 * 流れ:
 *  1. layout.tsx の <head> で BOOT_SCRIPT が描画前に走り、出す条件を満たすときだけ
 *     <html data-boot="play"> を付ける（CSS はこの属性があるときだけオーバーレイを表示）
 *  2. BootSequence がマウントされたら data-boot="run" に切り替えて演出を再生
 *     （"run" になると CSS の保険アニメーションと、インラインの保険タイマーが止まる）
 *  3. パネルが割れ始めたら releaseBoot() → FirstView の起動シーケンスが始まる
 *  4. 演出が終わったら data-boot を外す（スクロールロック解除）
 */

/** <html> に付ける属性名。値は "play"（描画前に付与）→ "run"（JS が引き継いだ） */
export const BOOT_ATTR = 'data-boot'
/** インラインスクリプトが属性を付けた時刻（performance.now()） */
export const BOOT_AT_ATTR = 'data-boot-at'
/**
 * 演出を流す環境（reduced-motion でない）の印。描画前に <html> へ付ける（ローディングの有無と無関係）。
 * FirstView はこの印があるときだけ、JS が引き継ぐまで演出対象を CSS で隠す（SSR の完成形のチラ見え防止）
 */
export const FX_ATTR = 'data-fx'
/** FirstView 側の「JS が初期状態を当てた」印（section に付ける。CSS の先行非表示を解除する） */
export const FX_READY_ATTR = 'data-fx-ready'
/** FirstView に「もう始めてよい」を知らせるイベント */
export const BOOT_DONE_EVENT = 'boot:done'
/** 再生済みの記録（同じタブのセッション中は 1 回だけ） */
export const BOOT_STORAGE_KEY = 'portfolio:boot:v1'
/**
 * 確認用: URL にこのパラメータがあれば（例 `/?boot`）、再生済み・ハッシュ・自動操作に関係なく毎回出す。
 * reduced-motion とトップ以外の判定はそのまま（演出自体が止まるため）。再生済みの記録も付けない
 */
export const BOOT_PREVIEW_PARAM = 'boot'
/** JS が来ないとき、インラインの保険タイマーが属性を外すまでの時間（CSS の保険と揃える） */
export const BOOT_FAILSAFE_MS = 4500
/** FirstView が待つ上限（イベントを取りこぼしても固まらないように） */
const BOOT_WAIT_MAX_MS = 6000

/**
 * 描画前に走らせるインラインスクリプト。
 * reduced-motion でなければ、まず <html data-fx> を付ける（FirstView の先行非表示用。全ページ共通）。
 * ローディングを出さない条件: トップ以外 / URL にハッシュあり / reduced-motion / 自動操作（E2E・撮影ツール）/
 * 再生済み / sessionStorage が使えない（例外は握りつぶして「出さない」側に倒す）
 * ただし `?boot` 付きのときは、トップ以外と reduced-motion 以外の条件を無視して毎回出す（確認用）
 */
export const BOOT_SCRIPT = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('${FX_ATTR}','');if(location.pathname!=='/')return;var f=new URLSearchParams(location.search).has('${BOOT_PREVIEW_PARAM}');if(!f){if(location.hash||navigator.webdriver)return;var s=window.sessionStorage;if(s.getItem('${BOOT_STORAGE_KEY}'))return;s.setItem('${BOOT_STORAGE_KEY}','1')}d.setAttribute('${BOOT_ATTR}','play');d.setAttribute('${BOOT_AT_ATTR}',String(Math.round(performance.now())));setTimeout(function(){if(d.getAttribute('${BOOT_ATTR}')==='play'){d.removeAttribute('${BOOT_ATTR}');window.dispatchEvent(new Event('${BOOT_DONE_EVENT}'))}},${BOOT_FAILSAFE_MS})}catch(e){}})()`

let released = false

/** ローディングが表示中（または JS が引き継いで再生中）か */
export function isBootActive(): boolean {
  return !released && document.documentElement.hasAttribute(BOOT_ATTR)
}

/** FirstView の演出を解放する（パネルが割れ始めた瞬間に呼ぶ） */
export function releaseBoot(): void {
  if (released) return
  released = true
  window.dispatchEvent(new Event(BOOT_DONE_EVENT))
}

/** ローディングが抜けるまで待つ。ローディングが無いときは即座に解決する */
export function waitForBoot(): Promise<void> {
  if (!isBootActive()) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener(BOOT_DONE_EVENT, done)
      window.clearTimeout(timer)
      resolve()
    }
    const timer = window.setTimeout(done, BOOT_WAIT_MAX_MS)
    window.addEventListener(BOOT_DONE_EVENT, done)
  })
}
