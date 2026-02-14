/* eslint-disable prefer-promise-reject-errors */
type Options = {
  signal?: AbortSignal
}
export const sleep = (ms: number, { signal }: Options = {}) => {
  if (ms <= 0) {
    return
  }

  return new Promise<boolean>((resolve, reject) => {
    if (signal?.aborted) {
      reject(false)
      return
    }

    const timeoutId = setTimeout(() => resolve(true), ms)

    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId)
      reject(false)
    })
  })
}

