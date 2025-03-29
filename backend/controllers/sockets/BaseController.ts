export class BaseController {
  @On('connect')
  public connect({ socket }: PXIOSockets.EventArgs) {
    socket.join(socket.request.session.id)
  }
  @On('disconnect')
  public disconnect({ socket }: PXIOSockets.EventArgs) {
    socket.leave(socket.request.session.id)
  }
}