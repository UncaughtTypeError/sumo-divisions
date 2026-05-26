// Ichimon (faction) data — name, approximate founding year, and member heya.
// Founding years reflect the Meiji-era formalization of the heya system (c. 1878),
// except Tokitsukaze which was established by yokozuna Futabayama in 1941.

export const ICHIMON = [
  {
    name: 'Dewanoumi',
    founded: 1878,
    color: 'dewanoumi',
    heya: [
      'Dewanoumi',
      'Fujishima',
      'Futagoyama',
      'Ikazuchi',
      'Kasugano',
      'Kise',
      'Musashigawa',
      'Onoe',
      'Sakaigawa',
      'Shikihide',
      'Takekuma',
      'Tamanoi',
      'Tatsunami',
      'Yamahibiki',
    ],
  },
  {
    name: 'Isegahama',
    founded: 1878,
    color: 'isegahama',
    heya: [
      'Ajigawa',
      'Asahiyama',
      'Asakayama',
      'Isegahama',
      'Miyagino',
      'Oshima',
    ],
  },
  {
    name: 'Nishonoseki',
    founded: 1878,
    color: 'nishonoseki',
    heya: [
      'Hanaregoma',
      'Hidenoyama',
      'Kataonami',
      'Minato',
      'Minatogawa',
      'Nakamura',
      'Naruto',
      'Nishiiwa',
      'Nishonoseki',
      'Onomatsu',
      'Oshiogawa',
      'Otake',
      'Sadogatake',
      'Shibatayama',
      'Shikoroyama',
      'Tagonoura',
      'Takadagawa',
      'Tokiwayama',
    ],
  },
  {
    name: 'Takasago',
    founded: 1878,
    color: 'takasago',
    heya: ['Hakkaku', 'Kokonoe', 'Nishikido', 'Takasago'],
  },
  {
    name: 'Tokitsukaze',
    founded: 1941,
    color: 'tokitsukaze',
    heya: ['Arashio', 'Isenoumi', 'Oitekaze', 'Otowayama', 'Tokitsukaze'],
  },
];

// Normalize for matching: lowercase + strip macrons so "Ōshima" == "Oshima"
function normalize(s) {
  return s
    .toLowerCase()
    .replace(
      /[āēīōū]/g,
      (m) => ({ ā: 'a', ē: 'e', ī: 'i', ō: 'o', ū: 'u' })[m],
    );
}

export function getIchimon(heyaName) {
  if (!heyaName) return null;
  const n = normalize(heyaName);
  return ICHIMON.find((i) => i.heya.some((h) => normalize(h) === n)) ?? null;
}
