<template>
  <div class="page">
    <header class="top">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>User approvals</h2>
        <p class="sub">Review new registrations and set roles.</p>
      </div>
      <button class="ghost" @click="backToHome">
        <mdicon name="home" size="18" />
        <span>Home</span>
      </button>
    </header>

    <section class="stack">
      <div v-if="loading" class="hint">Loading users…</div>
      <div v-else-if="error" class="error-text">{{ error }}</div>
      <div v-else class="cards">
        <article class="user-card" v-for="u in users" :key="u.id">
          <div class="user-head">
            <div class="avatar">{{ initials(u.fullName) }}</div>
            <div>
              <p class="name">{{ u.fullName || 'Unknown' }}</p>
              <p class="meta">{{ formatDate(u.createdAt) }}</p>
            </div>
            <span class="pill" :class="u.role.toLowerCase()">{{ u.role }}</span>
          </div>
          <p class="email">{{ u.email || 'No email' }}</p>
          <div class="role-row">
            <label class="label">Role</label>
            <select v-model="draftRoles[u.id]" class="select">
              <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <button class="primary" :disabled="saving[u.id]" @click="changeRole(u.id)">
            {{ saving[u.id] ? 'Saving…' : 'Update role' }}
          </button>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Role } from '@/constants/enums'
import { API_BASE_URL } from '@/constants/config'

const router = useRouter()
const users = ref([])
const loading = ref(false)
const error = ref('')
const saving = ref({})
const draftRoles = ref({})
const roleOptions = [Role.GUEST, Role.USER, Role.ADMIN]

const token = localStorage.getItem('token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
})

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}
const initials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/users`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Failed to load users')
    users.value = data.users || []
    draftRoles.value = users.value.reduce((acc, u) => ({ ...acc, [u.id]: u.role }), {})
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const changeRole = async (id) => {
  const role = draftRoles.value[id]
  if (!role) return
  saving.value = { ...saving.value, [id]: true }
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/${id}/role`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ role })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Failed to update role')
    users.value = users.value.map((u) => u.id === id ? { ...u, role } : u)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = { ...saving.value, [id]: false }
  }
}

const backToHome = () => {
  router.push('/')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  display: grid;
  gap: 16px;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
}
h2 {
  margin: 2px 0;
  font-size: 20px;
}
.sub {
  margin: 0;
  color: #475569;
  font-size: 13px;
}
.ghost {
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}
.stack {
  display: grid;
  gap: 12px;
}
.cards {
  display: grid;
  gap: 12px;
}
.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
  display: grid;
  gap: 10px;
}
.user-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
}
.name {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}
.meta {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}
.email {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  word-break: break-word;
}
.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 11px;
  border: 1px solid #e2e8f0;
  text-transform: uppercase;
}
.pill.guest { background: #fff7ed; color: #c2410c; }
.pill.user { background: #e0f2fe; color: #0369a1; }
.pill.admin { background: #ecfdf3; color: #047857; }
.role-row {
  display: grid;
  gap: 6px;
}
.label {
  font-size: 12px;
  color: #475569;
  font-weight: 700;
}
.select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  background: #f8fafc;
}
.primary {
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}
.hint {
  padding: 12px 0;
  color: #475569;
  font-size: 13px;
}
.error-text {
  color: #e11d48;
  margin-top: 8px;
  font-size: 13px;
}
@media (max-width: 768px) {
  .page {
    padding: 16px;
  }
  .top {
    flex-direction: column;
    align-items: flex-start;
  }
  .ghost {
    width: 100%;
    justify-content: center;
  }
  .user-card {
    padding: 12px;
  }
  .avatar {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }
  .name {
    font-size: 15px;
  }
  h2 {
    font-size: 18px;
  }
}
</style>
