import { describe, it, expect } from 'vitest'
import { generateBookingCode } from './generateCode.js'

describe('generateBookingCode', () => {
  it('generates a code with default prefix and length', () => {
    const code = generateBookingCode()
    expect(code).toMatch(/^BM-[A-Z2-9]{6}$/)
  })

  it('generates a code with custom prefix', () => {
    const code = generateBookingCode('TEST')
    expect(code).toMatch(/^TEST-[A-Z2-9]{6}$/)
  })

  it('generates a code with custom length', () => {
    const code = generateBookingCode('BM', 4)
    expect(code).toMatch(/^BM-[A-Z2-9]{4}$/)
  })

  it('generates unique codes', () => {
    const code1 = generateBookingCode()
    const code2 = generateBookingCode()
    expect(code1).not.toBe(code2)
  })
})