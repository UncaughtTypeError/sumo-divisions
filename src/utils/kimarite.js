/**
 * Kimarite (winning techniques) information for sumo matches
 *
 * Each kimarite includes:
 * - japanese: The Japanese characters for the technique
 * - shortDescription: Brief English translation of the technique name
 * - description: Full English description of how the technique is performed
 * - category: The category the technique belongs to
 */

export const KIMARITE_CATEGORIES = {
  BASIC: 'Basic techniques',
  LEG_TRIPPING: 'Leg tripping',
  THROWING: 'Throwing',
  TWIST_DOWN: 'Twist down',
  BACKWARDS_BODY_DROP: 'Backwards body drop',
  SPECIAL: 'Special techniques',
  NON_TECHNIQUE: 'Non-techniques',
}

export const KIMARITE_INFO = {
  // Basic techniques
  abisetaoshi: {
    japanese: '浴びせ倒し',
    shortDescription: 'Backward force down',
    description: 'The attacker drives forward into the opponent using his body weight to force them down onto their back, often while holding the opponent\'s mawashi.',
    category: KIMARITE_CATEGORIES.BASIC,
  },
  oshidashi: {
    japanese: '押し出し',
    shortDescription: 'Frontal push out',
    description: 'The attacker pushes the opponent out of the ring using open-handed thrusts to the chest or shoulders, without grabbing the belt.',
    category: KIMARITE_CATEGORIES.BASIC,
  },
  oshitaoshi: {
    japanese: '押し倒し',
    shortDescription: 'Frontal push down',
    description: 'The attacker pushes the opponent down to the ground using open-handed thrusts, causing them to fall forward or backward.',
    category: KIMARITE_CATEGORIES.BASIC,
  },
  tsukidashi: {
    japanese: '突き出し',
    shortDescription: 'Frontal thrust out',
    description: 'The attacker uses rapid, powerful thrusting motions with the hands to push the opponent out of the ring. More aggressive than oshidashi.',
    category: KIMARITE_CATEGORIES.BASIC,
  },
  tsukitaoshi: {
    japanese: '突き倒し',
    shortDescription: 'Frontal thrust down',
    description: 'The attacker uses powerful thrusting motions to knock the opponent down to the ground rather than out of the ring.',
    category: KIMARITE_CATEGORIES.BASIC,
  },
  yorikiri: {
    japanese: '寄り切り',
    shortDescription: 'Frontal force out',
    description: 'The most common kimarite. The attacker grabs the opponent\'s belt and drives them backward out of the ring while maintaining chest-to-chest contact.',
    category: KIMARITE_CATEGORIES.BASIC,
  },
  yoritaoshi: {
    japanese: '寄り倒し',
    shortDescription: 'Frontal crush out',
    description: 'Similar to yorikiri, but instead of forcing the opponent out, the attacker crushes them down to the ground while driving forward.',
    category: KIMARITE_CATEGORIES.BASIC,
  },

  // Leg tripping
  ashitori: {
    japanese: '足取り',
    shortDescription: 'Leg pick',
    description: 'The attacker grabs one or both of the opponent\'s legs and lifts or sweeps them to cause a fall. A straightforward leg-grabbing technique.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  chongake: {
    japanese: 'ちょん掛け',
    shortDescription: 'Heel hook',
    description: 'The attacker hooks the opponent\'s heel or ankle from the inside with their own foot while pushing or pulling to cause a fall.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  kawazugake: {
    japanese: '河津掛け',
    shortDescription: 'Hooking backward counter throw',
    description: 'A dramatic counter technique where the attacker wraps their leg around the opponent\'s leg from behind while falling backward, throwing the opponent over them.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  kekaeshi: {
    japanese: '蹴返し',
    shortDescription: 'Ankle kick',
    description: 'The attacker kicks the opponent\'s ankle or lower leg from the inside to sweep their foot out from under them while pushing.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  ketaguri: {
    japanese: '蹴手繰り',
    shortDescription: 'Pulling ankle kick',
    description: 'The attacker kicks the opponent\'s leg while simultaneously pulling them forward and down by the arm or shoulder.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  kirikaeshi: {
    japanese: '切り返し',
    shortDescription: 'Twisting backward knee trip',
    description: 'The attacker places their leg behind the opponent\'s knee and twists their body to trip the opponent backward over their leg.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  komatasukui: {
    japanese: '小股掬い',
    shortDescription: 'Over thigh scooping body drop',
    description: 'The attacker reaches between the opponent\'s legs from behind and scoops up their inner thigh while pushing them over.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  kozumatori: {
    japanese: '小褄取り',
    shortDescription: 'Ankle pick',
    description: 'The attacker grabs the opponent\'s ankle and pulls it up while pushing on the upper body to topple them.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  mitokorozeme: {
    japanese: '三所攻め',
    shortDescription: 'Triple attack force out',
    description: 'A rare technique where the attacker simultaneously attacks three points: grabbing the opponent\'s leg while pushing their chest and hooking their other leg.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  nimaigeri: {
    japanese: '二枚蹴り',
    shortDescription: 'Double leg kick',
    description: 'The attacker kicks both of the opponent\'s legs simultaneously, sweeping them out from under them.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  omata: {
    japanese: '大股',
    shortDescription: 'Big leg trip',
    description: 'The attacker steps deeply between the opponent\'s legs and uses their thigh to lift and trip the opponent over.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  sotogake: {
    japanese: '外掛け',
    shortDescription: 'Outside leg trip',
    description: 'The attacker hooks their leg around the outside of the opponent\'s leg and trips them while pushing or pulling on the upper body.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  sotokomata: {
    japanese: '外小股',
    shortDescription: 'Outside thigh grabbing push down',
    description: 'The attacker grabs the opponent\'s outer thigh from the outside while pushing them down.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  susoharai: {
    japanese: '裾払い',
    shortDescription: 'Rear foot sweep',
    description: 'The attacker sweeps the opponent\'s foot from behind, knocking it forward and out from under them.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  susotori: {
    japanese: '裾取り',
    shortDescription: 'Ankle grab pull down',
    description: 'The attacker grabs the opponent\'s ankle from behind and pulls it up while pushing on the body to cause a fall.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  tsumatori: {
    japanese: '褄取り',
    shortDescription: 'Ankle grab',
    description: 'The attacker grabs the opponent\'s ankle or lower leg and pulls it up to unbalance and topple them.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  uchigake: {
    japanese: '内掛け',
    shortDescription: 'Inside leg trip',
    description: 'The attacker hooks their leg around the inside of the opponent\'s leg and trips them while pushing or pulling on the upper body.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },
  watashikomi: {
    japanese: '渡し込み',
    shortDescription: 'Thigh grabbing push down',
    description: 'The attacker grabs the opponent\'s thigh from the inside and pushes them down and back while lifting the leg.',
    category: KIMARITE_CATEGORIES.LEG_TRIPPING,
  },

  // Throwing
  ipponzeoi: {
    japanese: '一本背負い',
    shortDescription: 'One-armed shoulder throw',
    description: 'The attacker grabs the opponent\'s arm, turns their back to them, and throws them over their shoulder using one arm.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  kakenage: {
    japanese: '掛け投げ',
    shortDescription: 'Hooking inner thigh throw',
    description: 'The attacker hooks their leg around the opponent\'s inner thigh while throwing them with an arm or belt grip.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  koshinage: {
    japanese: '腰投げ',
    shortDescription: 'Hip throw',
    description: 'The attacker positions their hip against the opponent\'s body and throws them over the hip while pulling with the arms.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  kotenage: {
    japanese: '小手投げ',
    shortDescription: 'Arm lock throw',
    description: 'The attacker traps the opponent\'s arm against their body and throws them by twisting and pulling the trapped arm downward.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  kubinage: {
    japanese: '首投げ',
    shortDescription: 'Neck throw',
    description: 'The attacker wraps their arm around the opponent\'s neck or head and throws them by pulling the head down and around.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  nichonage: {
    japanese: '二丁投げ',
    shortDescription: 'Two-handed head twist down',
    description: 'The attacker grabs the opponent\'s head with both hands and twists them down to the ground.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  shitatedashinage: {
    japanese: '下手出し投げ',
    shortDescription: 'Pulling underarm throw',
    description: 'The attacker uses an underarm belt grip to pull the opponent forward and down while stepping to the side.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  shitatenage: {
    japanese: '下手投げ',
    shortDescription: 'Underarm throw',
    description: 'The attacker uses an underarm belt grip (hand inside the opponent\'s arm) to throw the opponent to the ground.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  sukuinage: {
    japanese: '掬い投げ',
    shortDescription: 'Beltless arm throw',
    description: 'The attacker scoops under the opponent\'s arm and throws them without using a belt grip, often by lifting and twisting.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  tsukaminage: {
    japanese: '掴み投げ',
    shortDescription: 'Grasping body slam',
    description: 'The attacker grasps the opponent\'s body or belt with both hands and forcefully slams them to the ground.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  tsuriotoshi: {
    japanese: '吊り落とし',
    shortDescription: 'Lifting body slam',
    description: 'The attacker lifts the opponent off the ground by the belt and slams them down, often while twisting.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  uwatedashinage: {
    japanese: '上手出し投げ',
    shortDescription: 'Pulling overarm throw',
    description: 'The attacker uses an overarm belt grip to pull the opponent forward and down while stepping to the side.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  uwatenage: {
    japanese: '上手投げ',
    shortDescription: 'Overarm throw',
    description: 'The attacker uses an overarm belt grip (hand over the opponent\'s arm) to throw the opponent to the ground.',
    category: KIMARITE_CATEGORIES.THROWING,
  },
  yaguranage: {
    japanese: '櫓投げ',
    shortDescription: 'Inner thigh propping throw',
    description: 'The attacker lifts the opponent by placing their thigh under the opponent\'s thigh while throwing them with a belt grip.',
    category: KIMARITE_CATEGORIES.THROWING,
  },

  // Twist down
  amiuchi: {
    japanese: '網打ち',
    shortDescription: 'Arm entanglement throw',
    description: 'The attacker entangles the opponent\'s arm and twists them down, like casting a fishing net.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  gasshohineri: {
    japanese: '合掌捻り',
    shortDescription: 'Two handed head twist',
    description: 'The attacker places both hands on the opponent\'s head in a prayer-like position and twists them down.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  harimanage: {
    japanese: '波離間投げ',
    shortDescription: 'Backward belt throw',
    description: 'The attacker grabs the back of the opponent\'s belt and throws them backward over their own body.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  kainahineri: {
    japanese: '腕捻り',
    shortDescription: 'Arm twist down',
    description: 'The attacker grabs the opponent\'s arm and twists it to force them down to the ground.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  katasukashi: {
    japanese: '肩透かし',
    shortDescription: 'Under shoulder swing down',
    description: 'The attacker slips under the opponent\'s shoulder and swings them down by pulling on the arm while stepping aside.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  makiotoshi: {
    japanese: '巻き落とし',
    shortDescription: 'Arm lock twist down',
    description: 'The attacker wraps their arm around the opponent\'s arm and twists them down in a spiraling motion.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  osakate: {
    japanese: '逆手',
    shortDescription: 'Reverse arm lock',
    description: 'The attacker traps the opponent\'s arm in a reverse grip and uses leverage to force them down.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  sabaori: {
    japanese: '鯖折り',
    shortDescription: 'Forward body slam',
    description: 'The attacker bends the opponent forward at the waist and crushes them face-down to the ground, like folding a mackerel (saba).',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  sakatottari: {
    japanese: '逆とったり',
    shortDescription: 'Pulling body drop',
    description: 'A reverse arm bar technique where the attacker pulls the opponent down while controlling their arm from the opposite direction.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  shitatehineri: {
    japanese: '下手捻り',
    shortDescription: 'Underarm twist down',
    description: 'The attacker uses an underarm belt grip to twist the opponent down to the ground.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  sotomuso: {
    japanese: '外無双',
    shortDescription: 'Outside leg and arm trip',
    description: 'The attacker grabs the opponent\'s inner thigh from the outside while pulling down on the arm to trip them.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  tokkurinage: {
    japanese: 'とっくり投げ',
    shortDescription: 'Two handed neck twist down',
    description: 'The attacker grabs both sides of the opponent\'s neck (like holding a sake bottle/tokkuri) and twists them down.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  tottari: {
    japanese: 'とったり',
    shortDescription: 'Arm bar throw',
    description: 'The attacker grabs the opponent\'s arm, steps to the side, and pulls them down using the arm as a lever.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  tsukiotoshi: {
    japanese: '突き落とし',
    shortDescription: 'Thrust down',
    description: 'The attacker thrusts the opponent down to the ground using a pushing motion to the upper body while they are off-balance.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  uchimuso: {
    japanese: '内無双',
    shortDescription: 'Inside leg and arm trip',
    description: 'The attacker grabs the opponent\'s inner thigh from the inside while pulling down on the arm to trip them.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  uwatehineri: {
    japanese: '上手捻り',
    shortDescription: 'Overarm twist',
    description: 'The attacker uses an overarm belt grip to twist the opponent down to the ground.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },
  zubuneri: {
    japanese: 'ずぶねり',
    shortDescription: 'Headlock twist down',
    description: 'The attacker wraps their arm around the opponent\'s head in a headlock and twists them down to the ground.',
    category: KIMARITE_CATEGORIES.TWIST_DOWN,
  },

  // Backwards body drop
  izori: {
    japanese: '居反り',
    shortDescription: 'Backward leaning body drop',
    description: 'The attacker leans backward while holding the opponent and drops them behind by falling with them.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },
  kakezori: {
    japanese: '掛け反り',
    shortDescription: 'Hooking backward body drop',
    description: 'The attacker hooks their leg around the opponent\'s leg while falling backward to throw them.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },
  shumokuzori: {
    japanese: '撞木反り',
    shortDescription: 'Bell hammer backward body drop',
    description: 'The attacker grabs the opponent\'s leg and arm, then falls backward to throw them over in a motion like a bell hammer.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },
  sori: {
    japanese: '反り',
    shortDescription: 'Basic backward body drop',
    description: 'The attacker arches their back and falls backward while holding the opponent, throwing them over.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },
  tashizori: {
    japanese: '田すき反り',
    shortDescription: 'Rice scoop backward body drop',
    description: 'The attacker scoops under the opponent like lifting rice and falls backward to throw them.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },
  tasukizori: {
    japanese: '襷反り',
    shortDescription: 'Cross-arm backward body drop',
    description: 'The attacker crosses their arms around the opponent\'s body and falls backward to throw them.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },
  tsutaezori: {
    japanese: '伝え反り',
    shortDescription: 'Transmitted backward body drop',
    description: 'The attacker uses the opponent\'s own momentum to fall backward and throw them over.',
    category: KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP,
  },

  // Special techniques
  hatakikomi: {
    japanese: '叩き込み',
    shortDescription: 'Slap down',
    description: 'The attacker slaps down on the back of the opponent\'s head, neck, or shoulders to drive them face-first into the ground.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  hikiotoshi: {
    japanese: '引き落とし',
    shortDescription: 'Pull down',
    description: 'The attacker pulls the opponent down by the arm, shoulder, or head while stepping aside, using the opponent\'s forward momentum against them.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  hikkake: {
    japanese: '引っ掛け',
    shortDescription: 'Arm grabbing force out',
    description: 'The attacker hooks or grabs the opponent\'s arm and uses it to pull or push them out of the ring.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  kimedashi: {
    japanese: '極め出し',
    shortDescription: 'Arm lock force out',
    description: 'The attacker traps both of the opponent\'s arms against their sides and walks them out of the ring.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  kimetaoshi: {
    japanese: '極め倒し',
    shortDescription: 'Arm lock force down',
    description: 'The attacker traps both of the opponent\'s arms against their sides and forces them down to the ground.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okuridashi: {
    japanese: '送り出し',
    shortDescription: 'Rear push out',
    description: 'The attacker gets behind the opponent and pushes them out of the ring from behind.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okurigake: {
    japanese: '送り掛け',
    shortDescription: 'Rear leg trip',
    description: 'The attacker gets behind the opponent and trips their leg while pushing from behind.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okurihikiotoshi: {
    japanese: '送り引き落とし',
    shortDescription: 'Rear pull down',
    description: 'The attacker gets behind the opponent and pulls them down from behind.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okurinage: {
    japanese: '送り投げ',
    shortDescription: 'Rear throw',
    description: 'The attacker gets behind the opponent and throws them from behind, often by the belt.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okuritaoshi: {
    japanese: '送り倒し',
    shortDescription: 'Rear push down',
    description: 'The attacker gets behind the opponent and pushes them face-down to the ground from behind.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okuritsuriotoshi: {
    japanese: '送り吊り落とし',
    shortDescription: 'Rear lift body slam',
    description: 'The attacker gets behind the opponent, lifts them by the belt, and slams them down.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  okuritsuridashi: {
    japanese: '送り吊り出し',
    shortDescription: 'Rear lift out',
    description: 'The attacker gets behind the opponent, lifts them by the belt, and carries them out of the ring.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  sokubiotoshi: {
    japanese: '足首落とし',
    shortDescription: 'Nape of the neck push down',
    description: 'The attacker pushes down on the back of the opponent\'s neck to force them to the ground.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  tsuridashi: {
    japanese: '吊り出し',
    shortDescription: 'Lift out',
    description: 'The attacker lifts the opponent off the ground by the belt and carries them out of the ring.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  utchari: {
    japanese: 'うっちゃり',
    shortDescription: 'Backward pivot throw',
    description: 'A dramatic last-second counter where the attacker, while being pushed to the edge, pivots and throws the opponent out before stepping out themselves.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  waridashi: {
    japanese: '割り出し',
    shortDescription: 'Force out while standing',
    description: 'The attacker forces the opponent out by pushing on their chest while keeping them upright.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },
  yobimodoshi: {
    japanese: '呼び戻し',
    shortDescription: 'Pulling back force down',
    description: 'The attacker pulls a charging opponent back toward them and uses their momentum to throw them down.',
    category: KIMARITE_CATEGORIES.SPECIAL,
  },

  // Non-techniques
  fumidashi: {
    japanese: '踏み出し',
    shortDescription: 'Stepping out',
    description: 'The losing wrestler accidentally steps out of the ring on their own without being forced.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
  isamiashi: {
    japanese: '勇み足',
    shortDescription: 'Involuntary step out',
    description: 'The wrestler steps out of the ring while pushing the opponent, before the opponent touches down. An overeager misstep.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
  koshikudake: {
    japanese: '腰砕け',
    shortDescription: 'Unintentional collapse',
    description: 'The wrestler\'s hips give out and they collapse without being directly caused to fall by the opponent.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
  tsukihiza: {
    japanese: '突き膝',
    shortDescription: 'Knee touching ground',
    description: 'The wrestler accidentally touches their knee to the ground, losing the match.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
  tsukite: {
    japanese: '突き手',
    shortDescription: 'Hand touching ground',
    description: 'The wrestler accidentally touches their hand to the ground, losing the match.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
  fusen: {
    japanese: '不戦',
    shortDescription: 'Forfeit',
    description: 'The opponent is absent and forfeits the match, usually due to injury or withdrawal from the tournament.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
  hansoku: {
    japanese: '反則',
    shortDescription: 'Foul',
    description: 'Disqualification due to a rules violation, such as hair-pulling, punching, eye-gouging, or choking.',
    category: KIMARITE_CATEGORIES.NON_TECHNIQUE,
  },
}

/**
 * Get information about a specific kimarite
 * @param {string} kimarite - The kimarite name (e.g., 'yorikiri')
 * @returns {Object|null} The kimarite info object or null if not found
 */
export function getKimariteInfo(kimarite) {
  if (!kimarite) return null
  // Normalize the kimarite name (lowercase, remove spaces/hyphens)
  const normalized = kimarite.toLowerCase().replace(/[\s-]/g, '')
  return KIMARITE_INFO[normalized] || null
}

/**
 * Format kimarite information for display
 * @param {string} kimarite - The kimarite name
 * @returns {Object|null} Object with formatted display strings or null if not found
 */
export function formatKimariteInfo(kimarite) {
  const info = getKimariteInfo(kimarite)
  if (!info) return null

  return {
    japanese: info.japanese,
    shortDescription: info.shortDescription,
    description: `${info.description} [${info.category}]`,
    category: info.category,
  }
}
