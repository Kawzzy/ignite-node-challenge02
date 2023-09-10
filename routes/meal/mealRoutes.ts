import { z } from "zod";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { knexDB } from "../../src/database";
import { checkSessionId } from "../../middlewares/checkSessionId";

interface IMeal {
  id: string,
  name: string,
  desc: string,
  isHealthy: boolean,
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

export async function mealRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionId] } , async (req, res) => {
    
    const userId = req.cookies.sessionId
    
    const { name, desc, isHealthy } = mealSchema.parse(req.body)

    await knexDB<IMeal>('meals').insert({
      id: randomUUID(),
      name,
      desc,
      isHealthy,
      userId
    })

    return res.status(201).send()
  })

  app.get('/', { preHandler: [checkSessionId] }, async (req) => {

    const userId = req.cookies.sessionId

    const meals = await knexDB('meals')
      .select()
      .where('userId', userId)

    return { userId, meals }
  })
  
  app.delete('/:id', { preHandler: [checkSessionId] }, async (req, res) => {
    
    const { id } = getMealParamsSchema.parse(req.params)
    
    const userId = req.cookies.sessionId

    await knexDB('meals')
      .delete()
      .where({
        id,
        userId
      })
    
    return res.status(201).send()
  })
}