<template>
  <MainNav>
    <Question :question="question"></Question>
  </MainNav>
</template>

<script>
export default {
  async asyncData ({ $content, app, params, error }) {
    const path = `/${params.pathMatch || 'index'}`
    const [question] = await $content({ deep: true }).where({ path }).fetch()

    if (!question) {
      return error({ statusCode: 404, message: 'question not found' })
    }

    return {
      question
    }
  }
}
</script>
