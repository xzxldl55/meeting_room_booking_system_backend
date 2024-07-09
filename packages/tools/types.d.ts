import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    hideErrorMessage?: boolean;
  }
}