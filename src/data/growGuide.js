// Growing methods, ordered by id. The UI is purely presentational — new
// methods can be added here and will show up automatically as long as they
// appear in the recommend() function below.

export const SPACE_OPTIONS = [
  {
    key: 'windowsill',
    label: 'A windowsill or countertop',
    hint: 'Apartment, no outdoor space',
  },
  {
    key: 'balcony',
    label: 'A balcony or small porch',
    hint: 'Some outdoor space you can put pots on',
  },
  {
    key: 'yard',
    label: 'A yard or lot with dirt',
    hint: 'Ground you can dig into',
  },
  {
    key: 'bed',
    label: 'A raised bed or big planters',
    hint: 'You already have a spot to plant into',
  },
]

export const LIGHT_OPTIONS = [
  { key: 'low', label: 'Not much sun', hint: 'Mostly shade or north-facing' },
  { key: 'bright', label: 'A bright window', hint: 'Some direct sun most days' },
  { key: 'lots', label: 'Lots of sun', hint: '6+ hours of direct sun' },
]

// Cost, effort and time estimates are Hartford, CT starting numbers.
export const METHODS = [
  {
    id: 'kratky',
    name: 'Kratky jar',
    tag: 'Hydroponic · no pump',
    blurb:
      'Grow salad greens in a jar of water. No pump, no electricity, no soil. Sit it on a windowsill and forget about it.',
    cost: '$20–40',
    effort: 'Very low',
    timeToHarvest: '4–6 weeks',
    needs: [
      'A wide-mouth jar or small tub (a clean mayo jar works)',
      'A net cup that fits the jar mouth',
      'Rockwool cube or clay pebbles to hold the seedling',
      'Hydroponic nutrients (small bottle from a garden store)',
      'Seeds (lettuce or basil are easiest)',
    ],
    steps: [
      'Fill the jar with clean water, leaving about an inch of air at the top.',
      'Mix in hydroponic nutrients following the label on the bottle.',
      'Put a seed in a wet rockwool cube (or a net cup of clay pebbles) and rest it in the jar so the bottom just touches the water.',
      'Set it on a sunny sill. The roots grow down; the leaves grow up.',
      'Don’t top the water off — that air gap keeps the roots alive without a pump.',
      'When the outer leaves are big enough to eat, snip them. The plant keeps going.',
    ],
    crops: ['lettuce', 'basil'],
    extraCrops: ['Kale', 'Mint'],
    featured: false,
  },
  {
    id: 'windowsill-herbs',
    name: 'Windowsill herbs in soil',
    tag: 'Soil · indoor',
    blurb:
      'A small pot of soil on a sunny windowsill. Cheapest way to grow fresh herbs indoors.',
    cost: '$10–20',
    effort: 'Low',
    timeToHarvest: '3–4 weeks',
    needs: [
      'A pot 4–6 inches wide with a drainage hole',
      'A saucer to catch water',
      'Potting mix (not garden dirt)',
      'Seedlings from a hardware store, or seeds',
    ],
    steps: [
      'Fill the pot with potting mix, leaving half an inch at the top.',
      'Poke a hole with your finger and drop in a seedling, or a few seeds.',
      'Water until it drips out the bottom, then let it drain.',
      'Set it on a sunny windowsill.',
      'Water again when the top of the soil feels dry — usually every 2–3 days.',
      'Snip leaves from the outside as you cook. Never take more than a third at once.',
    ],
    crops: ['basil'],
    extraCrops: ['Parsley', 'Cilantro', 'Mint'],
    featured: false,
  },
  {
    id: 'dwc',
    name: 'Deep water tub',
    tag: 'Hydroponic · small air pump',
    blurb:
      'A tote of water with an aquarium bubbler. Grows a whole tray of greens at once.',
    cost: '$40–80',
    effort: 'Low',
    timeToHarvest: '5–7 weeks',
    needs: [
      'A dark plastic tote with a lid (10–20 gallons)',
      'A small aquarium air pump + air stone + tubing',
      'Net cups that fit holes cut in the lid',
      'Clay pebbles to hold each plant',
      'Hydroponic nutrients',
      'A cheap pH test kit',
    ],
    steps: [
      'Cut round holes in the lid the same size as your net cups.',
      'Fill the tote with clean water and mix in nutrients per the label.',
      'Check the pH — aim for 5.8 to 6.2. Adjust if you can.',
      'Drop the air stone in the tote and plug in the pump. Bubbles feed the roots.',
      'Put a seedling in each net cup packed with clay pebbles.',
      'Snap the lid on. Set it where it gets bright light.',
      'Top off the water and nutrients once a week.',
    ],
    crops: ['lettuce'],
    extraCrops: ['Chard', 'Bok choy'],
    featured: false,
  },
  {
    id: 'tower',
    name: 'Beahive vertical tower',
    tag: 'Hydroponic · our project',
    blurb:
      'A standing tower that grows the most food in the smallest footprint. Water pumps up on a timer. This is the tower our team 3D-prints at a Hartford makerspace.',
    cost: '$100–250',
    effort: 'Medium (build once, then easy)',
    timeToHarvest: '5–7 weeks, then continuous',
    needs: [
      'Tower body + reservoir (3D-printed or PVC)',
      'Small submersible pump',
      'Plug-in timer',
      'Net cups (one per plant slot)',
      'Hydroponic nutrients',
      'A pH test kit',
    ],
    steps: [
      'Assemble the tower on top of the reservoir with the pump inside.',
      'Fill the reservoir with clean water and mix in nutrients.',
      'Set the timer to run the pump 15 minutes on, 15 minutes off during daylight.',
      'Slide a seedling into each net cup and click them into the tower slots.',
      'Put the tower where it gets bright light — a sunny balcony is perfect.',
      'Once a week, check the water level and top off with fresh nutrient mix.',
      'After the first harvest, replant empty slots so the tower keeps producing.',
    ],
    crops: ['lettuce', 'strawberries', 'basil'],
    extraCrops: ['Kale', 'Herbs'],
    featured: true,
  },
  {
    id: 'containers',
    name: 'Containers or grow bags',
    tag: 'Soil · outdoors',
    blurb:
      'Pots on a balcony or patio. Great for a couple of tomato plants and some greens.',
    cost: '$25–60',
    effort: 'Medium',
    timeToHarvest: 'Greens ~5 weeks · Tomatoes 2–3 months',
    needs: [
      'One 5-gallon pot or grow bag per plant (with drainage)',
      'Potting mix (enough to fill each pot)',
      'Seedlings from a hardware store or plant sale',
      'A watering can',
    ],
    steps: [
      'Fill each pot with potting mix, leaving an inch at the top.',
      'Plant one seedling per pot, packing soil gently around the roots.',
      'Water until it drips out the bottom.',
      'Put the pots where they get the most sun.',
      'Water when the top inch of soil feels dry. In hot weather that may be daily.',
      'For tomatoes and peppers, add a tomato cage when the plant is knee-high.',
      'Feed with a liquid vegetable fertilizer every 2 weeks.',
    ],
    crops: ['tomatoes', 'peppers', 'lettuce'],
    extraCrops: [],
    featured: false,
  },
  {
    id: 'raised-bed',
    name: 'Raised bed or in-ground row',
    tag: 'Soil · outdoors',
    blurb:
      'The most room per plant. Cool crops go in early spring; warm crops go in after mid-May, when the last Hartford frost is done.',
    cost: '$50–150',
    effort: 'Medium',
    timeToHarvest: 'Greens ~5 weeks · Tomatoes ~3 months',
    needs: [
      'A raised bed or a patch of dug ground',
      'Compost or bagged garden soil',
      'Seeds or seedlings',
      'A shovel or hand trowel',
      'A watering can or hose',
    ],
    steps: [
      'Mix a few inches of compost into the top layer of soil.',
      'Plant cool crops (lettuce, kale, beans) as soon as the ground thaws.',
      'Wait until after mid-May to plant tomatoes and peppers — they die in frost.',
      'Space seedlings apart the way the seed packet says. Crowded plants get sick.',
      'Water deeply once or twice a week, more in a heat wave.',
      'Pull weeds while they’re small — every week, not once a month.',
      'Feed with compost or a liquid fertilizer every few weeks.',
    ],
    crops: ['tomatoes', 'peppers', 'bush-beans', 'strawberries'],
    extraCrops: [],
    featured: false,
  },
]

export function getMethod(id) {
  return METHODS.find((m) => m.id === id) ?? null
}

// Given a space and light choice, return 1–3 recommended methods, best first.
// The logic follows the product spec: hydroponics-first for indoor/urban,
// soil only when the person has real outdoor space.
export function recommend(space, light) {
  if (!space || !light) return []

  const pick = (ids) => ids.map(getMethod).filter(Boolean)

  if (space === 'windowsill') {
    if (light === 'lots') return pick(['kratky', 'windowsill-herbs', 'dwc'])
    if (light === 'bright') return pick(['kratky', 'windowsill-herbs'])
    return pick(['kratky']) // 'low' — only Kratky greens tolerate low light
  }

  if (space === 'balcony') {
    if (light === 'lots') return pick(['tower', 'dwc', 'containers'])
    if (light === 'bright') return pick(['dwc', 'tower', 'containers'])
    return pick(['dwc', 'containers']) // low light — skip the tower
  }

  if (space === 'yard') {
    if (light === 'lots') return pick(['tower', 'raised-bed', 'containers'])
    if (light === 'bright') return pick(['raised-bed', 'tower', 'containers'])
    return pick(['raised-bed', 'containers']) // low light — greens-only outdoors
  }

  if (space === 'bed') {
    if (light === 'lots') return pick(['raised-bed', 'containers', 'tower'])
    if (light === 'bright') return pick(['raised-bed', 'containers', 'tower'])
    return pick(['raised-bed', 'containers']) // low light — no tower
  }

  return []
}

