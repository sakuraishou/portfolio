import { getPayload } from 'payload'
import config from '@/payload.config'
import Title from '@/components/UI/Title'
import SkillListItem from './SkillListItem'
import styles from './Skills.module.scss'
import type { Media, Skill } from '@/payload-types'

function getMediaUrl(icon: number | Media): string | null {
  if (typeof icon === 'object' && icon?.url) {
    return icon.url
  }
  return null
}

function getCategoryId(category: Skill['category']): number | null {
  if (!category || typeof category === 'number') return category ?? null
  return category.id
}

function sortByOrder<T extends { sort_order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const orderA = a.sort_order ?? 999
    const orderB = b.sort_order ?? 999
    return orderA - orderB
  })
}

type CategoryWithSkills = { categoryId: number | 'none'; categoryName: string; skills: Skill[] }

function SkillItem({ skill }: { skill: Skill }) {
  const iconUrl = getMediaUrl(skill.icon)
  const isStudying = Boolean(skill.studying)
  const iconAlt =
    typeof skill.icon === 'object' ? (skill.icon.alt ?? skill.name) : skill.name

  return (
    <SkillListItem
      iconUrl={iconUrl}
      iconAlt={iconAlt}
      isStudying={isStudying}
      name={skill.name}
      description={skill.description}
    />
  )
}

export default async function Skills() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [{ docs: categories }, { docs: skills }] = await Promise.all([
    payload.find({
      collection: 'skill-categories',
      sort: 'sort_order',
      limit: 100,
    }),
    payload.find({
      collection: 'skills',
      depth: 1,
      limit: 100,
    }),
  ])

  const sortedCategories = sortByOrder(categories)
  const sortedSkills = sortByOrder(skills)

  const skillsByCategory = new Map<number | 'none', Skill[]>()
  for (const category of sortedCategories) {
    skillsByCategory.set(category.id, [])
  }
  skillsByCategory.set('none', [])

  for (const skill of sortedSkills) {
    const catId = getCategoryId(skill.category)
    const key = catId ?? 'none'
    skillsByCategory.get(key)!.push(skill)
  }

  const categoryBlocks: CategoryWithSkills[] = []

  for (const category of sortedCategories) {
    const catSkills = skillsByCategory.get(category.id) ?? []
    if (catSkills.length > 0) {
      categoryBlocks.push({
        categoryId: category.id,
        categoryName: category.name,
        skills: catSkills,
      })
    }
  }

  const uncategorized = skillsByCategory.get('none') ?? []
  if (uncategorized.length > 0) {
    categoryBlocks.push({
      categoryId: 'none',
      categoryName: 'その他',
      skills: uncategorized,
    })
  }

  const hasAnySkills = skills.length > 0

  return (
    <section id="skills" className={styles.skills}>
      <div className="wrap">
        <Title en="SKILLS" className={styles.skillsTitle}>
          できること
        </Title>
        {hasAnySkills ? (
          <div className={styles.skillsGroup}>
            {categoryBlocks.map((block) => (
              <div key={block.categoryId} className={styles.categoryBlock}>
                <h3 className={styles.categoryTitle}>{block.categoryName.toUpperCase()}</h3>
                <ul className={styles.skillsList}>
                  {block.skills.map((skill) => (
                    <SkillItem key={skill.id} skill={skill} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>スキルが登録されていません</p>
        )}
      </div>
    </section>
  )
}
