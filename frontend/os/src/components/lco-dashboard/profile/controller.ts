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
      const { ok, message } = await window.server.send({
        method: 'put',
        endpoint: 'api/profile',
        data: JSON.stringify(data)
      }).then(response => response.json())
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
  const { user_name, full_name, email, phone } = await window.server.send({
    method: 'get',
    endpoint: 'api/profile'
  }).then(response => response.json())
  userNameRef.value = user_name
  fullNameRef.value = full_name
  emailRef.value = email
  phoneRef.value = phone
  progressBarRef.style.display = 'none'
  buttonSendRef.addEventListener('click', async () => {
    const data = {
      full_name: fullNameRef.value,
      email: emailRef.value,
      phone: phoneRef.value,
    }
    if (user_name !== userNameRef.value) {
      data['user_name'] = userNameRef.value
    }
    if (!Object.values(data).includes('')) {
      progressBarRef.style.display = 'block'
      const { code, message }: any = await window.server.send({
        method: 'post',
        endpoint: 'api/profile',
        data: JSON.stringify(data)
      }).then(response => response.json())
      if (code) {
        window.alertController
          .create({
            header: 'Ocurrió algo',
            message,
            buttons: ['Aceptar']
          })
          .then(alert => alert.present())
      }
      progressBarRef.style.display = 'none'
    }
  })
}