export interface LibContext {
  logger: {
    log: (...args: any[]) => void
    error: (...args: any[]) => void
    warn: (...args: any[]) => void
    info: (...args: any[]) => void
    debug: (...args: any[]) => void
  }
}

export const getDefaultLibContext = (): LibContext => {
  return {
    logger: {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    },
  }
}
