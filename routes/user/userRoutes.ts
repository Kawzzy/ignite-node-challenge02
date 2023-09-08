import { z } from "zod";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { knexDB } from "../../src/database";

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

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
    }

    res.cookie('session_id', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
    })

    knexDB<IUser>('users').insert({
      id: randomUUID(),
      sessionId,
      name,
    })

    return res.status(201).send()
  })
}