import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { knexDB } from '../../src/database'
import { checkSessionId } from '../../middlewares/checkSessionId'

interface IMeal {
  id: string
  name: string
  desc: string
  isHealthy: boolean
  userId: string
}

const mealSchema = z.object({
  name: z.string(),
  desc: z.string(),
  isHealthy: z.boolean(),
})

const getMealParamsSchema = z.object({
  id: z.string().uuid(),
})

function getUserId(req: FastifyRequest) {
  return req.cookies.sessionId
}

function getMealId(req: FastifyRequest) {
  return getMealParamsSchema.parse(req.params)
}

export async function mealRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionId] }, async (req, res) => {
    const userId = getUserId(req)

    const { name, desc, isHealthy } = mealSchema.parse(req.body)

    await knexDB<IMeal>('meals')
      .insert({
        id: randomUUID(),
        name,
        desc,
        isHealthy,
        userId,
      })

    return res.status(201).send()
  })

  app.get('/', { preHandler: [checkSessionId] }, async (req) => {
    const userId = getUserId(req)

    const meals = await knexDB<IMeal>('meals')
      .select()
      .where('userId', userId)

    return { userId, meals }
  })

  app.get('/:id', { preHandler: [checkSessionId] }, async (req) => {
    const { id } = getMealId(req)

    const userId = getUserId(req)

    const meal = await knexDB<IMeal>('meals')
      .select()
      .where({
        id,
        userId,
      })
      .first()

    return { meal }
  })

  app.put('/:id', { preHandler: [checkSessionId] }, async (req, res) => {
    const { id } = getMealId(req)
    
    const userId = getUserId(req)

    const { name, desc, isHealthy } = mealSchema.parse(req.body)

    await knexDB<IMeal>('meals')
      .update({
        name,
        desc,
        isHealthy,
      })
      .where({
        id,
        userId,
      })

      return res.status(201).send()
  })

  app.delete('/:id', { preHandler: [checkSessionId] }, async (req, res) => {
    const { id } = getMealId(req)

    const userId = getUserId(req)

    await knexDB<IMeal>('meals')
      .delete()
      .where({
        id,
        userId,
      })

    return res.status(201).send()
  })
}
