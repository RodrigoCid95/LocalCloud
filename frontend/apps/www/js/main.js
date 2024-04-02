// com.users.sys/view/template.html
var template_default = `
<ion-app>
  <ion-header>
    <ion-toolbar>
      <ion-title>Usuarios</ion-title>
      <ion-buttons slot="end">
        <ion-button id="refresh">
          <ion-icon slot="icon-only" name="refresh"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-progress-bar type="indeterminate" id="progress"></ion-progress-bar>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-grid>
      <ion-row>
      </ion-row>
    </ion-grid>
    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
      <ion-fab-button id="btn-new-user">
        <ion-icon name="person-add"></ion-icon>
      </ion-fab-button>
    </ion-fab>  
  </ion-content>
</ion-app>
<ion-modal id="create-user-modal">
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button id="create-user-cancel">Cancelar</ion-button>
      </ion-buttons>
      <ion-title>Nuevo usuario</ion-title>
      <ion-buttons slot="end">
        <ion-button id="create-user-confirm" strong="true">Guardar</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <input type="hidden" name="uuid">
    <ion-list inset>
      <ion-item>
        <ion-input label="Nombre de usuario" label-placement="floating" error-text="Campo requerido"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Nombre completo" label-placement="floating" error-text="Campo requerido"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Correo electr\xF3nico" label-placement="floating" type="email" error-text="Campo requerido"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Tel\xE9fono" label-placement="floating" type="tel" error-text="Campo requerido"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Contrase\xF1a" label-placement="floating" type="password" error-text="Campo requerido"></ion-input>
      </ion-item>
    </ion-list>
  </ion-content>
</ion-modal>
<ion-modal id="update-user-modal">
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button id="update-user-cancel">Cancelar</ion-button>
      </ion-buttons>
      <ion-title id="update-user-title"></ion-title>
      <ion-buttons slot="end">
        <ion-button id="update-user-confirm" strong="true">Guardar</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <input type="hidden" name="uuid">
    <ion-list inset>
      <ion-item>
        <style>
          .thumbnail {
            --size: 140px;
            --border-radius: 14px;
            margin: 0 auto;
            cursor: pointer;
          }
        </style>
        <ion-thumbnail class="thumbnail">
          <img alt="Usuario" src="" />
        </ion-thumbnail>
      </ion-item>
      <ion-item>
        <ion-input label="Nombre completo" label-placement="floating"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Correo electr\xF3nico" label-placement="floating" type="email"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Tel\xE9fono" label-placement="floating" type="tel"></ion-input>
      </ion-item>
    </ion-list>
  </ion-content>
</ion-modal>
`;

// com.users.sys/view/thumbnail.svg
var thumbnail_default = 'data:image/svg+xml,<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g clip-path="url(%23clip0_1766_3886)">%0A<path d="M0 0H512V512H0V0Z" fill="%23222D3A"/>%0A<path d="M338 195C368.928 195 394 169.928 394 139C394 108.072 368.928 83 338 83C307.072 83 282 108.072 282 139C282 169.928 307.072 195 338 195Z" fill="%23C0C8CE"/>%0A<path d="M485.5 525L163.495 234.446C156.395 227.347 146.852 223.228 136.816 222.931C126.78 222.633 117.01 226.18 109.502 232.846L-214 525" fill="%23B3BAC0"/>%0A<path opacity="0.7" d="M120.5 563.5L368.419 312.429C375.361 305.472 384.653 301.363 394.47 300.908C404.288 300.452 413.92 303.684 421.477 309.967L667 514" fill="%23B3BAC0"/>%0A</g>%0A<defs>%0A<clipPath id="clip0_1766_3886">%0A<rect width="512" height="512" fill="white"/>%0A</clipPath>%0A</defs>%0A</svg>%0A';

// com.users.sys/view/controller.ts
var IndexController = class {
  constructor(element) {
    this.element = element;
    this.progressBarRef = this.element.querySelector("#progress");
    this.contentRef = this.element.querySelector("ion-row");
    this.refreshButtonRef = this.element.querySelector("#refresh");
    this.refreshButtonRef.addEventListener("click", this.#getUsers.bind(this));
    this.createModal = this.element.querySelector("#create-user-modal");
    this.createModal.addEventListener("ionModalDidDismiss", ({ detail }) => {
      if (detail.data) {
        this.#getUsers();
      }
    });
    const [userNameRef, fullNameRef, emailRef, phoneRef, passwordRef] = this.createModal.querySelectorAll("ion-input").values();
    const fields = [userNameRef, fullNameRef, emailRef, phoneRef, passwordRef];
    this.element.querySelector("#btn-new-user")?.addEventListener("click", async () => {
      for (const field of fields) {
        field.addEventListener("ionBlur", () => {
          field.classList.remove("ion-invalid");
          field.classList.remove("ion-touched");
        });
      }
      userNameRef.value = "";
      fullNameRef.value = "";
      emailRef.value = "";
      phoneRef.value = "";
      passwordRef.value = "";
      await this.createModal.present();
    });
    this.createModal.querySelector("#create-user-cancel")?.addEventListener("click", () => this.createModal.dismiss(false));
    this.createModal.querySelector("#create-user-confirm")?.addEventListener("click", async () => {
      let pass = true;
      for (const field of fields) {
        if (field.value === "") {
          field.classList.add("ion-invalid");
          field.classList.add("ion-touched");
          pass = false;
        }
      }
      if (pass) {
        const data = JSON.stringify({
          user_name: userNameRef.value,
          full_name: fullNameRef.value,
          email: emailRef.value,
          phone: phoneRef.value,
          password: passwordRef.value
        });
        const response = await window.server.send({
          endpoint: "api/users",
          method: "post",
          data
        }).then((response2) => response2.json());
        if (response.code) {
          (await window.alertController.create({
            header: "No se puede crear el usuario.",
            message: response.message,
            buttons: ["Aceptar"]
          })).present();
          return;
        }
        await this.createModal.dismiss(true);
      }
    });
    this.updateModal = this.element.querySelector("#update-user-modal");
    this.updateModal.querySelector("#update-user-cancel")?.addEventListener("click", () => this.updateModal.dismiss(false));
    this.updateModal.querySelector("#update-user-confirm")?.addEventListener("click", async () => {
      const loader = await window.loadingController.create({ message: "Guardando..." });
      await loader.present();
      const uuid2 = this.updateFormRefs.uuid.value;
      const full_name = this.updateFormRefs.fullName.value;
      const email2 = this.updateFormRefs.email.value;
      const phone2 = this.updateFormRefs.phone.value;
      const data = JSON.stringify({ full_name, email: email2, phone: phone2 });
      await window.server.send({
        endpoint: `api/users/${uuid2}`,
        method: "put",
        data
      });
      await loader.dismiss();
      await this.updateModal.dismiss(true);
    });
    this.updateModal.addEventListener("ionModalDidDismiss", ({ detail }) => {
      if (detail.data) {
        this.#getUsers();
      }
    });
    const uuid = this.updateModal.querySelector('[name="uuid"]');
    const [fullName, email, phone] = this.updateModal.querySelectorAll("ion-input").values();
    const photo = this.updateModal.querySelector("ion-thumbnail img");
    const userName = this.updateModal.querySelector("#update-user-title");
    this.updateFormRefs = { uuid, photo, userName, fullName, email, phone };
    this.#getUsers();
  }
  static template = template_default;
  progressBarRef;
  contentRef;
  refreshButtonRef;
  updateModal;
  createModal;
  #currentUser;
  updateFormRefs;
  async #getUsers() {
    this.contentRef.innerHTML = "";
    this.progressBarRef.style.display = "block";
    this.#currentUser = await window.server.send({
      endpoint: "api/profile",
      method: "get"
    }).then((response) => response.json());
    const results = await window.server.send({
      endpoint: "api/users",
      method: "get"
    }).then((response) => response.json());
    const cards = [];
    for (const user of results) {
      const col = document.createElement("ion-col");
      col.size = "12";
      col.sizeSm = "6";
      col.sizeMd = "4";
      col.sizeLg = "3";
      const item = document.createElement("ion-item");
      item.setAttribute("button", "true");
      item.addEventListener("click", async () => {
        this.updateFormRefs.uuid.value = user.uuid;
        this.updateFormRefs.photo.src = user.photo || thumbnail_default;
        this.updateFormRefs.userName.innerText = `Usuario - ${user.user_name}`;
        this.updateFormRefs.fullName.value = user.full_name;
        this.updateFormRefs.email.value = user.email;
        this.updateFormRefs.phone.value = user.phone;
        await this.updateModal.present();
      });
      item.innerHTML = `
        <ion-thumbnail slot="start">
          <img alt="${user.user_name}" src="" />
        </ion-thumbnail>
        <ion-label>
          ${user.full_name || ""}
          <br>
          <p>${user.user_name || ""}</p>
          ${this.#currentUser.uuid === user.uuid ? `<p>Usuario actual</p>` : ""}
        </ion-label>
      `;
      col.append(item);
      col.querySelector("img").src = user.photo || thumbnail_default;
      cards.push(col);
    }
    for (const card of cards) {
      this.contentRef.append(card);
    }
    this.progressBarRef.style.display = "none";
  }
};

// com.users.sys/main.ts
document.addEventListener("onReady", async () => {
  window.customElements.define("app-page-index", class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = IndexController.template;
      new IndexController(this);
    }
  });
  document.body.innerHTML = "<app-page-index></app-page-index>";
});
