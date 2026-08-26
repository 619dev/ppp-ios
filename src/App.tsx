import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { hydrateEncryptedMessageCache, useStore } from './store'
import { useSocket } from './hooks/useSocket'
import { ensureIdentityKeys } from './crypto/identity'
import { hydrateSenderKeys } from './crypto/groupCrypto'
import { getPresentationSettings, handlePresentationAppState, hydratePresentationCrypto, isPresentationUnlocked, presentationCiphertextForPlaintext, unlockPresentationCrypto } from './crypto/presentationCrypto'
import { applyNativeProxy } from './api/proxy-bridge'
import Login from './pages/Login'
import Chats from './pages/Chats'
import Chat from './pages/Chat'
import Contacts from './pages/Contacts'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import GroupInfo from './pages/GroupInfo'
import Moments from './pages/Moments'
import Timeline from './pages/Timeline'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import ShareTarget from './pages/ShareTarget'
import TabBar from './components/TabBar'
import CallOverlay from './components/CallOverlay'
import GroupCallOverlay from './components/GroupCallOverlay'
import NotificationToast from './components/NotificationToast'
import { CallProvider } from './contexts/CallContext'
import { GroupCallProvider } from './contexts/GroupCallContext'
import { registerServiceWorker, subscribePush, isPushSubscribed } from './api/push'
import { initOneSignal, loginOneSignal } from './api/onesignal'
import { get, post } from './api/http'
import { isNativePlatform } from './utils/platform'
import { initNativePush } from './api/nativePush'
import { initLocalNotifications } from './api/localNotification'
import { setAppBadgeCount } from './api/appBadge'
import { useAutoDeleteCleanup } from './hooks/useAutoDeleteCleanup'
import { getPendingSharedFile } from './api/sharedFile'
import { useI18n } from './hooks/useI18n'

function ProtectedLayout() {
  useSocket()
  useAutoDeleteCleanup()
  const totalUnread = useStore(state =>
    Object.values(state.unread).reduce((total, count) => total + count, 0)
  )

  // iOS does not derive its home-screen badge from our React state. Keep the
  // native badge synchronized whenever a message is received or a chat is read.
  useEffect(() => {
    setAppBadgeCount(totalUnread)
  }, [totalUnread])

  // Auto-subscribe to push notifications when authenticated
  useEffect(() => {
    if (isNativePlatform()) {
      // ── Capacitor Native: use APNS via Capacitor Push ──
      initNativePush().catch(e => console.warn('[NativePush] Init failed:', e))
      // ── Local Notifications: for showing system banners from WebSocket messages ──
      // Works in the simulator too (unlike APNS remote push)
      initLocalNotifications().catch(e => console.warn('[LocalNotification] Init failed:', e))
    } else {
      // ── Web/PWA: use Service Worker + Web Push + OneSignal ──
      registerServiceWorker().then(() => {
        console.log('[Push] Service worker ready')
      }).catch(() => {})

      // Web Push (VAPID)
      ;(async () => {
        try {
          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission()
          }
          if ('Notification' in window && Notification.permission === 'granted') {
            const alreadySub = await isPushSubscribed()
            if (!alreadySub) {
              const ok = await subscribePush()
              if (ok) console.log('[Push] Web Push subscribed successfully')
            }
          }
        } catch (e) {
          console.warn('[Push] Web Push subscription failed:', e)
        }
      })()

      // OneSignal Web SDK v16
      ;(async () => {
        try {
          const token = useStore.getState().token
          if (!token) return
          const userId = getUserIdFromToken(token)
          if (!userId) return
          const ok = await initOneSignal()
          if (ok) {
            await loginOneSignal(userId)
            console.log('[OneSignal] ✅ Web SDK v16 fully initialized')
          }
        } catch (e) {
          console.warn('[OneSignal] Web SDK init failed:', e)
        }
      })()

      // OneSignal Median.co native wrapper fallback
      let attempt = 0
      const maxAttempts = 20
      const tryRegisterMedian = () => {
        const w = window as any
        if (w.median?.onesignal?.onesignalInfo) {
          w.median.onesignal.onesignalInfo((info: any) => {
            if (info?.oneSignalUserId) {
              post('/api/push/onesignal', {
                player_id: info.oneSignalUserId,
                platform: info.platform || 'ios',
              }).catch(() => {})
            }
          })
        } else if (w.gonative?.onesignal?.onesignalInfo) {
          w.gonative.onesignal.onesignalInfo((info: any) => {
            if (info?.oneSignalUserId) {
              post('/api/push/onesignal', {
                player_id: info.oneSignalUserId,
                platform: info.platform || 'ios',
              }).catch(() => {})
            }
          })
        } else {
          attempt++
          if (attempt < maxAttempts) setTimeout(tryRegisterMedian, 500)
        }
      }
      tryRegisterMedian()

    }
  }, [])



  return (
    <CallProvider>
      <GroupCallProvider>
        <Routes>
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/group/:id" element={<GroupInfo />} />
          <Route path="/moments" element={<Moments />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/share" element={<ShareTarget />} />
          <Route path="*" element={<Navigate to="/chats" replace />} />
        </Routes>
        <TabBar />
        <CallOverlay />
        <GroupCallOverlay />
        <NotificationToast />
      </GroupCallProvider>
    </CallProvider>
  )
}

export default function App() {
  const token = useStore(s => s.token)
  const user = useStore(s => s.user)
  const theme = useStore(s => s.theme)
  const [hydratedAccount, setHydratedAccount] = useState<string | null>(null)
  const [secureHydrationError, setSecureHydrationError] = useState<string | null>(null)
  const [showPresentationUnlock, setShowPresentationUnlock] = useState(false)
  const [presentationPassword, setPresentationPassword] = useState('')
  const [presentationUnlockError, setPresentationUnlockError] = useState('')
  const [presentationUnlockBusy, setPresentationUnlockBusy] = useState(false)
  const { t } = useI18n()

  const syncPresentationUnlockPrompt = () => {
    const shouldPrompt = Boolean(useStore.getState().token && useStore.getState().user?.id)
      && getPresentationSettings().enabled
      && !isPresentationUnlocked()
    setShowPresentationUnlock(shouldPrompt)
    if (!shouldPrompt) {
      setPresentationPassword('')
      setPresentationUnlockError('')
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Do not mount chats/socket code until all sensitive state has been restored
  // from Keychain and the authenticated local cache has been opened.
  useEffect(() => {
    let cancelled = false
    if (!token || !user?.id) {
      setHydratedAccount(null)
      setSecureHydrationError(null)
      return
    }
    setSecureHydrationError(null)
    Promise.all([
      ensureIdentityKeys(user.id),
      hydrateSenderKeys(user.id),
      hydratePresentationCrypto(user.id),
      hydrateEncryptedMessageCache(user.id),
    ]).then(([keys]) => {
      if (!keys) throw new Error('Identity keys are unavailable')
      if (!cancelled) {
        syncPresentationUnlockPrompt()
        setHydratedAccount(user.id)
      }
    }).catch(err => {
      console.error('[App] Secure state hydration failed:', err)
      if (!cancelled) {
        setHydratedAccount(null)
        setSecureHydrationError(err instanceof Error ? err.message : String(err))
      }
    })
    return () => { cancelled = true }
  }, [token, user?.id])

  const unlockPresentationAtStartup = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!presentationPassword || presentationUnlockBusy) return
    setPresentationUnlockBusy(true)
    setPresentationUnlockError('')
    try {
      if (await unlockPresentationCrypto(presentationPassword)) {
        setShowPresentationUnlock(false)
        setPresentationPassword('')
      } else {
        setPresentationUnlockError(t('chat.presentation_startup_wrong_password'))
      }
    } finally {
      setPresentationUnlockBusy(false)
    }
  }

  const cancelPresentationUnlock = () => {
    setShowPresentationUnlock(false)
    setPresentationPassword('')
    setPresentationUnlockError('')
  }

  useEffect(() => {
    const onVisibility = () => handlePresentationAppState(document.visibilityState === 'visible')
    const onPresentationState = () => {
      syncPresentationUnlockPrompt()
      if (!isPresentationUnlocked()) {
        const messages = useStore.getState().messages
        useStore.setState({ messages: Object.fromEntries(Object.entries(messages).map(([chatId, items]) => [
          chatId, items.map(({ decrypted, ...message }) => ({ ...message, ...(presentationCiphertextForPlaintext(decrypted) ? { decrypted: presentationCiphertextForPlaintext(decrypted) } : {}) })),
        ])) })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('paperphone:presentation-state-changed', onPresentationState)
    let removeNative: (() => void) | undefined
    import('@capacitor/app').then(({ App: CapApp }) => CapApp.addListener('appStateChange', ({ isActive }) => handlePresentationAppState(isActive)))
      .then(handle => { removeNative = () => void handle.remove() }).catch(() => {})
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('paperphone:presentation-state-changed', onPresentationState)
      removeNative?.()
    }
  }, [])

  // Apply persisted proxy settings on app startup (native iOS)
  useEffect(() => {
    const { proxyList, activeProxyId } = useStore.getState()
    if (activeProxyId) {
      const activeProxy = proxyList.find(p => p.id === activeProxyId)
      if (activeProxy && activeProxy.host && activeProxy.port) {
        applyNativeProxy(activeProxy)
      }
    }
  }, [])

  // ── Capacitor: Deep Link handler ──
  // Handles paperphone:// URLs to navigate within the app
  useEffect(() => {
    if (!isNativePlatform()) return
    let cleanup: (() => void) | undefined
    import('@capacitor/app').then(({ App: CapApp }) => {
      const openDeepLink = (eventUrl: string) => {
        console.log('[DeepLink] URL opened:', eventUrl)
        // paperphone://chat/123  → /chat/123
        // paperphone://user/abc  → /user/abc
        // paperphone://add-friend?id=xxx → /contacts?add=xxx
        try {
          const url = new URL(eventUrl)
          const path = url.host + (url.pathname || '')
          if (path) {
            window.location.href = '/' + path.replace(/^\/+/, '')
          }
        } catch {
          // Fallback: strip scheme and navigate
          const path = eventUrl.replace(/^paperphone:\/\//, '')
          if (path) window.location.href = '/' + path
        }
      }
      const listener = CapApp.addListener('appUrlOpen', event => openDeepLink(event.url))
      CapApp.getLaunchUrl().then(event => { if (event?.url) openDeepLink(event.url) })
      cleanup = () => { listener.then(l => l.remove()) }
    })
    return () => { cleanup?.() }
  }, [])

  // Share extensions are not guaranteed to be allowed to launch their
  // containing app. If iOS requires the user to open us manually, resume the
  // pending handoff as soon as the app becomes active.
  useEffect(() => {
    if (!isNativePlatform() || !token || hydratedAccount !== user?.id) return
    let cleanup: (() => void) | undefined
    const resumePendingShare = async () => {
      if (window.location.pathname === '/share' || new URLSearchParams(window.location.search).get('share') === '1') return
      if (await getPendingSharedFile()) window.location.href = '/share'
    }
    resumePendingShare().catch(() => undefined)
    import('@capacitor/app').then(({ App: CapApp }) => {
      const listener = CapApp.addListener('appStateChange', state => {
        if (state.isActive) resumePendingShare().catch(() => undefined)
      })
      cleanup = () => { listener.then(item => item.remove()) }
    })
    return () => cleanup?.()
  }, [hydratedAccount, token, user?.id])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/chats" replace /> : <Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/*" element={token ? (
          hydratedAccount === user?.id
            ? <ProtectedLayout />
            : secureHydrationError
              ? <div className="empty-state">
                  <div>安全密钥加载失败，请关闭并重新打开应用。</div>
                  {import.meta.env.DEV && <div style={{ marginTop: 12, padding: '0 20px', fontSize: 12, wordBreak: 'break-word' }}>{secureHydrationError}</div>}
                </div>
              : null
        ) : <Navigate to="/login" replace />} />
      </Routes>
      {showPresentationUnlock && (
        <div className="modal-overlay" role="presentation">
          <form className="modal" role="dialog" aria-modal="true" aria-labelledby="presentation-startup-title" onSubmit={unlockPresentationAtStartup}>
            <h2 id="presentation-startup-title" style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
              {t('profile.message_privacy')}
            </h2>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label htmlFor="presentation-startup-password">{t('chat.presentation_startup_password_prompt')}</label>
              <input
                className="input"
                id="presentation-startup-password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={presentationPassword}
                onChange={event => {
                  setPresentationPassword(event.target.value)
                  if (presentationUnlockError) setPresentationUnlockError('')
                }}
              />
            </div>
            {presentationUnlockError && (
              <div role="alert" style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
                {presentationUnlockError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-full" onClick={cancelPresentationUnlock} disabled={presentationUnlockBusy}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-full" disabled={!presentationPassword || presentationUnlockBusy}>
                {presentationUnlockBusy ? t('common.loading') : t('common.confirm')}
              </button>
            </div>
          </form>
        </div>
      )}
    </BrowserRouter>
  )
}

/**
 * Decode user_id from a JWT token without a library.
 * JWT format: header.payload.signature — we only need the payload.
 */
function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.id || payload.sub || null
  } catch {
    return null
  }
}
