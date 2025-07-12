declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type FC<P = any> = (props: P) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type SVGProps<T> = any
  export function useState<T>(initial: T): [T, (v: T) => void]
  export function useRef<T>(initial: T | null): { current: T | null }
  export function useCallback<F extends (...args: any[]) => any>(
    fn: F,
    deps: any[],
  ): F
  // other React exports not needed for type-check
}