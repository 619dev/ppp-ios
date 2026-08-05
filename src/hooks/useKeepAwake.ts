import { registerPlugin } from '@capacitor/core'
import { useEffect } from 'react'

interface KeepAwakePlugin {
  setEnabled(options: { enabled: boolean }): Promise<void>
}

const KeepAwake = registerPlugin<KeepAwakePlugin>('KeepAwake')
let activeCallCount = 0

async function updateIdleTimer() {
  try {
    await KeepAwake.setEnabled({ enabled: activeCallCount > 0 })
  } catch (error) {
    // The plugin is iOS-only; browser builds should continue to work normally.
    console.debug('[KeepAwake] Native idle timer control unavailable:', error)
  }
}

/** Prevents iOS auto-lock while this call lifecycle is active. */
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return

    activeCallCount += 1
    void updateIdleTimer()

    return () => {
      activeCallCount = Math.max(0, activeCallCount - 1)
      void updateIdleTimer()
    }
  }, [active])
}
