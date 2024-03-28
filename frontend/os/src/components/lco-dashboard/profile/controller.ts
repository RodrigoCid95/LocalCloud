interface ProfileResponse {
  ok: boolean
  message: string
}

export default async (el: HTMLElement) => {
  const progressBarRef = el.querySelector('ion-progress-bar')
  const inputs = el.querySelectorAll('ion-input')
  const userNameRef = inputs.item(0)
  const fullNameRef = inputs.item(1)
  const emailRef = inputs.item(2)
  const phoneRef = inputs.item(3)
  const currentPasswordRef = inputs.item(4)
  const newPasswordRef = inputs.item(5)
  const confirmPasswordRef = inputs.item(6)
  const buttons = el.querySelectorAll('ion-button')
  const buttonSendRef = buttons.item(1)
  const buttonChangePasswordRef = buttons.item(2)
  const buttonLogoutRef = buttons.item(3)
  buttonSendRef.addEventListener('click', async () => {
    const data = {
      full_name: fullNameRef.value,
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
  buttonChangePasswordRef.addEventListener('click', async () => {
    const data = {
      current_password: currentPasswordRef.value,
      new_password: newPasswordRef.value,
      confirm_password: confirmPasswordRef.value
    }
    const values = Object.values(data)
    if (values.includes('')) {
      return
    }
    if (values[1] !== values[2]) {
      const alert = await window.alertController.create({ message: 'Las contraseñas no coinciden', buttons: ['Aceptar'] })
      await alert.present()
      return
    }
    progressBarRef.style.display = 'block'
    try {
      const { ok, message } = await window.server.send<any, ProfileResponse>({
        method: 'put',
        endpoint: 'api/profile',
        data
      })
      if (ok) {
        currentPasswordRef.value = ''
        newPasswordRef.value = ''
        confirmPasswordRef.value = ''
      } else {
        const alert = await window.alertController.create({ message, buttons: ['Aceptar'] })
        await alert.present()
      } 
    } catch (error) {
      debugger
      console.log(error)
    }
    progressBarRef.style.display = 'none'
  })
  buttonLogoutRef.addEventListener('click', async () => {
    await (await window.loadingController.create({ message: 'Cerrando sesión ...' })).present()
    await window.server.send({ method: 'delete', endpoint: 'api/auth' })
    localStorage.clear()
    window.location.reload()
  })
  const { user_name, full_name, email, phone } = await window.server.send<Users.User>({
    method: 'get',
    endpoint: 'api/profile'
  })
  userNameRef.value = user_name
  fullNameRef.value = full_name
  emailRef.value = email
  phoneRef.value = phone
  progressBarRef.style.display = 'none'
}