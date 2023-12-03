import style from './_style.scss'
import core from '@ionic/core/css/core.css'
import normalize from '@ionic/core/css/normalize.css'
import structure from '@ionic/core/css/structure.css'
import typography from '@ionic/core/css/typography.css'
import padding from '@ionic/core/css/padding.css'
import floatElements from '@ionic/core/css/float-elements.css'
import textAlignment from '@ionic/core/css/text-alignment.css'
import textTransformation from '@ionic/core/css/text-transformation.css'
import flexUtils from '@ionic/core/css/flex-utils.css'
import { defineCustomElement as defineIonAccordionGroup } from '@ionic/core/components/ion-accordion-group'
import { defineCustomElement as defineIonAccordion } from '@ionic/core/components/ion-accordion'
import { defineCustomElement as defineIonActionSheet } from '@ionic/core/components/ion-action-sheet'
import { defineCustomElement as defineIonAlert } from '@ionic/core/components/ion-alert'
import { defineCustomElement as defineIonApp } from '@ionic/core/components/ion-app'
import { defineCustomElement as defineIonAvatar } from '@ionic/core/components/ion-avatar'
import { defineCustomElement as defineIonBackButton } from '@ionic/core/components/ion-back-button'
import { defineCustomElement as defineIonBackdrop } from '@ionic/core/components/ion-backdrop'
import { defineCustomElement as defineIonBadge } from '@ionic/core/components/ion-badge'
import { defineCustomElement as defineIonBreadcrumb } from '@ionic/core/components/ion-breadcrumb'
import { defineCustomElement as defineIonBreadcrumbs } from '@ionic/core/components/ion-breadcrumbs'
import { defineCustomElement as defineIonButton } from '@ionic/core/components/ion-button'
import { defineCustomElement as defineIonButtons } from '@ionic/core/components/ion-buttons'
import { defineCustomElement as defineIonCardContent } from '@ionic/core/components/ion-card-content'
import { defineCustomElement as defineIonCardHeader } from '@ionic/core/components/ion-card-header'
import { defineCustomElement as defineIonCardSubtitle } from '@ionic/core/components/ion-card-subtitle'
import { defineCustomElement as defineIonCardTitle } from '@ionic/core/components/ion-card-title'
import { defineCustomElement as defineIonCard } from '@ionic/core/components/ion-card'
import { defineCustomElement as defineIonCheckbox } from '@ionic/core/components/ion-checkbox'
import { defineCustomElement as defineIonChip } from '@ionic/core/components/ion-chip'
import { defineCustomElement as defineIonCol } from '@ionic/core/components/ion-col'
import { defineCustomElement as defineIonContent } from '@ionic/core/components/ion-content'
import { defineCustomElement as defineIonDatetimeButton } from '@ionic/core/components/ion-datetime-button'
import { defineCustomElement as defineIonDatetime } from '@ionic/core/components/ion-datetime'
import { defineCustomElement as defineIonFabButton } from '@ionic/core/components/ion-fab-button'
import { defineCustomElement as defineIonFabList } from '@ionic/core/components/ion-fab-list'
import { defineCustomElement as defineIonFab } from '@ionic/core/components/ion-fab'
import { defineCustomElement as defineIonFooter } from '@ionic/core/components/ion-footer'
import { defineCustomElement as defineIonGrid } from '@ionic/core/components/ion-grid'
import { defineCustomElement as defineIonHeader } from '@ionic/core/components/ion-header'
import { defineCustomElement as defineIonImg } from '@ionic/core/components/ion-img'
import { defineCustomElement as defineIonInfiniteScrollContent } from '@ionic/core/components/ion-infinite-scroll-content'
import { defineCustomElement as defineIonInfiniteScroll } from '@ionic/core/components/ion-infinite-scroll'
import { defineCustomElement as defineIonInput } from '@ionic/core/components/ion-input'
import { defineCustomElement as defineIonItemDivider } from '@ionic/core/components/ion-item-divider'
import { defineCustomElement as defineIonItemGroup } from '@ionic/core/components/ion-item-group'
import { defineCustomElement as defineIonItemOption } from '@ionic/core/components/ion-item-option'
import { defineCustomElement as defineIonItemOptions } from '@ionic/core/components/ion-item-options'
import { defineCustomElement as defineIonItemSliding } from '@ionic/core/components/ion-item-sliding'
import { defineCustomElement as defineIonItem } from '@ionic/core/components/ion-item'
import { defineCustomElement as defineIonLabel } from '@ionic/core/components/ion-label'
import { defineCustomElement as defineIonListHeader } from '@ionic/core/components/ion-list-header'
import { defineCustomElement as defineIonList } from '@ionic/core/components/ion-list'
import { defineCustomElement as defineIonLoading } from '@ionic/core/components/ion-loading'
import { defineCustomElement as defineIonMenuButton } from '@ionic/core/components/ion-menu-button'
import { defineCustomElement as defineIonMenuToggle } from '@ionic/core/components/ion-menu-toggle'
import { defineCustomElement as defineIonMenu } from '@ionic/core/components/ion-menu'
import { defineCustomElement as defineIonModal } from '@ionic/core/components/ion-modal'
import { defineCustomElement as defineIonNavLink } from '@ionic/core/components/ion-nav-link'
import { defineCustomElement as defineIonNav } from '@ionic/core/components/ion-nav'
import { defineCustomElement as defineIonNote } from '@ionic/core/components/ion-note'
import { defineCustomElement as defineIonPickerColumnInternal } from '@ionic/core/components/ion-picker-column-internal'
import { defineCustomElement as defineIonPickerColumn } from '@ionic/core/components/ion-picker-column'
import { defineCustomElement as defineIonPickerInternal } from '@ionic/core/components/ion-picker-internal'
import { defineCustomElement as defineIonPicker } from '@ionic/core/components/ion-picker'
import { defineCustomElement as defineIonPopover } from '@ionic/core/components/ion-popover'
import { defineCustomElement as defineIonProgressBar } from '@ionic/core/components/ion-progress-bar'
import { defineCustomElement as defineIonRadioGroup } from '@ionic/core/components/ion-radio-group'
import { defineCustomElement as defineIonRadio } from '@ionic/core/components/ion-radio'
import { defineCustomElement as defineIonRange } from '@ionic/core/components/ion-range'
import { defineCustomElement as defineIonRefresherContent } from '@ionic/core/components/ion-refresher-content'
import { defineCustomElement as defineIonRefresher } from '@ionic/core/components/ion-refresher'
import { defineCustomElement as defineIonReorderGroup } from '@ionic/core/components/ion-reorder-group'
import { defineCustomElement as defineIonReorder } from '@ionic/core/components/ion-reorder'
import { defineCustomElement as defineIonRippleEffect } from '@ionic/core/components/ion-ripple-effect'
import { defineCustomElement as defineIonRow } from '@ionic/core/components/ion-row'
import { defineCustomElement as defineIonSearchbar } from '@ionic/core/components/ion-searchbar'
import { defineCustomElement as defineIonSegmentButton } from '@ionic/core/components/ion-segment-button'
import { defineCustomElement as defineIonSegment } from '@ionic/core/components/ion-segment'
import { defineCustomElement as defineIonSelectOption } from '@ionic/core/components/ion-select-option'
import { defineCustomElement as defineIonSelectPopover } from '@ionic/core/components/ion-select-popover'
import { defineCustomElement as defineIonSelect } from '@ionic/core/components/ion-select'
import { defineCustomElement as defineIonSkeletonText } from '@ionic/core/components/ion-skeleton-text'
import { defineCustomElement as defineIonSpinner } from '@ionic/core/components/ion-spinner'
import { defineCustomElement as defineIonSplitPane } from '@ionic/core/components/ion-split-pane'
import { defineCustomElement as defineIonTabBar } from '@ionic/core/components/ion-tab-bar'
import { defineCustomElement as defineIonTabButton } from '@ionic/core/components/ion-tab-button'
import { defineCustomElement as defineIonTab } from '@ionic/core/components/ion-tab'
import { defineCustomElement as defineIonTabs } from '@ionic/core/components/ion-tabs'
import { defineCustomElement as defineIonText } from '@ionic/core/components/ion-text'
import { defineCustomElement as defineIonTextarea } from '@ionic/core/components/ion-textarea'
import { defineCustomElement as defineIonThumbnail } from '@ionic/core/components/ion-thumbnail'
import { defineCustomElement as defineIonTitle } from '@ionic/core/components/ion-title'
import { defineCustomElement as defineIonToast } from '@ionic/core/components/ion-toast'
import { defineCustomElement as defineIonToggle } from '@ionic/core/components/ion-toggle'
import { defineCustomElement as defineIonToolbar } from '@ionic/core/components/ion-toolbar'
import { initialize } from '@ionic/core/components'
import { loadingController, modalController, pickerController, toastController, menuController } from '@ionic/core'

export const defineCustomElements = async () => {
  const cssModules = [
    style,
    core,
    normalize,
    structure,
    typography,
    padding,
    floatElements,
    textAlignment,
    textTransformation,
    flexUtils
  ]
  const styles: string[] = []
  for (const module of cssModules) {
    const css: string[] = []
    for (let index = 0; index < module.cssRules.length; index++) {
      const rule = module.cssRules.item(index)
      if (rule) {
        css.push(rule.cssText)
      }
    }
    styles.push(css.join(''))
  }
  const styleElement = document.createElement('style')
  styleElement.innerHTML = styles.join('\n')
  document.head.append(styleElement)
  const config = JSON.parse(localStorage.getItem('ion-config') || '{"mode":"md"}')
  Object.defineProperty(window, 'Ionic', { value: { config }, writable: true })
  defineIonAccordionGroup()
  defineIonAccordion()
  defineIonActionSheet()
  defineIonAlert()
  defineIonApp()
  defineIonAvatar()
  defineIonBackButton()
  defineIonBackdrop()
  defineIonBadge()
  defineIonBreadcrumb()
  defineIonBreadcrumbs()
  defineIonButton()
  defineIonButtons()
  defineIonCardContent()
  defineIonCardHeader()
  defineIonCardSubtitle()
  defineIonCardTitle()
  defineIonCard()
  defineIonCheckbox()
  defineIonChip()
  defineIonCol()
  defineIonContent()
  defineIonDatetimeButton()
  defineIonDatetime()
  defineIonFabButton()
  defineIonFabList()
  defineIonFab()
  defineIonFooter()
  defineIonGrid()
  defineIonHeader()
  defineIonImg()
  defineIonInfiniteScrollContent()
  defineIonInfiniteScroll()
  defineIonInput()
  defineIonItemDivider()
  defineIonItemGroup()
  defineIonItemOption()
  defineIonItemOptions()
  defineIonItemSliding()
  defineIonItem()
  defineIonLabel()
  defineIonListHeader()
  defineIonList()
  defineIonLoading()
  defineIonMenuButton()
  defineIonMenuToggle()
  defineIonMenu()
  defineIonModal()
  defineIonNavLink()
  defineIonNav()
  defineIonNote()
  defineIonPickerColumnInternal()
  defineIonPickerColumn()
  defineIonPickerInternal()
  defineIonPicker()
  defineIonPopover()
  defineIonProgressBar()
  defineIonRadioGroup()
  defineIonRadio()
  defineIonRange()
  defineIonRefresherContent()
  defineIonRefresher()
  defineIonReorderGroup()
  defineIonReorder()
  defineIonRippleEffect()
  defineIonRow()
  defineIonSearchbar()
  defineIonSegmentButton()
  defineIonSegment()
  defineIonSelectOption()
  defineIonSelectPopover()
  defineIonSelect()
  defineIonSkeletonText()
  defineIonSpinner()
  defineIonSplitPane()
  defineIonTabBar()
  defineIonTabButton()
  defineIonTab()
  defineIonTabs()
  defineIonText()
  defineIonTextarea()
  defineIonThumbnail()
  defineIonTitle()
  defineIonToast()
  defineIonToggle()
  defineIonToolbar()
  initialize()
  Object.defineProperty(window, 'loadingController', { value: loadingController, writable: false })
  Object.defineProperty(window, 'modalController', { value: modalController, writable: false })
  Object.defineProperty(window, 'pickerController', { value: pickerController, writable: false })
  Object.defineProperty(window, 'toastController', { value: toastController, writable: false })
  Object.defineProperty(window, 'menuController', { value: menuController, writable: false })
  // @ts-ignore
  const mod = await import('./../../../node_modules/@stencil/core/internal/client/index.js')
  mod.bootstrapLazy([])
}