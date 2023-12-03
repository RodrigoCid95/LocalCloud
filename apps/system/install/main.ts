import template from './template.html'

document.addEventListener('DOMContentLoaded', () => loadCore().then(() => {
  document.body.innerHTML = template
  const [fullNameRef, userNameRef, passRef] = document.querySelectorAll('ion-input').values()
  const buttonRef = document.querySelector('ion-button')
  buttonRef?.addEventListener('click', async () => {
    const data = {
      fullName: fullNameRef.value,
      userName: userNameRef.value,
      password: passRef.value
    }
    if (!Object.values(data).includes('')) {
      await (await window.loadingController.create({ message: 'Instalando ...' })).present()
      await window.server.send({
        method: 'post',
        endpoint: 'api/install',
        data
      })
      window.location.reload()
    }
  })
}))