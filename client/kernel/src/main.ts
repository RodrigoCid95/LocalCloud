(async () => {
  const { default: KernelClass } = await import('./lib/Kernel')
  window.kernel = new KernelClass()
})()