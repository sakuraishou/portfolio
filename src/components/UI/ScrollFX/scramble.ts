/**
 * ScrambleText（記号から本来の文字へ組み上がるデコード演出）で使う文字セット。
 * FirstView と ScrollFX で共用する。
 *
 * 英数字の値には半角の記号を、日本語を含む値には全角のカタカナを混ぜる。
 * 数字だけの値（カード番号・件数など）は数字以外の記号だけを使う。デコード途中に
 * 「06」「25」のような本物らしい数字が出て、実際の値と見間違えられないようにするため。
 * 文字幅をそろえておくと、デコード中に行の幅がガタつかない。
 */
const LATIN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-'
const KANA_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ０１２３４５６７８９'
/** 数字だけの値に混ぜる記号（数字を含めない） */
const DIGIT_CHARS = '#*/<>_-+='

/** 値の中身に合わせて、デコード中に混ぜる文字セットを選ぶ */
export function scrambleCharsFor(text: string): string {
  if (/^[\d\s]+$/.test(text)) return DIGIT_CHARS
  return /[^ -~]/.test(text) ? KANA_CHARS : LATIN_CHARS
}

/** 文字数に応じたデコード時間（短い値は素早く、長い値も間延びさせない） */
export function scrambleDuration(text: string): number {
  return Math.min(1.4, 0.45 + text.length * 0.03)
}
