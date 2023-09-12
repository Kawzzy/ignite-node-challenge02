import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { knexDB } from '../../src/database'
import { checkSessionId } from '../../middlewares/checkSessionId'

interface IUser {
  id: string
  sessionId: string
  name: string
}

const userSchema = z.object({
  name: z.string(),
})

const getUserParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const { name } = userSchema.parse(req.body)

    let { sessionId } = req.cookies

    if (sessionId) {
      return res.status(409).send(`There's already an user authenticated!`)
    }
    
    sessionId = randomUUID()

    res.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    })

    await knexDB<IUser>('users').insert({
      id: randomUUID(),
      sessionId,
      name,
    })

    return res.status(201).send()
  })

  // created the following routes for development purposes
  app.get('/', { preHandler: [checkSessionId] }, async (req) => {

    const users = await knexDB<IUser>('users')
      .select()

    return { users }
  })

  app.delete('/:id', async (req, res) => {

    const { id } = getUserParamsSchema.parse(req.params)

    await knexDB<IUser>('users')
      .delete()
      .where({
        id
      })
  })
}
