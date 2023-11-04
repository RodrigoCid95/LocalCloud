import { Manifest } from "interfaces/core"

export interface BuildArgs {
    input: string
    output: string
    manifest: Manifest
    zipper?: boolean
}
export interface BuilderLib {
    build(args: BuildArgs): Promise<void>
}
export interface BuilderClass {
    new(): BuilderLib
}