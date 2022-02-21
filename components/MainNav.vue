<template>
  <b-container>
    <b-navbar type="light" variant="light" class="mb-3">
      <b-navbar-nav>
        <b-nav-item :to="{ path: '/' }">Home</b-nav-item>

        <!-- Navbar dropdowns -
        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">ES</b-dropdown-item>
          <b-dropdown-item href="#">RU</b-dropdown-item>
          <b-dropdown-item href="#">FA</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown text="User" right>
          <b-dropdown-item href="#">Account</b-dropdown-item>
          <b-dropdown-item href="#">Settings</b-dropdown-item>
        </b-nav-item-dropdown> -->
      </b-navbar-nav>
    </b-navbar>
    <slot></slot>
  </b-container>
</template>

<script>
export default {
  name: "MainNav"
}
</script>

<style scoped>

</style>
