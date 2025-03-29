import { BaseController } from './BaseController'
import { decryptRequest } from './middlewares/encrypt'

export class IndexController extends BaseController {
  @Before([decryptRequest])
  @On('test')
  public test({ socket, data }: PXIOSockets.EventArgs) {
    console.log('test', data, socket.handshake.auth.token, socket.handshake.headers)
  }
}

export * from './Auth'