import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knexDB } from '../../src/database'
import { getUserId } from '../../utils/utils'
import { IMeal, IUser } from '../../types/types'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { checkSessionId } from '../../middlewares/checkSessionId'

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

  app.get('/resume', { preHandler: [checkSessionId] }, async (req, res) => {
    
    const userId = getUserId(req)

    const meals = await knexDB<IMeal>('meals')
      .select()
      .where({
        userId
      })

      const qtMeals = meals.length
      const qtHealthyMeals = meals.filter(meal => meal.isHealthy).length
      const qtUnhealthyMeals = meals.filter(meal => !meal.isHealthy).length

      const result = {
        "Quantidade total de refeições": qtMeals,
        "Quantidade total de refeições dentro da dieta": qtHealthyMeals,
        "Quantidade total de refeições fora da dieta": qtUnhealthyMeals
      }

      return res.status(200).send({ userId, result })
  })

  // created the following routes for development purposes
  app.get('/', async () => {

    const users = await knexDB<IUser>('users')
      .select()

    return { users }
  })

  app.delete('/:id', async (req) => {

    const { id } = getUserParamsSchema.parse(req.params)

    await knexDB<IUser>('users')
      .delete()
      .where({
        id
      })
  })
}
