import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../server.js'
import Property from '../models/property.model.js'
import GalleryImage from '../models/gallery.model.js'

describe('Public Gallery API Tests', () => {
  let testProperty

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || process.env.MONGODB_URI)
    
    // Create test property
    testProperty = new Property({
      name: 'Test Property',
      slug: 'test-property',
      ntak: 'TEST123456',
      rentalMode: 'entire',
      basePricePerPerson: 8000,
      contact: {
        email: 'test@example.com',
        phone: '+36301234567',
        address: 'Test Address 1'
      },
      active: true
    })
    await testProperty.save()

    // Create test images
    await GalleryImage.insertMany([
      {
        property: testProperty._id,
        category: 'to',
        url: 'https://example.com/image1.jpg',
        publicId: 'test_image1',
        resourceType: 'image',
        width: 1920,
        height: 1080,
        format: 'jpg',
        alt: { hu: 'Teszt kép 1', en: 'Test image 1', de: 'Testbild 1' },
        tags: ['test', 'room'],
        active: true,
        isCover: true
      },
      {
        property: testProperty._id,
        category: 'to',
        url: 'https://example.com/image2.jpg',
        publicId: 'test_image2',
        resourceType: 'image',
        width: 1280,
        height: 720,
        format: 'jpg',
        alt: { hu: 'Teszt kép 2', en: 'Test image 2', de: 'Testbild 2' },
        tags: ['test', 'bathroom'],
        active: true,
        isCover: false
      },
      {
        property: testProperty._id,
        category: 'udvar',
        url: 'https://example.com/video1.mp4',
        publicId: 'test_video1',
        resourceType: 'video',
        width: 1920,
        height: 1080,
        format: 'mp4',
        duration: 30,
        posterUrl: 'https://example.com/poster1.jpg',
        alt: { hu: 'Teszt videó 1', en: 'Test video 1', de: 'Testvideo 1' },
        tags: ['test', 'outdoor'],
        active: true,
        isCover: true
      },
      {
        property: testProperty._id,
        category: 'wellness',
        url: 'https://example.com/image3.jpg',
        publicId: 'test_image3',
        resourceType: 'image',
        width: 800,
        height: 600,
        format: 'jpg',
        alt: { hu: 'Teszt kép 3', en: 'Test image 3', de: 'Testbild 3' },
        tags: ['test', 'wellness'],
        active: false // Inactive image
      }
    ])
  })

  afterAll(async () => {
    // Clean up test data
    await GalleryImage.deleteMany({ property: testProperty._id })
    await Property.deleteOne({ _id: testProperty._id })
    await mongoose.disconnect()
  })

  describe('GET /api/public/gallery', () => {
    it('should return paginated gallery items', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', page: 1, limit: 2 })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('count', 2)
      expect(response.body).toHaveProperty('page', 1)
      expect(response.body).toHaveProperty('limit', 2)
      expect(response.body).toHaveProperty('hasNext')
      expect(response.body).toHaveProperty('hasPrev', false)
      expect(response.body).toHaveProperty('items')
      expect(Array.isArray(response.body.items)).toBe(true)
      expect(response.body.items.length).toBeLessThanOrEqual(2)
    })

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', category: 'to' })

      expect(response.status).toBe(200)
      expect(response.body.items.every(item => item.category === 'to')).toBe(true)
    })

    it('should filter by resourceType (image)', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', resourceType: 'image' })

      expect(response.status).toBe(200)
      expect(response.body.items.every(item => item.resourceType === 'image')).toBe(true)
    })

    it('should filter by resourceType (video)', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', resourceType: 'video' })

      expect(response.status).toBe(200)
      expect(response.body.items.every(item => item.resourceType === 'video')).toBe(true)
    })

    it('should return 400 when propertySlug is missing', async () => {
      const response = await request(app)
        .get('/api/public/gallery')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'propertySlug missing')
    })

    it('should return 404 when property does not exist', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'nonexistent-property' })

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message', 'Property not found')
    })

    it('should return correct pagination info', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', page: 1, limit: 1 })

      expect(response.status).toBe(200)
      expect(response.body.count).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.limit).toBe(1)
      expect(response.body.hasNext).toBe(true)
      expect(response.body.hasPrev).toBe(false)
    })

    it('should sort by new (default)', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', limit: 10 })

      expect(response.status).toBe(200)
      const items = response.body.items
      for (let i = 1; i < items.length; i++) {
        expect(new Date(items[i-1].createdAt)).toBeGreaterThanOrEqual(new Date(items[i].createdAt))
      }
    })

    it('should sort by old when specified', async () => {
      const response = await request(app)
        .get('/api/public/gallery')
        .query({ propertySlug: 'test-property', sort: 'old', limit: 10 })

      expect(response.status).toBe(200)
      const items = response.body.items
      for (let i = 1; i < items.length; i++) {
        expect(new Date(items[i-1].createdAt)).toBeLessThanOrEqual(new Date(items[i].createdAt))
      }
    })
  })

  describe('GET /api/public/gallery/covers', () => {
    it('should return covers for each category', async () => {
      const response = await request(app)
        .get('/api/public/gallery/covers')
        .query({ propertySlug: 'test-property' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('covers')
      expect(typeof response.body.covers).toBe('object')

      // Check that we have covers for default categories
      const categories = ['to', 'udvar', 'csarda', 'wellness', 'programok', 'egyeb']
      categories.forEach(cat => {
        expect(response.body.covers).toHaveProperty(cat)
      })

      // Check 'to' category has a cover
      expect(response.body.covers.to).not.toBeNull()
      expect(response.body.covers.to).toHaveProperty('coverRaw')
      expect(response.body.covers.to).toHaveProperty('resourceType')
      expect(response.body.covers.to).toHaveProperty('isCover', true) // Should prefer isCover=true items
    })

    it('should return 400 when propertySlug is missing', async () => {
      const response = await request(app)
        .get('/api/public/gallery/covers')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'propertySlug missing')
    })

    it('should return empty covers when property does not exist', async () => {
      const response = await request(app)
        .get('/api/public/gallery/covers')
        .query({ propertySlug: 'nonexistent-property' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('covers', {})
    })

    it('should use custom categories when provided', async () => {
      const response = await request(app)
        .get('/api/public/gallery/covers')
        .query({ propertySlug: 'test-property', categories: 'to,udvar' })

      expect(response.status).toBe(200)
      expect(response.body.covers).toHaveProperty('to')
      expect(response.body.covers).toHaveProperty('udvar')
      expect(response.body.covers).not.toHaveProperty('csarda')
      expect(response.body.covers).not.toHaveProperty('wellness')
    })
  })

  describe('GET /api/public/gallery/stats', () => {
    it('should return statistics for gallery', async () => {
      const response = await request(app)
        .get('/api/public/gallery/stats')
        .query({ propertySlug: 'test-property' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('byCategory')
      expect(response.body).toHaveProperty('byType')
      expect(typeof response.body.total).toBe('number')
      expect(typeof response.body.byCategory).toBe('object')
      expect(typeof response.body.byType).toBe('object')
    })

    it('should return correct category counts', async () => {
      const response = await request(app)
        .get('/api/public/gallery/stats')
        .query({ propertySlug: 'test-property' })

      expect(response.status).toBe(200)
      expect(response.body.byCategory.to).toBe(2) // 2 'to' images
      expect(response.body.byCategory.udvar).toBe(1) // 1 'udvar' video
    })

    it('should return correct type counts', async () => {
      const response = await request(app)
        .get('/api/public/gallery/stats')
        .query({ propertySlug: 'test-property' })

      expect(response.status).toBe(200)
      expect(response.body.byType.image).toBe(2) // 2 images (only active ones)
      expect(response.body.byType.video).toBe(1) // 1 video
    })

    it('should return 400 when propertySlug is missing', async () => {
      const response = await request(app)
        .get('/api/public/gallery/stats')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'propertySlug missing')
    })

    it('should return empty stats when property does not exist', async () => {
      const response = await request(app)
        .get('/api/public/gallery/stats')
        .query({ propertySlug: 'nonexistent-property' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        total: 0,
        byCategory: {},
        byType: {}
      })
    })
  })

  describe('GET /api/public/gallery/random', () => {
    it('should return random gallery items', async () => {
      const response = await request(app)
        .get('/api/public/gallery/random')
        .query({ propertySlug: 'test-property', limit: 2 })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('items')
      expect(Array.isArray(response.body.items)).toBe(true)
      expect(response.body.items.length).toBeLessThanOrEqual(2)
    })

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/public/gallery/random')
        .query({ propertySlug: 'test-property', category: 'to', limit: 5 })

      expect(response.status).toBe(200)
      expect(response.body.items.every(item => item.category === 'to')).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/public/gallery/random')
        .query({ propertySlug: 'test-property', limit: 1 })

      expect(response.status).toBe(200)
      expect(response.body.items.length).toBeLessThanOrEqual(1)
    })

    it('should return 400 when propertySlug is missing', async () => {
      const response = await request(app)
        .get('/api/public/gallery/random')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'propertySlug missing')
    })

    it('should return empty array when property does not exist', async () => {
      const response = await request(app)
        .get('/api/public/gallery/random')
        .query({ propertySlug: 'nonexistent-property' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ items: [] })
    })

    it('should use default limit when not specified', async () => {
      const response = await request(app)
        .get('/api/public/gallery/random')
        .query({ propertySlug: 'test-property' })

      expect(response.status).toBe(200)
      expect(response.body.items.length).toBeLessThanOrEqual(8) // Default limit
    })
  })
})