import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const appConfig = createTamagui(config)

export type AppConfig = typeof appConfig

declare module 'tamagui' {
  // overrides TamaguiCustomConfig so your custom types work everywhere
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig