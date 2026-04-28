import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/User.js'
import mongoose from 'mongoose'

describe('Flujo de autorizacion', () => {
  
  beforeAll(async () => {
    await User.deleteMany()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('deberia de registrar un ususario', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        name: 'test',
        email: 'test@test.com',
        password: '123456789'
      })

    expect(res.statusCode).toBe(201)
  })
  
  it('deberia de hacer login a un usuario y devolver token', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'test@test.com',
        password: '123456789'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  })
    
})