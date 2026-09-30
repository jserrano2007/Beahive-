import { getNow } from '../utils/hours'
import { addDays, toDateStr } from '../utils/dates'

// Demo community content. Everything here is marked `demo: true` so
// resetDemoData can replace it without touching what the user wrote.

const DEMO_AUTHORS = {
  knox: { authorId: 'demo-knox-dana', authorName: 'Dana W.', authorHood: 'north-end', authorOrg: 'KNOX' },
  levo: {
    authorId: 'demo-levo-marcus',
    authorName: 'Marcus T.',
    authorHood: 'downtown',
    authorOrg: 'Levo International',
  },
  uconn: {
    authorId: 'demo-uconn-priya',
    authorName: 'Priya S.',
    authorHood: 'west-end',
    authorOrg: 'UConn Extension',
  },
  keisha: { authorId: 'demo-user-keisha', authorName: 'Keisha B.', authorHood: 'frog-hollow', authorOrg: null },
  luis: { authorId: 'demo-user-luis', authorName: 'Luis M.', authorHood: 'south-end', authorOrg: null },
  ann: { authorId: 'demo-user-ann', authorName: 'Ann P.', authorHood: 'blue-hills', authorOrg: null },
  tom: { authorId: 'demo-user-tom', authorName: 'Tom H.', authorHood: 'parkville', authorOrg: null },
  rosa: { authorId: 'demo-user-rosa', authorName: 'Rosa G.', authorHood: 'barry-square', authorOrg: null },
  jae: { authorId: 'demo-user-jae', authorName: 'Jae K.', authorHood: 'asylum-hill', authorOrg: null },
  omar: { authorId: 'demo-user-omar', authorName: 'Omar F.', authorHood: 'upper-albany', authorOrg: null },
  spam: { authorId: 'demo-user-spam', authorName: 'GrowFast Deals', authorHood: null, authorOrg: null },
}

function hoursAgo(hours) {
  return new Date(getNow().getTime() - hours * 60 * 60 * 1000).toISOString()
}

function daysAgoStr(days) {
  return toDateStr(addDays(getNow(), -days))
}

function answer(id, author, hours, body, extra = {}) {
  return {
    id: `demo-answer-${id}`,
    ...DEMO_AUTHORS[author],
    body,
    createdAt: hoursAgo(hours),
    baseScore: 0,
    votes: {},
    reportedBy: [],
    demo: true,
    ...extra,
  }
}

function hydroStat(avg, spread, range, daysOutOfRange, daysTracked) {
  return {
    avg,
    min: Math.round((avg - spread) * 100) / 100,
    max: Math.round((avg + spread) * 100) / 100,
    range,
    daysOutOfRange,
    daysTracked,
  }
}

export function buildDemoPosts() {
  const posts = [
    {
      id: 'lettuce-tips',
      author: 'keisha',
      hours: 20,
      title: 'Brown, crispy tips on my hydro lettuce',
      body:
        "Butterhead in a 5-gallon DWC bucket under a shop light, about 3 weeks in. The newest leaves are getting brown, crispy edges. Roots look white. I attached my Grow Report — pH has been creeping up and I haven't been adjusting it much. Is this a nutrient thing?",
      cropId: 'lettuce',
      method: 'Hydroponic',
      topic: 'Nutrients',
      baseScore: 14,
      report: {
        cropId: 'lettuce',
        method: 'Hydroponic',
        neighborhoodKey: null,
        datePlanted: daysAgoStr(22),
        finishedAt: null,
        daysToFirstHarvest: null,
        harvestCount: 0,
        yield: [],
        averageQuality: null,
        problems: { pests: 0, yellowing: 2 },
        notes: [],
        hydro: {
          ph: hydroStat(6.8, 0.35, [5.8, 6.2], 9, 12),
          ec: hydroStat(1.4, 0.2, [0.8, 1.2], 6, 12),
          waterTemp: hydroStat(23.2, 1.4, [18, 22], 8, 12),
        },
        soilMoisture: null,
        waterings: null,
        weather: null,
      },
      accepted: 'lettuce-tips-1',
      answers: [
        answer(
          'lettuce-tips-1',
          'levo',
          18,
          "That's classic tip burn. Your report tells the story: pH averaging 6.8 with warm water (23°C) means the plant can't pull enough calcium into the fast-growing new leaves. Bring pH down to 5.8–6.2 with pH Down in small doses, drop EC closer to 1.0, and get the water under 22°C — move the bucket off the floor near the heater and add an airstone if you don't have one. New growth should come in clean within a week; the burned tips won't recover, just trim them.",
          { baseScore: 11 },
        ),
        answer(
          'lettuce-tips-2',
          'luis',
          15,
          'Same thing happened to me last summer. A small clip fan blowing across the leaves helped a lot too — more airflow means more transpiration, which pulls calcium to the edges.',
          { baseScore: 4 },
        ),
        answer('lettuce-tips-3', 'jae', 9, 'Following — I think I have the same problem.', { baseScore: 0 }),
      ],
    },
    {
      id: 'tomato-ber',
      author: 'luis',
      hours: 60,
      title: 'Tomatoes have black, sunken bottoms',
      body:
        "First big Romas are turning black and leathery on the bottom end, before they're even ripe. Raised bed, full sun. I water when I remember, which has been... inconsistent with the heat. Is the whole plant sick?",
      cropId: 'tomatoes',
      method: 'Garden bed',
      topic: 'Watering',
      baseScore: 22,
      report: {
        cropId: 'tomatoes',
        method: 'Garden bed',
        neighborhoodKey: 'south-end',
        datePlanted: daysAgoStr(68),
        finishedAt: null,
        daysToFirstHarvest: null,
        harvestCount: 0,
        yield: [],
        averageQuality: null,
        problems: { pests: 1, yellowing: 0 },
        notes: [],
        hydro: null,
        soilMoisture: null,
        waterings: 9,
        weather: { daysTracked: 40, totalRain: 1.1, avgHigh: 88, avgLow: 67, frostNights: 0 },
      },
      accepted: 'tomato-ber-1',
      answers: [
        answer(
          'tomato-ber-1',
          'uconn',
          55,
          "That's blossom end rot, and the plant itself is fine. It's a calcium problem in the fruit, but it's almost always caused by uneven watering rather than a lack of calcium in the soil — your report shows 9 waterings over two hot, dry months. Water deeply 2–3 times a week, mulch with 2–3 inches of straw to hold moisture, and pick off the affected fruit so the plant puts energy into new ones. If it keeps happening, a soil test from the UConn Soil Nutrient Analysis Lab will tell you whether you actually need to add lime.",
          { baseScore: 17 },
        ),
        answer(
          'tomato-ber-2',
          'ann',
          40,
          "Romas are extra prone to it. I switched to a soaker hose on a timer and haven't seen it since.",
          { baseScore: 6 },
        ),
      ],
    },
    {
      id: 'garlic-when',
      author: 'ann',
      hours: 30,
      title: 'When should I plant garlic in Hartford?',
      body:
        "I want to try garlic for the first time. Some sites say fall, some say spring. What actually works here? Can I use garlic from the grocery store?",
      cropId: 'garlic',
      method: 'Garden bed',
      topic: 'Seeds',
      baseScore: 18,
      accepted: 'garlic-when-1',
      answers: [
        answer(
          'garlic-when-1',
          'uconn',
          28,
          "Plant in fall: mid-October to early November in Hartford, roughly 4–6 weeks before the ground freezes. Cloves 2 inches deep, pointy end up, 6 inches apart, then mulch with 4–6 inches of straw once the soil gets cold. You'll harvest in July when the lower third of the leaves have browned. Hardneck varieties do best in Connecticut. Grocery store garlic is often a softneck from a warmer climate and sometimes treated to stop sprouting, so buy seed garlic if you can.",
          { baseScore: 14 },
        ),
        answer(
          'garlic-when-2',
          'knox',
          24,
          'At our community gardens we usually plant around mid-October. Pull the straw back in early April so the shoots can come through.',
          { baseScore: 7 },
        ),
        answer(
          'garlic-when-3',
          'tom',
          12,
          'Spring-planted garlic works but you get small, single-clove bulbs. Fall is worth the wait.',
          { baseScore: 3 },
        ),
      ],
    },
    {
      id: 'collard-holes',
      author: 'rosa',
      hours: 44,
      title: 'Tiny holes all over my collard leaves',
      body:
        "My collards look like someone shot them with a BB gun — lots of little holes, and a few bigger ragged ones. I don't see bugs when I look. What's eating them and how do I stop it without spraying chemicals?",
      cropId: 'collards',
      method: 'Garden bed',
      topic: 'Pests',
      baseScore: 12,
      accepted: null,
      answers: [
        answer(
          'collard-holes-1',
          'knox',
          40,
          "Tiny shot holes are usually flea beetles — they jump away when you get close, which is why you don't see them. The bigger ragged holes are likely cabbage worms (green caterpillars, same color as the leaf veins). Check the undersides of leaves and hand-pick the worms. Floating row cover keeps both off. If the worms get ahead of you, Bt (Bacillus thuringiensis) is an organic spray that only affects caterpillars.",
          { baseScore: 9 },
        ),
        answer(
          'collard-holes-2',
          'jae',
          30,
          'Look for little white butterflies around your bed during the day — those are the cabbage worm moms.',
          { baseScore: 4 },
        ),
      ],
    },
    {
      id: 'basil-black',
      author: 'jae',
      hours: 16,
      title: 'Basil leaves turning black at the edges',
      body:
        'Container basil on my porch was perfect all summer. The last few days the leaves are getting black patches, starting at the edges. Did I overwater?',
      cropId: 'basil',
      method: 'Container',
      topic: 'Other',
      baseScore: 8,
      accepted: 'basil-black-1',
      answers: [
        answer(
          'basil-black-1',
          'uconn',
          14,
          "Probably cold, not water. Basil gets damaged below about 50°F, and we've had a few chilly nights. Bring the pot inside on cold nights or harvest it all now and make pesto — it won't recover much once nights stay cold.",
          { baseScore: 6 },
        ),
        answer(
          'basil-black-2',
          'omar',
          10,
          'Mine did the exact same thing last week. Moved it to a sunny kitchen window and the new leaves look fine.',
          { baseScore: 2 },
        ),
      ],
    },
    {
      id: 'strawberry-kratky',
      author: 'omar',
      hours: 90,
      title: 'What EC should I run for strawberries in a Kratky jar?',
      body:
        "Trying strawberries in a big mason jar, Kratky style (no pump). Lettuce worked great this way. What EC should I aim for? Plants look okay but no flowers yet.",
      cropId: 'strawberries',
      method: 'Hydroponic',
      topic: 'Hydroponics',
      baseScore: 6,
      accepted: null,
      answers: [
        answer(
          'strawberry-kratky-1',
          'levo',
          80,
          "Aim for EC around 1.0–1.5 and pH 5.5–6.2. Honest answer though: Kratky is hard for strawberries. They're long-lived, fruiting plants that drink a lot and need oxygen at the roots for months, so the air gap method that works for a 5-week lettuce struggles. A bucket with an airstone (DWC) or a small NFT channel will do much better. Also check your variety — day-neutral types like 'Albion' flower under grow lights; June-bearers need a cold period first.",
          { baseScore: 5 },
        ),
      ],
    },
    {
      id: 'pepper-no-fruit',
      author: 'tom',
      hours: 120,
      title: 'Pepper plants flowering but no fruit',
      body:
        "Two bell pepper plants in 5-gallon buckets. Tons of flowers, but they just drop off. Leaves look healthy. What am I doing wrong?",
      cropId: 'peppers',
      method: 'Container',
      topic: 'Harvest',
      baseScore: 10,
      accepted: 'pepper-no-fruit-1',
      answers: [
        answer(
          'pepper-no-fruit-1',
          'knox',
          110,
          "Blossom drop is almost always heat. Peppers drop flowers when days are above ~90°F or nights stay above ~75°F, and black buckets on a sunny porch get even hotter. Give them afternoon shade if you can, keep watering even, and they'll set fruit again once it cools off in late August. Go light on nitrogen fertilizer too — it pushes leaves over fruit.",
          { baseScore: 8 },
        ),
        answer(
          'pepper-no-fruit-2',
          'keisha',
          100,
          'You can also gently shake the plant or tap the flowers mid-morning to help pollination if there are not many bees around.',
          { baseScore: 3 },
        ),
      ],
    },
    {
      id: 'soil-safe',
      author: 'keisha',
      hours: 200,
      title: 'Is the soil in my backyard safe for vegetables?',
      body:
        "Old house in Frog Hollow. I've read that city soil can have lead in it. How do I find out if it's safe to grow food in the ground?",
      cropId: null,
      method: 'Garden bed',
      topic: 'Soil',
      baseScore: 25,
      accepted: 'soil-safe-1',
      answers: [
        answer(
          'soil-safe-1',
          'uconn',
          190,
          "Good question to ask first. Older homes often have lead paint chips in the soil near the foundation. Send a sample to the UConn Soil Nutrient Analysis Lab and ask for the lead screen along with the standard test — the results come with guidance. Until you know, grow in raised beds or containers filled with new soil, keep beds at least 10 feet from the house, wash produce well, and wear gloves.",
          { baseScore: 19 },
        ),
        answer(
          'soil-safe-2',
          'knox',
          170,
          'If you want to start this season without waiting, community garden plots use raised beds with clean soil. Reach out to KNOX about openings.',
          { baseScore: 9 },
        ),
        answer(
          'soil-safe-3',
          'spam',
          160,
          'Buy MIRACLE GROW-FAST soil, removes all toxins instantly!!! DM me for 50% off',
          // Two neighbors already reported this; one more hides it.
          { baseScore: -4, reportedBy: ['demo-user-luis', 'demo-user-ann'] },
        ),
      ],
    },
    {
      id: 'beans-when',
      author: 'ann',
      hours: 70,
      title: 'How do I know when bush beans are ready to pick?',
      body: 'First time growing bush beans. They have lots of pods now. How big should they get before I pick them?',
      cropId: 'bush-beans',
      method: 'Garden bed',
      topic: 'Harvest',
      baseScore: 9,
      accepted: 'beans-when-1',
      answers: [
        answer(
          'beans-when-1',
          'tom',
          65,
          "Pick when they're about as thick as a pencil and snap cleanly, before you can see the seeds bulging. Check every 2–3 days — the more you pick, the more they make.",
          { baseScore: 7 },
        ),
        answer(
          'beans-when-2',
          'rosa',
          50,
          'Hold the stem with one hand while you pull the pod with the other, or you can pull up the whole plant.',
          { baseScore: 3 },
        ),
      ],
    },
    {
      id: 'strawberry-spots',
      author: 'rosa',
      hours: 8,
      title: 'Purple spots on strawberry leaves',
      body:
        'My strawberry plants have small purple spots with gray centers on the older leaves. Berries look fine so far. Should I be worried?',
      cropId: 'strawberries',
      method: 'Garden bed',
      topic: 'Pests',
      baseScore: 3,
      accepted: null,
      answers: [
        answer(
          'strawberry-spots-1',
          'uconn',
          6,
          "Sounds like common leaf spot, a fungus. It rarely hurts the fruit. Remove the worst leaves, water at the base in the morning instead of overhead, and give the plants room for air to move. After harvest, mowing or trimming old foliage helps a lot.",
          { baseScore: 2 },
        ),
      ],
    },
  ]

  return posts.map(({ id, author, hours, accepted, answers, baseScore, report = null, ...rest }) => ({
    id: `demo-post-${id}`,
    ...DEMO_AUTHORS[author],
    ...rest,
    photo: null,
    report,
    createdAt: hoursAgo(hours),
    baseScore,
    votes: {},
    reportedBy: [],
    acceptedAnswerId: accepted ? `demo-answer-${accepted}` : null,
    answers,
    demo: true,
  }))
}

// ---- Demo shared harvest reports ----
// Same shape as rows written by shareReport in the store.

function sharedRow({ id, author, anonymous = false, crop, method, hood, planted, grown, yieldTotal, quality, metrics, notes = [] }) {
  const person = author ? DEMO_AUTHORS[author] : null
  const datePlanted = daysAgoStr(planted)
  const finishedAt = daysAgoStr(planted - grown)
  return {
    id: `demo-report-${id}`,
    plantingId: null,
    authorId: person?.authorId ?? `demo-anon-${id}`,
    authorName: anonymous ? null : person?.authorName ?? null,
    crop,
    method,
    hood,
    metrics: {
      datePlanted,
      finishedAt,
      firstHarvestDate: daysAgoStr(planted - metrics.daysToFirstHarvest),
      daysToFirstHarvest: metrics.daysToFirstHarvest,
      harvestCount: metrics.harvestCount,
      problems: metrics.problems,
      sensorMethod: metrics.hydro ? 'hydro' : null,
      hydro: metrics.hydro ?? undefined,
      waterings: metrics.waterings,
      weather: metrics.weather,
    },
    yield: yieldTotal,
    quality,
    notes,
    sharedAt: new Date(getNow().getTime() - (planted - grown) * 86400000).toISOString(),
    anonymous,
    demo: true,
  }
}

function lettuceHydro(ph, ec, waterTemp, outOfRange) {
  return {
    ph: hydroStat(ph, 0.15, [5.8, 6.2], outOfRange.ph, 40),
    ec: hydroStat(ec, 0.1, [0.8, 1.2], 0, 40),
    waterTemp: hydroStat(waterTemp, 1, [18, 22], outOfRange.waterTemp, 40),
  }
}

export function buildDemoSharedReports() {
  const lettuce = { crop: 'lettuce', method: 'Hydroponic', hood: null, planted: 90, grown: 50 }
  const tomato = { crop: 'tomatoes', method: 'Garden bed', planted: 150, grown: 110 }
  const basil = { crop: 'basil', method: 'Container', planted: 120, grown: 90 }
  const summerWeather = { daysTracked: 100, totalRain: 11.4, avgHigh: 82, avgLow: 63, frostNights: 0 }

  return [
    sharedRow({
      ...lettuce,
      id: 'lettuce-1',
      author: 'levo',
      yieldTotal: [{ unit: 'lb', amount: 3.2 }],
      quality: 5,
      metrics: { daysToFirstHarvest: 38, harvestCount: 4, problems: { pests: 0, yellowing: 0 }, hydro: lettuceHydro(5.9, 1.0, 19.8, { ph: 0, waterTemp: 0 }) },
      notes: ['Airstone running 24/7 made a big difference'],
    }),
    sharedRow({
      ...lettuce,
      id: 'lettuce-2',
      author: 'keisha',
      yieldTotal: [{ unit: 'lb', amount: 2.9 }],
      quality: 4,
      metrics: { daysToFirstHarvest: 41, harvestCount: 4, problems: { pests: 0, yellowing: 0 }, hydro: lettuceHydro(6.1, 1.1, 20.6, { ph: 2, waterTemp: 1 }) },
      notes: ['Kept the reservoir in the basement so it stayed cool'],
    }),
    sharedRow({
      ...lettuce,
      id: 'lettuce-3',
      author: 'omar',
      yieldTotal: [{ unit: 'lb', amount: 2.1 }],
      quality: 4,
      metrics: { daysToFirstHarvest: 44, harvestCount: 3, problems: { pests: 0, yellowing: 1 }, hydro: lettuceHydro(6.3, 0.9, 21.8, { ph: 14, waterTemp: 12 }) },
      notes: ['Check pH twice a week, not once'],
    }),
    sharedRow({
      ...lettuce,
      id: 'lettuce-4',
      author: 'jae',
      yieldTotal: [{ unit: 'oz', amount: 30 }],
      quality: 4,
      metrics: { daysToFirstHarvest: 45, harvestCount: 3, problems: { pests: 0, yellowing: 1 }, hydro: lettuceHydro(6.4, 1.0, 22.4, { ph: 22, waterTemp: 18 }) },
    }),
    sharedRow({
      ...lettuce,
      id: 'lettuce-5',
      author: 'luis',
      yieldTotal: [{ unit: 'lb', amount: 1.6 }],
      quality: 3,
      metrics: { daysToFirstHarvest: 47, harvestCount: 3, problems: { pests: 0, yellowing: 2 }, hydro: lettuceHydro(6.6, 1.1, 23.1, { ph: 30, waterTemp: 26 }) },
      notes: ['Move the setup away from the sunny window in July'],
    }),
    sharedRow({
      ...lettuce,
      id: 'lettuce-6',
      anonymous: true,
      yieldTotal: [{ unit: 'lb', amount: 1.4 }],
      quality: 3,
      metrics: { daysToFirstHarvest: 49, harvestCount: 2, problems: { pests: 0, yellowing: 3 }, hydro: lettuceHydro(6.7, 1.2, 23.4, { ph: 33, waterTemp: 29 }) },
    }),

    sharedRow({
      ...tomato,
      id: 'tomato-1',
      author: 'knox',
      hood: 'north-end',
      yieldTotal: [{ unit: 'lb', amount: 18 }],
      quality: 5,
      metrics: { daysToFirstHarvest: 72, harvestCount: 14, problems: { pests: 1, yellowing: 1 }, waterings: 48, weather: summerWeather },
      notes: ['Straw mulch kept watering even through the heat'],
    }),
    sharedRow({
      ...tomato,
      id: 'tomato-2',
      author: 'tom',
      hood: 'parkville',
      yieldTotal: [{ unit: 'lb', amount: 11 }],
      quality: 4,
      metrics: { daysToFirstHarvest: 78, harvestCount: 10, problems: { pests: 4, yellowing: 2 }, waterings: 24, weather: summerWeather },
      notes: ['Hornworms in August — check leaves every few days'],
    }),
    sharedRow({
      ...tomato,
      id: 'tomato-3',
      anonymous: true,
      hood: 'south-end',
      yieldTotal: [{ unit: 'lb', amount: 9 }],
      quality: 3,
      metrics: { daysToFirstHarvest: 81, harvestCount: 8, problems: { pests: 3, yellowing: 3 }, waterings: 27, weather: summerWeather },
      notes: ['Blossom end rot on the first fruits'],
    }),

    sharedRow({
      ...basil,
      id: 'basil-1',
      author: 'rosa',
      hood: 'barry-square',
      yieldTotal: [{ unit: 'bunches', amount: 14 }],
      quality: 5,
      metrics: { daysToFirstHarvest: 34, harvestCount: 12, problems: { pests: 0, yellowing: 0 }, waterings: 70, weather: summerWeather },
      notes: ['Pinch the flowers off as soon as they show up'],
    }),
    sharedRow({
      ...basil,
      id: 'basil-2',
      author: 'ann',
      hood: 'blue-hills',
      yieldTotal: [{ unit: 'bunches', amount: 8 }],
      quality: 4,
      metrics: { daysToFirstHarvest: 40, harvestCount: 8, problems: { pests: 2, yellowing: 1 }, waterings: 45, weather: summerWeather },
    }),
    sharedRow({
      ...basil,
      id: 'basil-3',
      author: 'jae',
      hood: 'asylum-hill',
      yieldTotal: [{ unit: 'bunches', amount: 7 }],
      quality: 3,
      metrics: { daysToFirstHarvest: 42, harvestCount: 7, problems: { pests: 3, yellowing: 2 }, waterings: 50, weather: summerWeather },
      notes: ['Pot was too small — go bigger next year'],
    }),
  ]
}
