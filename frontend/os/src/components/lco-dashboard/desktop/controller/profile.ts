export default async (el: HTMLElement) => {
  const progressBarRef = el.querySelector('ion-progress-bar')
  const inputs = el.querySelectorAll('ion-input')
  const userNameRef = inputs.item(0)
  const fullNameRef = inputs.item(1)
  const emailRef = inputs.item(2)
  const phoneRef = inputs.item(3)
  const buttons = el.querySelectorAll('ion-button')
  const buttonSendRef = buttons.item(1)
  const buttonLogoutRef = buttons.item(2)
  buttonSendRef.addEventListener('click', async () => {
    const data = {
      fullName: fullNameRef.value,
      email: emailRef.value,
      phone: phoneRef.value,
    }
    if (!Object.values(data).includes('')) {
      progressBarRef.style.display = 'block'
      await window.server.send({
        method: 'post',
        endpoint: 'api/profile',
        data
      })
      progressBarRef.style.display = 'none'
    }
  })
  buttonLogoutRef.addEventListener('click', async () => {
    await (await window.loadingController.create({ message: 'Cerrando sesión ...' })).present()
    await window.server.send({ method: 'delete', endpoint: 'api/auth' })
    localStorage.clear()
    window.location.reload()
  })
  const { userName, fullName, email, phone } = await window.server.send<any>({
    method: 'get',
    endpoint: 'api/auth'
  })
  userNameRef.value = userName
  fullNameRef.value = fullName
  emailRef.value = email
  phoneRef.value = phone
  progressBarRef.style.display = 'none'
}