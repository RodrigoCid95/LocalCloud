import { Prefix, Methods, On, Request, Response } from 'bitis/http'

const { GET } = Methods

@Prefix('app')
export class AppController {
  @On(GET, '/:app/*')
  public index(req: Request, res: Response) {
    res.status(200).end()
  }
}