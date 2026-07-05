import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { app, cleanupTestUsers, uniqueTestEmail } from './helpers.js'
import { pool } from '../src/db/pool.js'

let accessToken

beforeAll(async () => {
  const email = uniqueTestEmail('projects-owner')
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Projects Owner', email, password: 'password123' })
  accessToken = res.body.accessToken
})

afterAll(async () => {
  await cleanupTestUsers()
  await pool.end()
})

function auth(req) {
  return req.set('Authorization', `Bearer ${accessToken}`)
}

describe('Projects API', () => {
  test('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.status).toBe(401)
  })

  test('starts with an empty project list for a new account', async () => {
    const res = await auth(request(app).get('/api/projects'))
    expect(res.status).toBe(200)
    expect(res.body.projects).toEqual([])
  })

  test('creates a project', async () => {
    const res = await auth(request(app).post('/api/projects')).send({
      name: 'Test Migration Project',
      client: 'Acme Co',
      status: 'planning',
      priority: 'high',
      budget: { allocated: 100000, spent: 0 },
    })

    expect(res.status).toBe(201)
    expect(res.body.project.name).toBe('Test Migration Project')
    expect(res.body.project.budget.allocated).toBe(100000)
    expect(res.body.project.status).toBe('planning')
  })

  test('rejects a project with no name', async () => {
    const res = await auth(request(app).post('/api/projects')).send({ client: 'No Name Co' })
    expect(res.status).toBe(400)
  })

  test('lists the created project', async () => {
    const res = await auth(request(app).get('/api/projects'))
    expect(res.status).toBe(200)
    expect(res.body.projects.length).toBeGreaterThan(0)
  })

  test('updates a project and logs a status-change activity entry', async () => {
    const created = await auth(request(app).post('/api/projects')).send({ name: 'To Update' })
    const id = created.body.project.id

    const updated = await auth(request(app).patch(`/api/projects/${id}`)).send({ status: 'active' })
    expect(updated.status).toBe(200)
    expect(updated.body.project.status).toBe('active')

    const activity = await auth(request(app).get('/api/activity'))
    expect(activity.body.activity.some((a) => a.type === 'status_change')).toBe(true)
  })

  test('archives a project so it drops out of the default list', async () => {
    const created = await auth(request(app).post('/api/projects')).send({ name: 'To Archive' })
    const id = created.body.project.id

    const archived = await auth(request(app).post(`/api/projects/${id}/archive`))
    expect(archived.status).toBe(200)
    expect(archived.body.project.status).toBe('archived')

    const list = await auth(request(app).get('/api/projects'))
    expect(list.body.projects.find((p) => p.id === id)).toBeUndefined()

    const listWithArchived = await auth(request(app).get('/api/projects?includeArchived=true'))
    expect(listWithArchived.body.projects.find((p) => p.id === id)).toBeDefined()
  })

  test('deletes a project', async () => {
    const created = await auth(request(app).post('/api/projects')).send({ name: 'To Delete' })
    const id = created.body.project.id

    const del = await auth(request(app).delete(`/api/projects/${id}`))
    expect(del.status).toBe(204)

    const getDeleted = await auth(request(app).get(`/api/projects/${id}`))
    expect(getDeleted.status).toBe(404)
  })

  test('returns 404 for a project belonging to another organization', async () => {
    const otherEmail = uniqueTestEmail('other-org')
    const otherSignup = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Other Org User', email: otherEmail, password: 'password123' })

    const mine = await auth(request(app).post('/api/projects')).send({ name: 'Mine Only' })

    const res = await request(app)
      .get(`/api/projects/${mine.body.project.id}`)
      .set('Authorization', `Bearer ${otherSignup.body.accessToken}`)

    expect(res.status).toBe(404)
  })
})

describe('Analytics API', () => {
  test('returns aggregate totals reflecting real project data', async () => {
    const res = await auth(request(app).get('/api/analytics'))
    expect(res.status).toBe(200)
    expect(res.body.totals.totalProjects).toBeGreaterThan(0)
    expect(res.body.statusDistribution).toBeDefined()
  })
})
