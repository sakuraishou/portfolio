import { getPayload } from 'payload'
import config from '@/payload.config'
import Title from '@/components/UI/Title'
import { sortProjects } from '@/lib/projects'
import SkillListItem, { type RelatedWork } from './SkillListItem'
import styles from './Skills.module.scss'
import type { Media, Project, Skill } from '@/payload-types'

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

/** Projects の skills relationship を逆引きし、skillId → 実績リストの Map を作る */
function buildRelatedWorksMap(projects: Project[]): Map<number, RelatedWork[]> {
  const map = new Map<number, RelatedWork[]>()
  for (const project of sortProjects(projects)) {
    for (const ref of project.skills ?? []) {
      const skillId = typeof ref === 'object' && ref !== null ? ref.id : ref
      const list = map.get(skillId) ?? []
      list.push({ id: project.id, title: project.title })
      map.set(skillId, list)
    }
  }
  return map
}

function SkillItem({ skill, relatedWorks }: { skill: Skill; relatedWorks: RelatedWork[] }) {
  const iconUrl = getMediaUrl(skill.icon)
  const isStudying = Boolean(skill.studying)
  const isFeatured = Boolean(skill.featured)

  return (
    <SkillListItem
      iconUrl={iconUrl}
      isStudying={isStudying}
      isFeatured={isFeatured}
      name={skill.name}
      description={skill.description}
      relatedWorks={relatedWorks}
    />
  )
}

export default async function Skills() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [{ docs: categories }, { docs: skills }, { docs: projects }] = await Promise.all([
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
    payload.find({
      collection: 'projects',
      depth: 0,
      limit: 100,
      sort: 'sort_order',
    }),
  ])

  const relatedWorksMap = buildRelatedWorksMap(projects)

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
        <Title en="SKILLS" no="02" className={styles.skillsTitle}>
          できること
        </Title>
        {hasAnySkills ? (
          <div className={styles.skillsGroup}>
            {categoryBlocks.map((block) => (
              <div key={block.categoryId} className={styles.categoryBlock}>
                <h3 className={styles.categoryTitle} data-reveal>
                  {block.categoryName.toUpperCase()}
                  <span className={styles.categoryCount}>
                    {String(block.skills.length).padStart(2, '0')}
                  </span>
                </h3>
                <ul className={styles.skillsList}>
                  {block.skills.map((skill) => (
                    <SkillItem
                      key={skill.id}
                      skill={skill}
                      relatedWorks={relatedWorksMap.get(skill.id) ?? []}
                    />
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
