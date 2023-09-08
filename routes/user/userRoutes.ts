import { z } from "zod";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { knexDB } from "../../src/database";
import { checkSessionId, checkSessionId } from "../../middlewares/checkSessionId";
import console from "node:console";

interface IUser {
  id: string,
  sessionId: string,
  name: string
}

const userSchema = z.object({
  name: z.string(),
})

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const { name } = userSchema.parse(req.body)

    let { sessionId } = req.cookies

    if (!sessionId) {
      sessionId = randomUUID()
    }

    res.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
    })

    await knexDB<IUser>('users').insert({
      id: randomUUID(),
      sessionId,
      name,
    })

    return res.status(201).send()
  })

  // created the getUsers route for development purposes
  app.get('/', { preHandler: [checkSessionId] }, async (req) => {
    const { sessionId } = req.cookies

    const users = await knexDB<IUser>('users')
      .select()
      .where('sessionId', sessionId)

    return { users }
  })
}