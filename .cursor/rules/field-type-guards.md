---
title: フィールドタイプガード
description: ランタイムのフィールド型チェックと安全な型の絞り込み
tags: [payload, typescript, type-guards, fields]
---

# Payload フィールドタイプガード

ランタイムのフィールド型チェックと安全な型の絞り込みのためのタイプガードです。

## よく使うガード

### fieldAffectsData

**最もよく使うガード。** フィールドがデータを保持するか（名前を持ち、UI専用でないか）を確認します。

```typescript
import { fieldAffectsData } from 'payload'

function generateSchema(fields: Field[]) {
  fields.forEach((field) => {
    if (fieldAffectsData(field)) {
      // field.name に安全にアクセスできる
      schema[field.name] = getFieldType(field)
    }
  })
}

// データフィールドをフィルタリング
const dataFields = fields.filter(fieldAffectsData)
```

### fieldHasSubFields

フィールドがネストフィールドを持つか（group・array・row・collapsible）を確認します。

```typescript
import { fieldHasSubFields } from 'payload'

function traverseFields(fields: Field[]): void {
  fields.forEach((field) => {
    if (fieldHasSubFields(field)) {
      // field.fields に安全にアクセスできる
      traverseFields(field.fields)
    }
  })
}
```

### fieldIsArrayType

フィールド型が `'array'` かどうかを確認します。

```typescript
import { fieldIsArrayType } from 'payload'

if (fieldIsArrayType(field)) {
  // field.type === 'array'
  console.log(`最小行数: ${field.minRows}`)
  console.log(`最大行数: ${field.maxRows}`)
}
```

## 機能チェック用ガード

### fieldSupportsMany

フィールドが複数の値を持てるか（select・relationship・upload で `hasMany` を持つ）を確認します。

```typescript
import { fieldSupportsMany } from 'payload'

if (fieldSupportsMany(field)) {
  // field.type は 'select' | 'relationship' | 'upload'
  if (field.hasMany) {
    console.log('複数の値を受け付けるフィールドです')
  }
}
```

### fieldHasMaxDepth

フィールドが数値の `maxDepth` プロパティを持つ relationship/upload/join かどうかを確認します。

```typescript
import { fieldHasMaxDepth } from 'payload'

if (fieldHasMaxDepth(field)) {
  // field.type は 'upload' | 'relationship' | 'join'
  // かつ field.maxDepth は number
  const remainingDepth = field.maxDepth - currentDepth
}
```

### fieldIsVirtual

フィールドが仮想フィールド（計算値または仮想リレーション）かどうかを確認します。

```typescript
import { fieldIsVirtual } from 'payload'

if (fieldIsVirtual(field)) {
  // field.virtual が truthy
  if (typeof field.virtual === 'string') {
    console.log(`仮想パス: ${field.virtual}`)
  }
}
```

## 型チェック用ガード

### fieldIsBlockType

```typescript
import { fieldIsBlockType } from 'payload'

if (fieldIsBlockType(field)) {
  // field.type === 'blocks'
  field.blocks.forEach((block) => {
    console.log(`ブロック: ${block.slug}`)
  })
}
```

### fieldIsGroupType

```typescript
import { fieldIsGroupType } from 'payload'

if (fieldIsGroupType(field)) {
  // field.type === 'group'
  console.log(`インターフェース名: ${field.interfaceName}`)
}
```

### fieldIsPresentationalOnly

```typescript
import { fieldIsPresentationalOnly } from 'payload'

if (fieldIsPresentationalOnly(field)) {
  // field.type === 'ui'
  // データ操作・GraphQL スキーマなどでスキップする
  return
}
```

## よく使うパターン

### フィールドの再帰探索

```typescript
import { fieldAffectsData, fieldHasSubFields } from 'payload'

function traverseFields(fields: Field[], callback: (field: Field) => void) {
  fields.forEach((field) => {
    if (fieldAffectsData(field)) {
      callback(field)
    }

    if (fieldHasSubFields(field)) {
      traverseFields(field.fields, callback)
    }
  })
}
```

### データを持つフィールドのフィルタリング

```typescript
import { fieldAffectsData, fieldIsPresentationalOnly, fieldIsHiddenOrDisabled } from 'payload'

const dataFields = fields.filter(
  (field) =>
    fieldAffectsData(field) && !fieldIsPresentationalOnly(field) && !fieldIsHiddenOrDisabled(field),
)
```

### コンテナ型の分岐処理

```typescript
import { fieldIsArrayType, fieldIsBlockType, fieldHasSubFields } from 'payload'

if (fieldIsArrayType(field)) {
  // 配列固有の処理
} else if (fieldIsBlockType(field)) {
  // ブロック固有の処理
} else if (fieldHasSubFields(field)) {
  // group/row/collapsible の処理
}
```

### 安全なプロパティアクセス

```typescript
import { fieldSupportsMany, fieldHasMaxDepth } from 'payload'

// ガード付き - 安全にアクセスできる
if (fieldSupportsMany(field) && field.hasMany) {
  console.log('複数値をサポートしています')
}

if (fieldHasMaxDepth(field)) {
  const depth = field.maxDepth // TypeScript がこれを number と認識する
}
```

## 利用可能なガード一覧

| タイプガード | チェック内容 | 使いどき |
| --- | --- | --- |
| `fieldAffectsData` | フィールドがデータを持つ（名前あり） | フィールドのデータや名前にアクセスする時 |
| `fieldHasSubFields` | フィールドがネストフィールドを持つ | フィールドを再帰的に探索する時 |
| `fieldIsArrayType` | フィールドが配列型 | 配列と他のコンテナを区別する時 |
| `fieldIsBlockType` | フィールドがブロック型 | ブロック固有の処理をする時 |
| `fieldIsGroupType` | フィールドがグループ型 | グループ固有の処理をする時 |
| `fieldSupportsMany` | フィールドが複数値を持てる | `hasMany` のサポートを確認する時 |
| `fieldHasMaxDepth` | フィールドが深さ制御をサポート | relationship/upload/join の深さを制御する時 |
| `fieldIsPresentationalOnly` | フィールドが UI 専用 | データ操作から除外する時 |
| `fieldIsSidebar` | フィールドがサイドバーに配置 | サイドバーのレンダリングを分ける時 |
| `fieldIsID` | フィールド名が 'id' | ID フィールドの特別処理をする時 |
| `fieldIsHiddenOrDisabled` | フィールドが非表示または無効 | UI 操作からフィルタリングする時 |
| `fieldShouldBeLocalized` | フィールドがローカライズを必要とする | ロケールテーブルのチェックをする時 |
| `fieldIsVirtual` | フィールドが仮想フィールド | データベース変換でスキップする時 |
| `tabHasName` | タブに名前がある（データを持つ） | 名前あり・なしのタブを区別する時 |
| `groupHasName` | グループに名前がある（データを持つ） | 名前あり・なしのグループを区別する時 |
| `optionIsObject` | オプションが `{label, value}` 形式 | オプションのプロパティに安全にアクセスする時 |
| `optionsAreObjects` | 全オプションがオブジェクト形式 | オプションをまとめて処理する時 |
| `optionIsValue` | オプションが文字列値 | 文字列オプションを処理する時 |
| `valueIsValueWithRelation` | 値がポリモーフィックリレーション | ポリモーフィックリレーションを処理する時 |
