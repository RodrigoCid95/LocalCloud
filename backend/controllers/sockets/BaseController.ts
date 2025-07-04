export class BaseController {
  @On('connect')
  public connect({ socket }: PXIOSockets.EventArgs): void {
    socket.join(socket.request.session.id)
  }
  @On('disconnect')
  public disconnect({ socket }: PXIOSockets.EventArgs): void {
    socket.leave(socket.request.session.id)
  }
}