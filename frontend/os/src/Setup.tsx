import { type FC, lazy, useState, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { Carousel, CarouselCard, CarouselSlider, CarouselViewport, makeStyles, Spinner, tokens } from "@fluentui/react-components"
import App from "./components/App"
import { type User, SetupContext, useSetupContext } from "./context/setup"

const SelectUser = lazy(() => import('./components/SelectUser'))
const Password = lazy(() => import('./components/Password'))
const Apps = lazy(() => import('./components/Apps'))
const Installation = lazy(() => import('./components/Installation'))
const useStyles = makeStyles({
  carousel: {
    width: '100%',
    maxWidth: '600px',
  },
  slide: {
    padding: tokens.spacingVerticalXXL
  }
})

const Form = () => {
  const styles = useStyles()
  const { activeIndex, setActiveIndex } = useSetupContext()

  return (
    <Carousel
      className={styles.carousel}
      activeIndex={activeIndex}
      groupSize={1}
    >
      <CarouselViewport>
        <CarouselSlider>
          <CarouselCard className={styles.slide}>
            <Suspense fallback={<Spinner />}>
              <SelectUser onNext={() => setActiveIndex(1)} />
            </Suspense>
          </CarouselCard>
          <CarouselCard className={styles.slide}>
            <Suspense fallback={<Spinner />}>
              <Password
                onPrev={() => setActiveIndex(0)}
                onNext={() => setActiveIndex(2)}
              />
            </Suspense>
          </CarouselCard>
          <CarouselCard className={styles.slide}>
            <Suspense fallback={<Spinner />}>
              <Apps
                onNext={() => setActiveIndex(3)}
              />
            </Suspense>
          </CarouselCard>
          <CarouselCard className={styles.slide}>
            <Suspense fallback={<Spinner />}>
              <Installation />
            </Suspense>
          </CarouselCard>
        </CarouselSlider>
      </CarouselViewport>
    </Carousel>
  )
}

const SetupContextProvider: FC<SetupContextProvider> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [user, setUser] = useState<User>({
    name: '',
    existent: false
  })
  const [password, setPassword] = useState('')
  const [uid, setUid] = useState(0)
  const [files, setFiles] = useState<File[]>([])

  return (
    <SetupContext.Provider value={{ activeIndex, setActiveIndex, user, setUser, password, setPassword, uid, setUid, files, setFiles }}>
      {children}
    </SetupContext.Provider>
  )
}

interface SetupContextProvider {
  children: React.ReactNode
}

document.addEventListener('DOMContentLoaded', () => createRoot(document.getElementById('root')!).render(
  <App>
    <SetupContextProvider>
      <Form />
    </SetupContextProvider>
  </App>,
))