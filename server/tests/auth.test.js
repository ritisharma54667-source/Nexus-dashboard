import { describe, test, expect, afterAll } from '@jest/globals'
import request from 'supertest'
import { app, cleanupTestUsers, uniqueTestEmail } from './helpers.js'
import { pool } from '../src/db/pool.js'

afterAll(async () => {
  await cleanupTestUsers()
  await pool.end()
})

describe('POST /api/auth/signup', () => {
  test('creates a new account and returns an access token', async () => {
    const email = uniqueTestEmail('signup')
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email, password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.user.email).toBe(email.toLowerCase())
    expect(res.headers['set-cookie']?.[0]).toMatch(/nexus_refresh=/)
  })

  test('rejects a duplicate email', async () => {
    const email = uniqueTestEmail('dupe')
    await request(app).post('/api/auth/signup').send({ name: 'First', email, password: 'password123' })

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Second', email, password: 'password123' })

    expect(res.status).toBe(409)
  })

  test('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: uniqueTestEmail('weak'), password: '123' })

    expect(res.status).toBe(400)
  })

  test('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'not-an-email', password: 'password123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  test('logs in with correct credentials', async () => {
    const email = uniqueTestEmail('login')
    await request(app).post('/api/auth/signup').send({ name: 'Login User', email, password: 'password123' })

    const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toEqual(expect.any(String))
  })

  test('rejects the wrong password', async () => {
    const email = uniqueTestEmail('wrongpw')
    await request(app).post('/api/auth/signup').send({ name: 'WrongPw User', email, password: 'password123' })

    const res = await request(app).post('/api/auth/login').send({ email, password: 'nope-not-it' })

    expect(res.status).toBe(401)
  })

  test('rejects an email that does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueTestEmail('ghost'), password: 'password123' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  test('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  test('rejects requests with a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token')
    expect(res.status).toBe(401)
  })

  test('returns the user for a valid access token', async () => {
    const email = uniqueTestEmail('me')
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Me User', email, password: 'password123' })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${signupRes.body.accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(email.toLowerCase())
  })
})

describe('POST /api/auth/forgot-password', () => {
  test('always returns a generic success message, even for unknown emails', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: uniqueTestEmail('unknown') })

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/if an account exists/i)
  })
})
