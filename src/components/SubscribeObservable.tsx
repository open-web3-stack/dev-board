import { useState, useEffect, ReactElement } from 'react'
import { Observable } from 'rxjs'

export type Props<T> = {
  value: Observable<T>;
  children: (value?: T) => ReactElement
}

function SubscribeObservable<T>({ value, children }: Props<T>) {
  const [val, setValue] = useState<T>()
  useEffect(() => {
    const sub = value.subscribe((v) => setValue(v))
    return () => sub.unsubscribe()
  }, [value])
  return children(val)
}

export default SubscribeObservable
