import React, { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'en' | 'ur'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  isUrdu: boolean
  t: (en: string, ur: string) => string
  dir: 'ltr' | 'rtl'
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('qasmia_lang') as Lang) || 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('qasmia_lang', l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr'
  }

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
  }, [lang])

  const t = (en: string, ur: string) => lang === 'ur' ? ur : en
  const isUrdu = lang === 'ur'
  const dir: 'ltr' | 'rtl' = lang === 'ur' ? 'rtl' : 'ltr'

  return (
    <LangContext.Provider value={{ lang, setLang, isUrdu, t, dir }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
