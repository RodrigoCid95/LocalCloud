import type { LocalCloud } from 'declarations'
import type { Next, Request, Response } from 'phoenix-js/http'

export const validityRequest = (req: Request<LocalCloud.SessionData>, _: Response, next: Next) => {
}