import { IKernel } from "builder/types/kernel";

declare global {
  interface Window {
    kernel: IKernel
  }
}