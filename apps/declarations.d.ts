declare module "*.scss" {
  const content: CSSStyleSheet
  export default content
}
declare module "*.css" {
  const content: CSSStyleSheet
  export default content
}
declare module "*.html" {
  const content: string
  export default content
}
declare module "*.webp" {
  const content: string
  export default content
}
declare module "*.svg" {
  const content: string
  export default content
}
declare module "*.json" {
  const content: { default: any }
  export default content
}