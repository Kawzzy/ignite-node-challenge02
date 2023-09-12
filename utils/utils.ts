import { FastifyRequest } from "fastify";

export function getUserId(req: FastifyRequest) {
  return req.cookies.sessionId
}