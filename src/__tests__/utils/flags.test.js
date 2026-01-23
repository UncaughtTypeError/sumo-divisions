import { describe, it, expect } from 'vitest'
import {
  getFlagComponent,
  getFlagData,
  FlagJapan,
  FlagMongolia,
  FlagUSA,
  FlagChina,
  FlagRussia,
  FlagUkraine,
  FlagPhilippines,
  FlagKazakhstan,
} from '../../components/common/flags'

describe('flags', () => {
  describe('getFlagData', () => {
    it('should return Mongolia flag data for Mongolian wrestlers', () => {
      const data = getFlagData('Mongolia, Ulaanbaatar')
      expect(data.component).toBe(FlagMongolia)
      expect(data.code).toBe('MGL')
    })

    it('should return Japan flag data for Japanese prefectures', () => {
      const data = getFlagData('Tokyo')
      expect(data.component).toBe(FlagJapan)
      expect(data.code).toBe('JPN')
    })

    it('should return USA flag data for American wrestlers', () => {
      const data = getFlagData('USA')
      expect(data.component).toBe(FlagUSA)
      expect(data.code).toBe('USA')
    })

    it('should return correct country codes for all countries', () => {
      expect(getFlagData('Mongolia').code).toBe('MGL')
      expect(getFlagData('Japan').code).toBe('JPN')
      expect(getFlagData('USA').code).toBe('USA')
      expect(getFlagData('China').code).toBe('CHN')
      expect(getFlagData('Russia').code).toBe('RUS')
      expect(getFlagData('Ukraine').code).toBe('UKR')
      expect(getFlagData('Philippines').code).toBe('PHL')
      expect(getFlagData('Kazakhstan').code).toBe('KAZ')
    })

    it('should return null for empty or null input', () => {
      expect(getFlagData(null)).toBeNull()
      expect(getFlagData(undefined)).toBeNull()
      expect(getFlagData('')).toBeNull()
    })
  })

  describe('getFlagComponent', () => {
    it('should return Mongolia flag for Mongolian wrestlers', () => {
      expect(getFlagComponent('Mongolia, Ulaanbaatar')).toBe(FlagMongolia)
      expect(getFlagComponent('Mongolia')).toBe(FlagMongolia)
    })

    it('should return Japan flag for Japanese prefectures', () => {
      expect(getFlagComponent('Tokyo')).toBe(FlagJapan)
      expect(getFlagComponent('Osaka')).toBe(FlagJapan)
      expect(getFlagComponent('Fukuoka')).toBe(FlagJapan)
      expect(getFlagComponent('Hokkaido')).toBe(FlagJapan)
    })

    it('should return USA flag for American wrestlers', () => {
      expect(getFlagComponent('USA')).toBe(FlagUSA)
      expect(getFlagComponent('United States')).toBe(FlagUSA)
    })

    it('should return China flag for Chinese wrestlers', () => {
      expect(getFlagComponent('China')).toBe(FlagChina)
    })

    it('should return Russia flag for Russian wrestlers', () => {
      expect(getFlagComponent('Russia')).toBe(FlagRussia)
    })

    it('should return Ukraine flag for Ukrainian wrestlers', () => {
      expect(getFlagComponent('Ukraine')).toBe(FlagUkraine)
    })

    it('should return Philippines flag for Filipino wrestlers', () => {
      expect(getFlagComponent('Philippines')).toBe(FlagPhilippines)
    })

    it('should return Kazakhstan flag for Kazakhstani wrestlers', () => {
      expect(getFlagComponent('Kazakhstan')).toBe(FlagKazakhstan)
    })

    it('should be case insensitive', () => {
      expect(getFlagComponent('MONGOLIA')).toBe(FlagMongolia)
      expect(getFlagComponent('tokyo')).toBe(FlagJapan)
      expect(getFlagComponent('RUSSIA')).toBe(FlagRussia)
    })

    it('should return null for empty or null input', () => {
      expect(getFlagComponent(null)).toBeNull()
      expect(getFlagComponent(undefined)).toBeNull()
      expect(getFlagComponent('')).toBeNull()
    })

    it('should handle shusshin with city names', () => {
      expect(getFlagComponent('Mongolia, Ulaanbaatar')).toBe(FlagMongolia)
      expect(getFlagComponent('Russia, Moscow')).toBe(FlagRussia)
    })

    it('should default to Japan for unrecognized single-word locations', () => {
      expect(getFlagComponent('SomeUnknownPlace')).toBe(FlagJapan)
    })

    it('should handle Japanese prefectures with -ken suffix', () => {
      expect(getFlagComponent('Ibaraki-ken, Inashiki-shi')).toBe(FlagJapan)
      expect(getFlagComponent('Ibaraki-ken, Tsuchiura-shi')).toBe(FlagJapan)
      expect(getFlagComponent('Ishikawa-ken, Hakusan-shi')).toBe(FlagJapan)
    })

    it('should not match USA for Japanese cities containing "usa"', () => {
      // Usa is a city in Oita prefecture, Japan
      expect(getFlagComponent('Oita-ken, Usa-shi')).toBe(FlagJapan)
    })
  })
})
