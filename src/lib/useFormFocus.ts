'use client'

import { useEffect, useState } from 'react'

const FORM_FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

// true, пока фокус внутри поля формы — на таче iOS-клавиатура иногда двигает
// fixed-элементы (bottom nav/FAB) вместе с вьюпортом, поэтому на время ввода
// их лучше прятать, а не оставлять наезжать на поля/кнопку отправки.
export function useFormFocus(): boolean {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const isFormField = (target: EventTarget | null) =>
      target instanceof HTMLElement && FORM_FIELD_TAGS.has(target.tagName)
    const onFocusIn = (e: FocusEvent) => {
      if (isFormField(e.target)) setIsFocused(true)
    }
    const onFocusOut = (e: FocusEvent) => {
      if (isFormField(e.target)) setIsFocused(false)
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return isFocused
}
