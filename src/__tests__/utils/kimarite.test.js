import { describe, it, expect } from 'vitest'
import {
  KIMARITE_CATEGORIES,
  KIMARITE_INFO,
  getKimariteInfo,
  formatKimariteInfo,
} from '../../utils/kimarite'

describe('kimarite utilities', () => {
  describe('KIMARITE_CATEGORIES', () => {
    it('should have all expected categories', () => {
      expect(KIMARITE_CATEGORIES.BASIC).toBe('Basic techniques')
      expect(KIMARITE_CATEGORIES.LEG_TRIPPING).toBe('Leg tripping')
      expect(KIMARITE_CATEGORIES.THROWING).toBe('Throwing')
      expect(KIMARITE_CATEGORIES.TWIST_DOWN).toBe('Twist down')
      expect(KIMARITE_CATEGORIES.BACKWARDS_BODY_DROP).toBe('Backwards body drop')
      expect(KIMARITE_CATEGORIES.SPECIAL).toBe('Special techniques')
      expect(KIMARITE_CATEGORIES.NON_TECHNIQUE).toBe('Non-techniques')
    })
  })

  describe('KIMARITE_INFO', () => {
    it('should have correct structure for each kimarite', () => {
      Object.entries(KIMARITE_INFO).forEach(([key, info]) => {
        expect(info).toHaveProperty('japanese')
        expect(info).toHaveProperty('shortDescription')
        expect(info).toHaveProperty('description')
        expect(info).toHaveProperty('category')
        expect(typeof info.japanese).toBe('string')
        expect(typeof info.shortDescription).toBe('string')
        expect(typeof info.description).toBe('string')
        expect(typeof info.category).toBe('string')
      })
    })

    it('should have full descriptions that are longer than short descriptions', () => {
      Object.entries(KIMARITE_INFO).forEach(([key, info]) => {
        expect(info.description.length).toBeGreaterThan(info.shortDescription.length)
      })
    })

    describe('basic techniques', () => {
      it.each([
        ['yorikiri', '寄り切り', 'Frontal force out'],
        ['oshidashi', '押し出し', 'Frontal push out'],
        ['tsukidashi', '突き出し', 'Frontal thrust out'],
      ])('should have correct short description for %s', (kimarite, japanese, shortDescription) => {
        const info = KIMARITE_INFO[kimarite]
        expect(info.japanese).toBe(japanese)
        expect(info.shortDescription).toBe(shortDescription)
        expect(info.category).toBe(KIMARITE_CATEGORIES.BASIC)
      })
    })

    describe('leg tripping techniques', () => {
      it.each([
        ['ashitori', '足取り', 'Leg pick'],
        ['sotogake', '外掛け', 'Outside leg trip'],
        ['uchigake', '内掛け', 'Inside leg trip'],
      ])('should have correct short description for %s', (kimarite, japanese, shortDescription) => {
        const info = KIMARITE_INFO[kimarite]
        expect(info.japanese).toBe(japanese)
        expect(info.shortDescription).toBe(shortDescription)
        expect(info.category).toBe(KIMARITE_CATEGORIES.LEG_TRIPPING)
      })
    })

    describe('throwing techniques', () => {
      it.each([
        ['uwatenage', '上手投げ', 'Overarm throw'],
        ['shitatenage', '下手投げ', 'Underarm throw'],
        ['kotenage', '小手投げ', 'Arm lock throw'],
      ])('should have correct short description for %s', (kimarite, japanese, shortDescription) => {
        const info = KIMARITE_INFO[kimarite]
        expect(info.japanese).toBe(japanese)
        expect(info.shortDescription).toBe(shortDescription)
        expect(info.category).toBe(KIMARITE_CATEGORIES.THROWING)
      })
    })

    describe('non-techniques', () => {
      it.each([
        ['fusen', '不戦', 'Forfeit'],
        ['hansoku', '反則', 'Foul'],
        ['isamiashi', '勇み足', 'Involuntary step out'],
      ])('should have correct short description for %s', (kimarite, japanese, shortDescription) => {
        const info = KIMARITE_INFO[kimarite]
        expect(info.japanese).toBe(japanese)
        expect(info.shortDescription).toBe(shortDescription)
        expect(info.category).toBe(KIMARITE_CATEGORIES.NON_TECHNIQUE)
      })
    })
  })

  describe('getKimariteInfo', () => {
    it('should return info for known kimarite', () => {
      const info = getKimariteInfo('yorikiri')
      expect(info.japanese).toBe('寄り切り')
      expect(info.shortDescription).toBe('Frontal force out')
      expect(info.category).toBe(KIMARITE_CATEGORIES.BASIC)
      expect(info.description).toContain('belt')
    })

    it('should be case-insensitive', () => {
      expect(getKimariteInfo('YORIKIRI')).toEqual(getKimariteInfo('yorikiri'))
      expect(getKimariteInfo('Yorikiri')).toEqual(getKimariteInfo('yorikiri'))
    })

    it('should handle spaces and hyphens', () => {
      // Assuming someone might type with spaces or hyphens
      expect(getKimariteInfo('yori-kiri')).toEqual(getKimariteInfo('yorikiri'))
      expect(getKimariteInfo('yori kiri')).toEqual(getKimariteInfo('yorikiri'))
    })

    it('should return null for unknown kimarite', () => {
      expect(getKimariteInfo('unknowntechnique')).toBeNull()
    })

    it('should return null for null input', () => {
      expect(getKimariteInfo(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(getKimariteInfo(undefined)).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(getKimariteInfo('')).toBeNull()
    })
  })

  describe('formatKimariteInfo', () => {
    it('should format kimarite info with category in brackets', () => {
      const formatted = formatKimariteInfo('yorikiri')
      expect(formatted.japanese).toBe('寄り切り')
      expect(formatted.shortDescription).toBe('Frontal force out')
      expect(formatted.description).toContain('[Basic techniques]')
      expect(formatted.category).toBe(KIMARITE_CATEGORIES.BASIC)
    })

    it('should format non-technique correctly', () => {
      const formatted = formatKimariteInfo('fusen')
      expect(formatted.japanese).toBe('不戦')
      expect(formatted.shortDescription).toBe('Forfeit')
      expect(formatted.description).toContain('[Non-techniques]')
      expect(formatted.category).toBe(KIMARITE_CATEGORIES.NON_TECHNIQUE)
    })

    it('should return null for unknown kimarite', () => {
      expect(formatKimariteInfo('unknowntechnique')).toBeNull()
    })

    it('should return null for null input', () => {
      expect(formatKimariteInfo(null)).toBeNull()
    })
  })
})
