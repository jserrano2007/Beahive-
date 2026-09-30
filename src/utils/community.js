import { CROPS } from './crops'

export const TOPICS = ['Pests', 'Watering', 'Nutrients', 'Soil', 'Hydroponics', 'Seeds', 'Harvest', 'Other']
export const SORTS = ['top', 'new', 'unanswered']

// Community posts can be about crops the planting tracker doesn't cover yet.
export const COMMUNITY_CROP_IDS = [...CROPS.map((crop) => crop.id), 'garlic', 'collards']

// Demo accounts from these partners get the "Local expert" badge.
export const TRUSTED_ORGS = ['KNOX', 'Levo International', 'UConn Extension']

// An item disappears for everyone once this many people report it.
export const REPORT_HIDE_THRESHOLD = 3

export const EMPTY_DRAFT = {
  title: '',
  body: '',
  cropId: '',
  method: '',
  topic: TOPICS[0],
  photo: null,
  plantingId: '',
}

// A new question that starts from a planting's Grow Report.
export function draftForPlanting(planting) {
  return {
    ...EMPTY_DRAFT,
    cropId: planting.cropId,
    method: planting.method,
    topic: planting.method === 'Hydroponic' ? 'Hydroponics' : TOPICS[0],
    plantingId: planting.id,
  }
}

export function isTrusted(item) {
  return TRUSTED_ORGS.includes(item.authorOrg)
}

export function isHidden(item) {
  return (item.reportedBy ?? []).length >= REPORT_HIDE_THRESHOLD
}

// Demo items carry a base score standing in for votes from other people.
export function itemScore(item) {
  return (item.baseScore ?? 0) + Object.values(item.votes ?? {}).reduce((sum, value) => sum + value, 0)
}

export function visibleAnswers(post) {
  return (post.answers ?? []).filter((answer) => !isHidden(answer))
}

export function isAnswered(post) {
  return Boolean(post.acceptedAnswerId) && visibleAnswers(post).some((a) => a.id === post.acceptedAnswerId)
}

// Accepted answer pinned first, then by score, then oldest first.
export function sortAnswers(post) {
  return [...visibleAnswers(post)].sort((a, b) => {
    if (a.id === post.acceptedAnswerId) return -1
    if (b.id === post.acceptedAnswerId) return 1
    return itemScore(b) - itemScore(a) || (a.createdAt < b.createdAt ? -1 : 1)
  })
}

const byNewest = (a, b) => (a.createdAt < b.createdAt ? 1 : -1)

export function sortPosts(posts, sort) {
  if (sort === 'new') return [...posts].sort(byNewest)
  if (sort === 'unanswered') return posts.filter((post) => !isAnswered(post)).sort(byNewest)
  return [...posts].sort((a, b) => itemScore(b) - itemScore(a) || byNewest(a, b))
}

// ---- Text matching ----

const STOPWORDS = new Set(
  (
    'the a an and or but of to in on at for with my is are was were be been it its this that these those ' +
    'i im me we you your do does did how what when why where which who can should could would will ' +
    'have has had not no any some from about into after before just so very too get got them they their ' +
    'el la los las un una y o de del en con por para mi mis es son que como cuando mis tengo'
  ).split(' '),
)

// Words nearly every gardening question uses; they say nothing about the problem.
const GENERIC_WORDS = new Set(['plant', 'leave', 'leaf', 'grow', 'growing', 'garden', 'hoja', 'planta'])

export function tokenize(text) {
  return (text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    // Crude plural folding so "tips" matches "tip".
    .map((word) => (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word))
    .filter((word) => !GENERIC_WORDS.has(word))
}

function postText(post) {
  return [post.title, post.body, ...(post.answers ?? []).map((answer) => answer.body)].join(' ')
}

export function matchesSearch(post, query, cropLabel) {
  const words = tokenize(query)
  if (words.length === 0) return true
  const haystack = new Set(tokenize(`${postText(post)} ${cropLabel ?? ''} ${post.topic ?? ''}`))
  return words.every((word) => haystack.has(word))
}

// Up to `limit` answered posts sharing the most words with a draft question.
// Title words count double; a matching crop adds a little.
export function findSimilarPosts(posts, { title, cropId }, limit = 3) {
  const draftWords = new Set(tokenize(title))
  if (draftWords.size === 0) return []
  return posts
    .filter((post) => !isHidden(post) && visibleAnswers(post).length > 0)
    .map((post) => {
      const titleWords = new Set(tokenize(post.title))
      const bodyWords = new Set(tokenize(postText(post)))
      let score = 0
      draftWords.forEach((word) => {
        if (titleWords.has(word)) score += 2
        else if (bodyWords.has(word)) score += 1
      })
      if (score > 0 && cropId && post.cropId === cropId) score += 1
      return { post, score }
    })
    .filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score || Number(isAnswered(b.post)) - Number(isAnswered(a.post)))
    .slice(0, limit)
    .map(({ post }) => post)
}
