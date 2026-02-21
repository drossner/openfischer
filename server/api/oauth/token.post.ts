export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { code, redirect_uri, grant_type, refresh_token } = body

  // Build request body for Google OAuth
  const tokenBody: Record<string, string> = {
    client_id: config.googleClientId, // Use private runtime config (available at runtime)
    client_secret: config.googleClientSecret, // Server-side only, never exposed
    grant_type
  }

  if (grant_type === 'authorization_code') {
    tokenBody.code = code
    tokenBody.redirect_uri = redirect_uri
  } else if (grant_type === 'refresh_token') {
    tokenBody.refresh_token = refresh_token
  }

  const formBody = new URLSearchParams(tokenBody).toString()

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: formBody
    })

    const data = await response.json()

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: data.error_description || 'OAuth token exchange failed'
      })
    }

    return data
  } catch (error: any) {
    console.error('OAuth token exchange error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to exchange OAuth token'
    })
  }
})
