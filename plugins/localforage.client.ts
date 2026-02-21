import localforage from 'localforage'

export default defineNuxtPlugin(() => {
  // Create two separate LocalForage instances
  // Instance 1: For storing individual question answers
  const nuxtLocalForage = localforage.createInstance({
    name: 'nuxtJS',
    storeName: 'nuxtLocalForage'
  })

  // Instance 2: For storing metadata (settings, exams)
  const meta = localforage.createInstance({
    name: 'meta',
    storeName: 'meta'
  })

  return {
    provide: {
      localForage: {
        nuxtLocalForage,
        meta
      }
    }
  }
})
