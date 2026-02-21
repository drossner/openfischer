export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  // Use private runtime config (available at runtime from env vars on server)
  // NOT config.public (which is baked in at build time in SPA mode)
  return {
    googleClientId: config.googleClientId
  }
})
