<script lang="ts">
  let email = '';
  let password = '';
  let errorMessage = '';
  let isLoading = false;

  async function handleLogin() {
    errorMessage = '';
    
    if (!email || !password) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    isLoading = true;

    setTimeout(() => {
      console.log('Login attempt:', { email, password });
      isLoading = false;
      alert('Login functionality will be connected to backend');
    }, 1000);
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-blue-600 mb-2">Mental Health Tracker</h1>
      <p class="text-gray-600">Sign in to continue</p>
    </div>

    {#if errorMessage}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {errorMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleLogin}>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          bind:value={email}
          disabled={isLoading}
          required
        />
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          bind:value={password}
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {#if isLoading}
          Signing in...
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <div class="mt-6 pt-6 border-t border-gray-200 text-center">

    </div>
  </div>
</div>
