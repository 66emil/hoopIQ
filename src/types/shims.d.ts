// Minimal ambient declarations to satisfy TypeScript in environments
// where node_modules are not installed during linting.

declare module 'react' {
  // Value export for default import
  const React: any;
  export default React;

  // Hooks (typed minimally to avoid implicit any in setState callbacks)
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useRef<T>(initialValue: T | null): { current: T | null };

  // Component types
  export type FC<P = {}> = (props: P) => any;
  export type FunctionComponent<P = {}> = FC<P>;
}

// Support for React namespace types used in annotations like React.FormEvent
declare namespace React {
  interface FormEvent<T = any> {
    preventDefault: () => void;
  }
  interface ChangeEvent<T = any> {
    target: any;
  }
  type FC<P = {}> = (props: P) => any;
}

// JSX IntrinsicElements to prevent "no JSX.IntrinsicElements" errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Stubs for automatic JSX runtime modules used by tsconfig jsx: react-jsx
declare module 'react/jsx-runtime' {
  const jsxRuntime: any;
  export default jsxRuntime;
}
declare module 'react/jsx-dev-runtime' {
  const jsxDevRuntime: any;
  export default jsxDevRuntime;
}

// Minimal stubs for lucide-react icons used in the project
declare module 'lucide-react' {
  export const Trophy: any;
  export const User: any;
  export const BookOpen: any;
  export const Video: any;
  export const Settings: any;
  export const Plus: any;
  export const Edit: any;
  export const Trash2: any;
  export const Save: any;
  export const X: any;
  export const Upload: any;
  export const Play: any;
  export const ListPlus: any;
  export const CheckCircle: any;
  export const XCircle: any;
  export const Award: any;
  export const ChevronDown: any;
  export const ChevronUp: any;
  export const Star: any;
}


