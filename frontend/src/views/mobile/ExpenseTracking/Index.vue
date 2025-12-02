<template>
<div class="page">
    <header class="top-nav">
        <button class="icon-btn" @click="router.push('/')">
            <mdicon name="chevron-left" size="24" />
        </button>
        <div class="title-group">
            <p class="eyebrow">My wallet</p>
            <h3>Expense Tracking</h3>
        </div>
        <button class="quick-pill" @click="openExpenseSheet">
            <mdicon name="magic-staff" size="18" />
            <span>Quick add</span>
        </button>
    </header>

    <!-- HOME TAB -->
    <main class="content" v-if="activeTab === 'home'">
        <section class="summary-grid">
            <div class="card primary">
                <p class="label">This month</p>
                <h2>$1,240</h2>
                <p class="sub">-12% vs last month</p>
            </div>
            <div class="card budget-card">
                <div class="budget-head">
                    <div class="label-row">
                        <p class="label">Budgets</p>
                        <button class="inline-pill" @click="openBudgetSheet">
                            <mdicon name="plus-circle" size="18" />
                            <span>New budget</span>
                        </button>
                    </div>
                    <h4 class="budget-amount">{{ activeBudgetAmount }}</h4>
                    <p class="sub">{{ budgets.length }} active budgets</p>
                </div>

                <div v-if="budgets.length" class="budget-carousel-wrapper">
                    <div
                        class="budget-carousel"
                        ref="budgetCarousel"
                        @scroll.passive="onBudgetScroll"
                    >
                        <div
                            class="budget-slide"
                            v-for="(item, idx) in budgets"
                            :key="item.id || idx"
                        >
                            <div class="row">
                                <div>
                                    <p class="item-title">{{ item.name }}</p>
                                    <p class="item-sub">
                                        {{ item.currency || defaultCurrency }} {{ item.amount }} •
                                        {{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}
                                    </p>
                                </div>
                                <span class="pill ghost">{{ item.categoryId ? 'Category' : 'General' }}</span>
                            </div>
                            <div class="progress big">
                                <div class="bar gradient" :style="{ width: '45%' }"></div>
                            </div>
                            <p class="sub">Remaining insight coming soon</p>
                        </div>
                    </div>
                    <div class="budget-controls" v-if="budgets.length > 1">
                        <div class="dots">
                            <span
                                v-for="(item, idx) in budgets"
                                :key="item.id || idx"
                                :class="{ active: budgetActiveIndex === idx }"
                                class="dot"
                            ></span>
                        </div>
                        <div class="arrows">
                            <button class="icon-btn ghost" @click="scrollBudget(-1)">
                                <mdicon name="chevron-left" size="20" />
                            </button>
                            <button class="icon-btn ghost" @click="scrollBudget(1)">
                                <mdicon name="chevron-right" size="20" />
                            </button>
                        </div>
                    </div>
                </div>
                <p v-else class="sub">No budgets yet. Create one to stay on track.</p>
            </div>
            <div class="card" @click="setTab('schedules')">
                <div class="row">
                    <div class="d-flex flex-row justify-content-between">
                        <p class="label">Subscriptions</p>
                        <h4>{{ formatMoney(defaultCurrency, subscriptionTotal) }}</h4>
                        <!-- <span class="sub">{{ schedules.length }} active</span> -->
                    </div>
                </div>
                <ul class="mini-list" v-if="schedules.length">
                    <li v-for="(item, idx) in schedules.slice(0,3)" :key="item.id" class="mini-pill">
                        <span class="dot" :class="subscriptionDot(idx)"></span>
                        <span class="mini-title">{{ item.title }} - </span>
                        <span class="mini-amount">{{ item.amount }}</span>
                    </li>
                </ul>
                <p v-else class="sub">No subscriptions yet.</p>
            </div>
        </section>

        <section class="section">
            <div class="section-head">
                <h4>Recent activity</h4>
                <button class="text-btn" @click="setTab('home'); loadExpenses()">Refresh</button>
            </div>
            <div class="list" v-if="expenses.length">
                <div class="item" v-for="exp in expenses.slice(0,5)" :key="exp.id">
                    <div class="icon-circle"
                        :style="{
                            background: exp.categoryColor || '#e2e8f0',
                            color: exp.categoryColor ? '#fff' : '#0f172a'
                        }"
                    >
                        <mdicon :name="exp.categoryIcon || 'cash-multiple'" size="20" />
                    </div>
                    <div class="item-main">
                        <p class="item-title">{{ exp.title }}</p>
                        <p class="item-sub">
                            {{ formatDate(exp.expenseDate) }}
                        </p>
                    </div>
                    <div class="item-amount"> {{ formatMoney(defaultCurrency,exp.amount) }}</div>
                </div>
            </div>
            <p v-else class="sub">No expenses yet.</p>

            <div class="insights-cta">
                <div>
                    <p class="label">Insights</p>
                    <h4>See trends & tips</h4>
                    <p class="sub">Spending pulse, categories, and smart alerts.</p>
                </div>
                <button class="inline-pill" @click="setTab('insights')">
                    <mdicon name="chart-line" size="18" />
                    <span>View insights</span>
                </button>
            </div>
        </section>
    </main>


    <!-- SCHEDULES TAB -->
    <main class="content" v-else-if="activeTab === 'schedules'">
        <section class="hero-schedules">
            <div>
                <p class="eyebrow">Upcoming</p>
                <h2>{{ formatMoney(defaultCurrency, scheduleTotal) }}</h2>
                <p class="sub">Across {{ filteredSchedules.length }} items</p>
            </div>
            <button class="primary-chip" @click="openScheduleSheet">
                <mdicon name="plus-circle-outline" size="18" />
                <span>New schedule</span>
            </button>
        </section>

        <section class="section schedule-toggle">
            <button
                class="toggle-pill"
                :class="{ active: scheduleFilter === 'subscriptions' }"
                @click="scheduleFilter = 'subscriptions'"
            >
                Subscriptions
            </button>
            <button
                class="toggle-pill"
                :class="{ active: scheduleFilter === 'expenses' }"
                @click="scheduleFilter = 'expenses'"
            >
                Expenses
            </button>
        </section>

        <section class="section schedule-list">
            <div class="schedule-card" v-for="item in filteredSchedules" :key="item.id">
                <div class="row schedule-row">
                    <div class="badge" :class="item.badgeClass">{{ item.when }}</div>
                    <div class="schedule-right">
                        <button class="pill ghost toggle-auto" @click="toggleAutoPay(item)">
                            <mdicon :name="item.autoPay ? 'toggle-switch' : 'toggle-switch-off'" size="18" />
                            <span>{{ item.autoPay ? 'Auto-pay' : 'Reminder' }}</span>
                        </button>
                    <div class="schedule-actions">
                        <button class="icon-btn ghost small" @click="startEditSchedule(item)">
                            <mdicon name="pencil-outline" size="18" />
                        </button>
                        <button class="icon-btn ghost small danger" @click="removeSchedule(item)">
                            <mdicon name="trash-can-outline" size="18" />
                        </button>
                        <button
                            v-if="scheduleFilter === 'subscriptions'"
                            class="pill tiny-pill"
                            :class="{ success: item.paid }"
                            @click="paySubscription(item)"
                        >
                            <mdicon :name="item.paid ? 'check-circle' : 'check-circle-outline'" size="16" />
                            <span>{{ item.paid ? 'Paid' : 'Pay' }}</span>
                        </button>
                    </div>
                </div>
                </div>
                <div class="schedule-main">
                    <div class="icon-circle" :class="item.badgeClass">
                        <mdicon :name="item.icon" size="20" />
                    </div>
                    <div>
                        <p class="item-title">{{ item.title }}</p>
                        <p class="item-sub">{{ item.subtitle }}</p>
                    </div>
                    <div class="item-amount">- {{ item.amount }}</div>
                </div>
            </div>
        </section>
    </main>

    <!-- TRANSACTIONS TAB -->
    <main class="content" v-else-if="activeTab === 'transactions'">
        <section class="transactions-header">
            <div class="months" @touchstart="onMonthTouchStart" @touchend="onMonthTouchEnd">
                <span class="month muted" @click="changeMonth(-1)">{{ monthLabel(-1) }}</span>
                <span class="month current">{{ monthLabel(0) }}</span>
                <span class="month muted" @click="changeMonth(1)">{{ monthLabel(1) }}</span>
            </div>
        </section>
        <transition name="month-slide" mode="out-in">
            <div class="transactions-pane" :key="viewMonthKey">
                <div class="summary-bar">
                    <div class="flow out">- {{ formatMoney(defaultCurrency, transactionOut) }}</div>
                    <div class="flow in">+ {{ formatMoney(defaultCurrency, transactionIn) }}</div>
                    <div class="flow net">= {{ formatMoney(defaultCurrency, transactionNet) }}</div>
                </div>

                <section class="transactions-list section" v-if="displayedExpenses.length > 0">
                    <p class="transactions-date">{{ todayLabel }}</p>
                    <transition-group name="month-slide" tag="div">
                        <div class="item compact-item mt-1 swipeable" v-for="exp in displayedExpenses" :key="exp.id">
                            <div class="icon-circle"
                                :style="{
                                    background: exp.categoryColor || '#e2e8f0',
                                    color: exp.categoryColor ? '#fff' : '#0f172a'
                                }"
                            >
                                <mdicon :name="exp.categoryIcon || 'cash-multiple'" size="20" />
                            </div>
                            <div class="item-main">
                                <p class="item-title">{{ exp.title }}</p>
                                <p class="item-sub light">{{ formatDate(exp.expenseDate) }}</p>
                            </div>
                            <div class="item-amount">- {{ formatMoney(exp.currency || defaultCurrency, exp.amount) }}</div>
                            <div class="swipe-actions">
                                <button class="pill tiny-pill danger" @click="handleDeleteExpense(exp)">
                                    <mdicon name="trash-can-outline" size="16" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </transition-group>
                    <div class="transaction-footer">
                        <p class="sub">Total cash flow: {{ defaultCurrency }} {{ transactionNet }}</p>
                        <p class="sub">{{ displayedExpenses.length }} transactions</p>
                    </div>
                </section>
                <p v-else class="sub">No transactions yet.</p>
           </div>
        </transition>
        <button class="fab" @click="openExpenseSheet">
            <mdicon name="plus" size="24" />
        </button>
    </main>

    <main class="content" v-else-if="activeTab === 'profile'">
        <section class="profile-hero">
            <div class="avatar">
                <span>AR</span>
            </div>
            <div class="profile-meta">
                <h3>Alex Rivera</h3>
                <p class="sub">Premium • Since 2023</p>
            </div>
            <button class="icon-btn ghost">
                <mdicon name="pencil-outline" size="20" />
            </button>
        </section>

        <section class="section profile-cards">
            <div class="card profile-card">
                <div class="row">
                    <div>
                        <p class="label">Expense categories</p>
                        <h4>{{ categories.length }} categories</h4>
                        <p class="sub" v-if="categories.length">Tap to add or edit categories</p>
                        <p class="sub" v-else>No categories yet</p>
                    </div>
                    <button class="primary-chip ghost-chip" @click="openAddCategory">
                        <mdicon name="plus-circle-outline" size="18" />
                        <span>Add</span>
                    </button>
                </div>
                <div class="chips">
                    <span
                        v-for="cat in categories"
                        :key="cat.id || cat.name"
                        class="pill ghost chip-with-icon"
                        :style="{ borderColor: cat.color || '#e2e8f0' }"
                    >
                        <mdicon
                            :name="cat.icon || 'label-outline'"
                            size="16"
                            :style="{ color: cat.color || '#475569' }"
                        />
                        {{ cat.name }}
                    </span>
                </div>
            </div>

            <div class="card profile-card">
                <div class="row">
                    <div>
                        <p class="label">Currency & accounts</p>
                        <h4>{{ defaultCurrency }} • {{ accounts.length }} accounts</h4>
                        <p class="sub">
                            Default account: {{ defaultAccountName || 'None' }}
                        </p>
                    </div>
                    <button class="text-btn" @click="router.push('/expense-tracking/accounts')">Manage</button>
                </div>
                <div class="chips">
                    <span
                        v-for="cur in currencies"
                        :key="cur.id || cur.code"
                        class="pill ghost chip-with-icon"
                        :style="{ borderColor: cur.isDefault ? '#4f46e5' : '#e2e8f0', color: '#0f172a' }"
                    >
                        <mdicon :name="cur.isDefault ? 'star' : 'cash-multiple'" size="16" :style="{ color: cur.isDefault ? '#4f46e5' : '#475569' }" />
                        {{ cur.code }}
                    </span>
                    <span
                        v-for="acct in accounts"
                        :key="acct.id || acct.name"
                        class="pill ghost chip-with-icon"
                        :style="{ borderColor: acct.isDefault ? '#22c55e' : '#e2e8f0', color: '#0f172a' }"
                    >
                        <mdicon :name="acct.isDefault ? 'star' : 'credit-card-outline'" size="16" :style="{ color: acct.isDefault ? '#22c55e' : '#475569' }" />
                        {{ acct.name }}
                    </span>
                </div>
            </div>

            <div class="card profile-card">
                <div class="row">
                    <div>
                        <p class="label">Alerts & reminders</p>
                        <h4>Smart alerts</h4>
                        <p class="sub">Threshold: $1,000/mo • Subscriptions: $250/mo</p>
                    </div>
                    <button class="text-btn">Edit</button>
                </div>
                <div class="toggles">
                    <div class="toggle-row">
                        <div>
                            <p class="item-title">Push notifications</p>
                            <p class="item-sub">Spikes, due bills, budgets</p>
                        </div>
                        <span class="switch on"></span>
                    </div>
                    <div class="toggle-row">
                        <div>
                            <p class="item-title">Email summaries</p>
                            <p class="item-sub">Weekly digest every Monday</p>
                        </div>
                        <span class="switch"></span>
            </div>
        </div>
    </div>


            <div class="card profile-card danger">
                <div class="row">
                    <div>
                        <p class="label">Data & backup</p>
                        <h4>Export & restore</h4>
                        <p class="sub">Export CSV/JSON • Restore from backup</p>
                    </div>
                    <button class="text-btn danger-text">Export</button>
                </div>
            </div>
        </section>
    </main>

    <div v-if="showExpenseSheet" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">Add expense</div>
                <button class="icon-btn ghost" @click="closeExpenseSheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">New expense</h3>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Type</span>
                    <div class="pill-row">
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.type === 'DEFAULT' }"
                            @click="selectExpenseType('DEFAULT')"
                        >
                            <mdicon name="checkbox-blank-circle-outline" size="18" />
                            <span>Default</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.type === 'SUBSCRIPTION' }"
                            @click="selectExpenseType('SUBSCRIPTION')"
                        >
                            <mdicon name="reload" size="18" />
                            <span>Subscription</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.type === 'UPCOMING' }"
                            @click="selectExpenseType('UPCOMING')"
                        >
                            <mdicon name="calendar-clock" size="18" />
                            <span>Upcoming</span>
                        </button>
                    </div>
                </label>
                <label class="field">
                    <span>Title</span>
                    <input type="text" v-model="expenseForm.title" placeholder="e.g. Groceries" />
                </label>
                <label class="field inline">
                    <span>Amount</span>
                    <input type="number" step="0.01" v-model.number="expenseForm.amount" placeholder="0.00" />
                </label>
                <label class="field inline">
                    <span>Currency</span>
                    <input type="text" v-model="expenseForm.currency" />
                </label>
                <label class="field">
                    <span>Category</span>
                    <div class="pill-row" ref="expenseCategoryRow">
                        <button
                            v-for="cat in categories"
                            :key="cat.id"
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.categoryId === cat.id }"
                            @click="expenseForm.categoryId = cat.id"
                            :style="{ borderColor: cat.color || '#e2e8f0', color: '#0f172a' }"
                        >
                            <mdicon :name="cat.icon || 'label-outline'" size="18" :style="{ color: cat.color || '#4f46e5' }" />
                            <span>{{ cat.name }}</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: !expenseForm.categoryId }"
                            @click="expenseForm.categoryId = ''"
                        >
                            <mdicon name="shape-outline" size="18" />
                            <span>Uncategorized</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option add-pill"
                            @click="goToAddCategory"
                        >
                            <mdicon name="plus" size="20" />
                        </button>
                    </div>
                </label>
                <label class="field inline">
                    <span>Date</span>
                    <input type="date" v-model="expenseForm.expenseDate" />
                </label>
                <p v-if="expenseError" class="error-text">{{ expenseError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeExpenseSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="expenseSaving" @click="handleSaveExpense">
                        {{ expenseSaving ? 'Saving...' : 'Save expense' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
        <div v-if="showAddCategory" class="overlay">
            <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">New category</div>
                <button class="icon-btn ghost" @click="closeAddCategory">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Create category</h3>
            <p class="sub">Give it a name, color, and icon so it’s easy to spot in insights.</p>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input type="text" placeholder="e.g. Dining" v-model="categoryName" />
                </label>
                <label class="field inline">
                    <span>Color</span>
                    <div class="color-row">
                        <button
                            v-for="color in colorPalette"
                            :key="color"
                            class="color-chip"
                            :style="{ background: color }"
                            :class="{ active: selectedColor === color }"
                            type="button"
                            @click="selectColor(color)"
                        ></button>
                        <label class="color-chip picker">
                            <input type="color" v-model="selectedColor" />
                        </label>
                    </div>
                    <p class="micro">Selected: {{ selectedColor }}</p>
                </label>
                <label class="field">
                    <span>Icon</span>
                    <div class="icon-grid">
                        <button
                            v-for="icon in iconOptions"
                            :key="icon"
                            class="icon-bubble"
                            :class="{ active: selectedIcon === icon }"
                            type="button"
                            @click="selectIcon(icon)"
                        >
                            <mdicon :name="icon" size="20" />
                        </button>
                    </div>
                </label>
                <label class="checkbox">
                    <input type="checkbox" v-model="makeDefault" />
                    <span>Make this the default category</span>
                </label>
                <p v-if="saveError" class="error-text">{{ saveError }}</p>
                <p v-if="saveMessage" class="success-text">{{ saveMessage }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeAddCategory">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="saving" @click="handleSaveCategory">
                        {{ saving ? 'Saving...' : 'Save category' }}
                    </button>
                </div>
            </form>
        </div>

            </div>

    <div v-if="showQuickActions" class="overlay quick-overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">Quick actions</div>
                <button class="icon-btn ghost" @click="closeQuickActions">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <div class="action-list">
                <button class="action-row" @click="openExpenseSheet">
                    <div class="icon-circle teal">
                        <mdicon name="cash-plus" size="20" />
                    </div>
                    <div>
                        <p class="item-title">Add expense</p>
                        <p class="item-sub">Log a one-time or recurring expense</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
    <div v-if="showBudgetSheet" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">New budget</div>
                <button class="icon-btn ghost" @click="closeBudgetSheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Create budget</h3>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input type="text" placeholder="e.g. August Groceries" v-model="budgetForm.name" />
                </label>
                <label class="field inline">
                    <span>Amount</span>
                    <input type="number" step="0.01" v-model.number="budgetForm.amount" placeholder="0.00" />
                </label>
                <label class="field inline">
                    <span>Start date</span>
                    <input type="date" v-model="budgetForm.startDate" />
                </label>
                <label class="field inline">
                    <span>End date</span>
                    <input type="date" v-model="budgetForm.endDate" />
                </label>
                <label class="checkbox">
                    <input type="checkbox" v-model="budgetForm.alertEnabled" />
                    <span>Enable alerts</span>
                </label>
                <label class="field inline">
                    <span>Alert threshold</span>
                    <input type="number" step="0.01" v-model.number="budgetForm.alertThreshold" placeholder="e.g. 1500" />
                </label>
                <p v-if="budgetError" class="error-text">{{ budgetError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeBudgetSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="budgetSaving" @click="handleSaveBudget">
                        {{ budgetSaving ? 'Saving...' : 'Save budget' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div v-if="showScheduleSheet" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">New schedule</div>
                <button class="icon-btn ghost" @click="closeScheduleSheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Add upcoming bill</h3>
            <p class="sub">Track subscriptions or planned expenses with reminders.</p>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input type="text" placeholder="e.g. Spotify Family" v-model="scheduleForm.title" />
                </label>
                <label class="field inline">
                    <span>Amount</span>
                    <input type="number" step="0.01" v-model.number="scheduleForm.amount" placeholder="0.00" />
                </label>
                <label class="field inline">
                    <span>Type</span>
                    <div class="pill-row">
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: scheduleForm.type === 'subscription' }"
                            @click="scheduleForm.type = 'subscription'"
                        >
                            <mdicon name="reload" size="18" />
                            <span>Subscription</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: scheduleForm.type === 'expense' }"
                            @click="scheduleForm.type = 'expense'"
                        >
                            <mdicon name="calendar-clock" size="18" />
                            <span>Expense</span>
                        </button>
                    </div>
                </label>
                <label class="field inline">
                    <span>Frequency</span>
                    <select v-model="scheduleForm.frequency">
                        <option value="MONTHLY">Monthly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="ONE_TIME">One time</option>
                    </select>
                </label>
                <label class="field">
                    <span>Category</span>
                    <div class="pill-row" ref="scheduleCategoryRow">
                        <button
                            v-for="cat in categories"
                            :key="cat.id"
                            type="button"
                            class="pill-option"
                            :class="{ active: scheduleForm.categoryId === cat.id }"
                            @click="scheduleForm.categoryId = cat.id"
                            :style="{ borderColor: cat.color || '#e2e8f0', color: '#0f172a' }"
                        >
                            <mdicon :name="cat.icon || 'label-outline'" size="18" :style="{ color: cat.color || '#4f46e5' }" />
                            <span>{{ cat.name }}</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: !scheduleForm.categoryId }"
                            @click="scheduleForm.categoryId = ''"
                        >
                            <mdicon name="shape-outline" size="18" />
                            <span>Uncategorized</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option add-pill"
                            @click="goToAddCategory"
                        >
                            <mdicon name="plus" size="18" />
                        </button>
                    </div>
                </label>
                <label class="field inline">
                    <span>Next charge date</span>
                    <input type="date" v-model="scheduleForm.nextDate" />
                </label>
                <label class="checkbox" v-if="scheduleForm.type === 'subscription'">
                    <input type="checkbox" v-model="scheduleForm.autoPay" />
                    <span>Auto-pay enabled</span>
                </label>
                <p v-if="scheduleError" class="error-text">{{ scheduleError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeScheduleSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="scheduleSaving" @click="handleSaveSchedule">
                        {{ scheduleSaving ? 'Saving...' : 'Save schedule' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <nav class="bottom-nav">
        <button class="nav-btn" :class="{ active: activeTab === 'home' }" @click="setTab('home')">
            <mdicon name="home-outline" size="22" />
            <span>Home</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'transactions' }" @click="setTab('transactions')">
            <mdicon name="swap-horizontal" size="22" />
            <span>Transactions</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'schedules' }" @click="setTab('schedules')">
            <mdicon name="calendar-refresh" size="22" />
            <span>Schedules</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'profile' }" @click="setTab('profile')">
            <mdicon name="account-circle-outline" size="22" />
            <span>Profile</span>
        </button>
    </nav>
</div>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpenses } from '@/composables/expenses'
import { useAccounts } from '@/composables/accounts'
import { useCurrencies } from '@/composables/currencies'
import { useBudgets } from '@/composables/budgets'
import { useSubscriptions } from '@/composables/subscriptions'
import { useExpenseSchedules } from '@/composables/expenseSchedules'

export default {
    name: "ExpenseTrackingMobile",
    setup() {
        const router = useRouter()
        const { listExpenses, createExpense, deleteExpense, createCategory, listCategories } = useExpenses()
        const { listAccounts } = useAccounts()
        const { listCurrencies } = useCurrencies()
        const { listBudgetSummary, listBudgets, createBudget } = useBudgets()
        const { listSubscriptions, createSubscription, updateSubscription, deleteSubscription, markSubscriptionPaid } = useSubscriptions()
        const {
            listExpenseSchedules,
            createExpenseSchedule,
            updateExpenseSchedule,
            deleteExpenseSchedule
        } = useExpenseSchedules()
        const activeTab = ref('home')
        const setTab = (tab) => { activeTab.value = tab }
        const barLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        const showAddCategory = ref(false)
        const openAddCategory = () => { showAddCategory.value = true }
        const closeAddCategory = () => {
            showAddCategory.value = false
            resetCategoryForm()
        }

        const goToAddCategory = () => {
            showQuickActions.value = false
            showExpenseSheet.value = false
            showScheduleSheet.value = false
            showBudgetSheet.value = false
            showAddCategory.value = true
        }
        const categories = ref([])
        const categoriesLoaded = ref(false)
        const accounts = ref([])
        const accountsLoaded = ref(false)
        const currencies = ref([])
        const currenciesLoaded = ref(false)
        const defaultCurrency = ref('PHP')
        const defaultAccountName = ref('')
        const budgets = ref([])
        const budgetsLoaded = ref(false)
        const showBudgetSheet = ref(false)
        const todayStr = () => new Date().toISOString().slice(0, 10)
        const expenses = ref([])
        const budgetForm = ref({
            name: '',
            amount: '',
            startDate: todayStr(),
            endDate: todayStr(),
            alertEnabled: true,
            alertThreshold: ''
        })
        const budgetError = ref('')
        const budgetSaving = ref(false)
        const showScheduleSheet = ref(false)
        const scheduleSaving = ref(false)
        const scheduleError = ref('')
        const showQuickActions = ref(false)
        const showExpenseSheet = ref(false)
        const expenseSaving = ref(false)
        const expenseError = ref('')
        const expenseForm = ref({
            title: '',
            amount: '',
            currency: 'PHP',
            categoryId: '',
            expenseDate: todayStr(),
            type: 'DEFAULT'
        })
        const schedules = ref([])
        const scheduleForm = ref({
            title: '',
            amount: '',
            type: 'subscription',
            frequency: 'MONTHLY',
            nextDate: todayStr(),
            autoPay: true,
            categoryId: ''
        })
        const expenseSchedules = ref([])
        const scheduleFilter = ref('subscriptions')
        const filteredSchedules = computed(() => {
            return scheduleFilter.value === 'subscriptions' ? schedules.value : expenseSchedules.value
        })
        const scheduleTotal = computed(() => {
            return filteredSchedules.value.reduce((sum, s) => sum + Number(s.rawAmount || 0), 0)
        })
        const subscriptionTotal = computed(() => {
            return schedules.value.reduce((sum, s) => sum + Number(s.rawAmount || 0), 0)
        })
        const monthOffset = ref(0)
        const viewMonthStart = computed(() => {
            const base = new Date()
            return new Date(base.getFullYear(), base.getMonth() + monthOffset.value, 1)
        })
        const viewMonthKey = computed(() => `${viewMonthStart.value.getFullYear()}-${viewMonthStart.value.getMonth()}`)
        const monthLabel = (offset = 0) => {
            const d = new Date(viewMonthStart.value.getFullYear(), viewMonthStart.value.getMonth() + offset, 1)
            return d.toLocaleString('default', { month: 'long' })
        }
        const displayedExpenses = computed(() => {
            const target = viewMonthStart.value
            return expenses.value.filter(exp => {
                if (!exp.expenseDate) return false
                const d = new Date(exp.expenseDate)
                return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth()
            })
        })
        const currencySymbol = (cur) => {
            const map = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
            return map[cur] || map[defaultCurrency.value] || ''
        }
        const formatMoney = (cur, amt) => `${currencySymbol(cur)} ${Number(amt || 0)}`
        const transactionOut = computed(() => {
            return displayedExpenses.value.reduce((sum, e) => sum + Number(e.amount || 0), 0)
        })
        const transactionIn = computed(() => 0)
        const transactionNet = computed(() => transactionIn.value - transactionOut.value)
        const todayLabel = computed(() => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
        const changeMonth = (step) => {
            monthOffset.value += step
        }
        const touchStartX = ref(0)
        const onMonthTouchStart = (e) => {
            touchStartX.value = e.changedTouches?.[0]?.clientX || 0
        }
        const onMonthTouchEnd = (e) => {
            const endX = e.changedTouches?.[0]?.clientX || 0
            const diff = endX - touchStartX.value
            if (Math.abs(diff) > 30) {
                changeMonth(diff < 0 ? 1 : -1)
            }
        }
        const openQuickActions = () => {
            showQuickActions.value = true
        }
        const closeQuickActions = () => {
            showQuickActions.value = false
        }
        const resetExpenseForm = () => {
            expenseForm.value = {
                title: '',
                amount: '',
                currency: defaultCurrency.value || 'PHP',
                categoryId: '',
                expenseDate: todayStr(),
                type: 'DEFAULT'
            }
            expenseError.value = ''
        }

        const openExpenseSheet = () => {
            if (!categoriesLoaded.value) loadCategories()
            resetExpenseForm()
            showQuickActions.value = false
            showExpenseSheet.value = true
        }

        const closeExpenseSheet = () => {
            showExpenseSheet.value = false
        }

        const selectExpenseType = (type) => {
            expenseForm.value.type = type
            console.log('Selected expense type:', type)
            if (type === 'SUBSCRIPTION' || type === 'UPCOMING') {
                const scheduleType = type === 'SUBSCRIPTION' ? 'subscription' : 'expense'
                closeExpenseSheet()
                showQuickActions.value = false
                setTab('schedules')
                scheduleFilter.value = type === 'SUBSCRIPTION' ? 'subscriptions' : 'expenses'
                openScheduleSheet(scheduleType)
            }
        }

        const handleSaveExpense = async() => {
            expenseError.value = ''
            if (!expenseForm.value.title.trim() || !expenseForm.value.amount) {
                expenseError.value = 'Title and amount are required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                expenseError.value = 'You are not logged in.'
                return
            }
            expenseSaving.value = true
            try {
                await createExpense(token, {
                    title: expenseForm.value.title.trim(),
                    amount: Number(expenseForm.value.amount),
                    currency: expenseForm.value.currency || defaultCurrency.value || 'PHP',
                    categoryId: expenseForm.value.categoryId || null,
                    expenseDate: expenseForm.value.expenseDate || new Date().toISOString(),
                    paymentMethod: 'CASH',
                    isRecurring: expenseForm.value.type === 'SUBSCRIPTION',
                    frequency: expenseForm.value.type === 'SUBSCRIPTION' ? 'MONTHLY' : 'ONE_TIME'
                })
                await loadExpenses()
                await loadBudgets()
                closeExpenseSheet()
            } catch (err) {
                expenseError.value = err?.message || 'Unable to save expense.'
            } finally {
                expenseSaving.value = false
            }
        }
        const editingSubscriptionId = ref(null)
        const budgetCarousel = ref(null)
        const budgetActiveIndex = ref(0)
        const activeBudgetAmount = computed(() => {
            if (!budgets.value.length) return `${currencySymbol(defaultCurrency.value)} 0`
            const active = budgets.value[budgetActiveIndex.value] || budgets.value[0]
            const currency = active?.currency || defaultCurrency.value || 'PHP'
            return `${currencySymbol(currency)} ${active?.amount ?? 0}`
        })
        const colorPalette = ref([
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
            '#ec4899', '#f472b6', '#94a3b8', '#475569',
            '#000000', '#ffffff'
        ])
        const selectedColor = ref(colorPalette.value[9])
        const iconOptions = ref([
            'food-fork-drink',
            'silverware-fork-knife',
            'cupcake',
            'cart-outline',
            'basket-outline',
            'bag-personal-outline',
            'bus',
            'train',
            'car-wash',
            'gas-station',
            'home-outline',
            'lightbulb-on-outline',
            'water',
            'phone-outline',
            'wifi',
            'cellphone-nfc',
            'netflix',
            'spotify',
            'video-outline',
            'cash-multiple',
            'credit-card-outline',
            'bank',
            'piggy-bank',
            'wallet-outline',
            'dumbbell',
            'heart-pulse',
            'hospital-building',
            'medical-bag',
            'laptop',
            'headphones',
            'gamepad-variant-outline',
            'briefcase',
            'airplane',
            'pine-tree',
            'party-popper',
            'gift-outline',
            'tshirt-crew-outline'
        ])
        const selectedIcon = ref(iconOptions.value[0])
        const selectColor = (color) => { selectedColor.value = color }
        const selectIcon = (icon) => { selectedIcon.value = icon }
        const categoryName = ref('')
        const makeDefault = ref(false)
        const saving = ref(false)
        const saveError = ref('')
        const saveMessage = ref('')

        const resetCategoryForm = () => {
            categoryName.value = ''
            makeDefault.value = false
            saving.value = false
            saveError.value = ''
            saveMessage.value = ''
            selectedColor.value = colorPalette.value[9]
            selectedIcon.value = iconOptions.value[0]
        }

        const loadCategories = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listCategories(token)
                categories.value = Array.isArray(list) ? list : []
                categoriesLoaded.value = true
            } catch (err) {
                // keep silent to avoid blocking UI; could surface a message if needed
            }
        }

        const loadAccounts = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listAccounts(token)
                accounts.value = Array.isArray(list) ? list : []
                const def = accounts.value.find(a => a.isDefault)
                defaultAccountName.value = def?.name || accounts.value[0]?.name || ''
                accountsLoaded.value = true
            } catch (err) {
                console.error(err)
            }
        }

        const loadCurrencies = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listCurrencies(token)
                currencies.value = Array.isArray(list) ? list : []
                const def = currencies.value.find(c => c.isDefault)
                defaultCurrency.value = def?.code || defaultCurrency.value
                currenciesLoaded.value = true
            } catch (err) {
                console.error(err)
            }
        }

        const loadBudgets = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                let list = []
                try {
                    list = await listBudgetSummary(token)
                } catch {
                    list = await listBudgets(token)
                }
                budgets.value = Array.isArray(list) ? list : []
                budgetsLoaded.value = true
            } catch (err) {
                console.error(err)
            }
        }

        const decorateExpense = (exp) => {
            const cat = categories.value.find(c => c.id === exp.categoryId)
            return {
                ...exp,
                categoryIcon: cat?.icon || exp.categoryIcon || null,
                categoryColor: cat?.color || exp.categoryColor || null
            }
        }

        const loadExpenses = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listExpenses(token)
                expenses.value = Array.isArray(list) ? list.map(decorateExpense) : []
            } catch (err) {
                console.error(err)
            }
        }

        const handleSaveCategory = async() => {
            saveError.value = ''
            saveMessage.value = ''
            if (!categoryName.value.trim()) {
                saveError.value = 'Category name is required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                saveError.value = 'You are not logged in.'
                return
            }
            saving.value = true
            try {
                const category = await createCategory(token, {
                    name: categoryName.value.trim(),
                    color: selectedColor.value,
                    icon: selectedIcon.value,
                    isDefault: makeDefault.value
                })
                categories.value = [category, ...categories.value]
                saveMessage.value = 'Category saved.'
                setTimeout(() => {
                    closeAddCategory()
                }, 700)
            } catch (err) {
                saveError.value = err?.message || 'Unable to save category.'
            } finally {
                saving.value = false
            }
        }

        const totalBudget = computed(() => {
            return budgets.value.reduce((sum, b) => sum + Number(b.amount || 0), 0)
        })

        const openBudgetSheet = () => {
            resetBudgetForm()
            showBudgetSheet.value = true
        }

        const closeBudgetSheet = () => {
            showBudgetSheet.value = false
        }

        const resetBudgetForm = () => {
            budgetForm.value = {
                name: '',
                amount: '',
                currency: defaultCurrency.value || 'PHP',
                startDate: todayStr(),
                endDate: todayStr(),
                categoryId: '',
                alertEnabled: true,
                alertThreshold: ''
            }
            budgetError.value = ''
        }

        const handleSaveBudget = async() => {
            budgetError.value = ''
            if (!budgetForm.value.name.trim() || !budgetForm.value.amount) {
                budgetError.value = 'Name and amount are required.'
                return
            }
            if (!budgetForm.value.startDate || !budgetForm.value.endDate) {
                budgetError.value = 'Start and end dates are required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                budgetError.value = 'You are not logged in.'
                return
            }
            budgetSaving.value = true
            try {
                const budget = await createBudget(token, {
                    name: budgetForm.value.name.trim(),
                    amount: Number(budgetForm.value.amount),
                    currency: defaultCurrency.value || 'PHP',
                    startDate: budgetForm.value.startDate,
                    endDate: budgetForm.value.endDate,
                    categoryId: null,
                    alertThreshold: budgetForm.value.alertThreshold ? Number(budgetForm.value.alertThreshold) : null,
                    alertEnabled: budgetForm.value.alertEnabled
                })
                budgets.value = [budget, ...budgets.value]
                closeBudgetSheet()
            } catch (err) {
                budgetError.value = err?.message || 'Unable to save budget.'
            } finally {
                budgetSaving.value = false
            }
        }

        const openScheduleSheet = (typeOverride) => {
            if (!categoriesLoaded.value) loadCategories()
            resetScheduleForm(typeOverride)
            showScheduleSheet.value = true
            showQuickActions.value = false
        }

        const closeScheduleSheet = () => {
            showScheduleSheet.value = false
        }

        const resetScheduleForm = (typeOverride) => {
            scheduleForm.value = {
                title: '',
                amount: '',
                type: typeOverride || 'subscription',
                frequency: 'MONTHLY',
                nextDate: todayStr(),
                autoPay: true,
                categoryId: ''
            }
            scheduleError.value = ''
            editingSubscriptionId.value = null
        }

        const mapSubscriptionToCard = (sub) => {
            const next = sub.nextBillingDate || sub.nextBilling || sub.nextDate
            const autoPay = Boolean(sub.autoPay)
            const palette = ['blue', 'amber', 'teal', 'purple', 'pink', 'green']
            const colorIdx = Math.abs((sub.title || '').length) % palette.length
            return {
                id: sub.id,
                when: next ? formatDate(next) : 'Upcoming',
                tag: autoPay ? 'Auto-pay' : 'Reminder',
                icon: 'calendar-refresh',
                badgeClass: autoPay ? 'green' : 'blue',
                title: sub.title,
                subtitle: `${sub.billingCycle || 'MONTHLY'} • ${(sub.currency || defaultCurrency.value)} ${sub.amount}`,
                amount: `${sub.currency || defaultCurrency.value} ${sub.amount}`,
                rawAmount: sub.amount,
                rawNextDate: sub.nextBillingDate || null,
                frequency: sub.billingCycle || 'MONTHLY',
                autoPay,
                categoryId: sub.categoryId || '',
                dotClass: palette[colorIdx]
            }
        }

        const loadSubscriptions = async() => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const list = await listSubscriptions(token)
                schedules.value = Array.isArray(list) ? list.map(mapSubscriptionToCard) : []
            } catch (err) {
                console.error(err)
            }
        }

        const mapExpenseScheduleToCard = (sch) => {
            const when = sch.nextRunAt || sch.startDate
            return {
                id: sch.id,
                when: when ? formatDate(when) : 'Planned',
                tag: 'Reminder',
                icon: 'cash-multiple',
                badgeClass: 'blue',
                title: sch.title,
                subtitle: `${sch.frequency || 'ONE_TIME'} • ${(sch.currency || defaultCurrency.value)} ${sch.amount}`,
                amount: `${sch.currency || defaultCurrency.value} ${sch.amount}`,
                rawAmount: sch.amount,
                rawNextDate: sch.nextRunAt || sch.startDate,
                frequency: sch.frequency || 'ONE_TIME',
                autoPay: false,
                categoryId: sch.categoryId || ''
            }
        }

        const loadExpenseSchedules = async() => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const list = await listExpenseSchedules(token)
                expenseSchedules.value = Array.isArray(list) ? list.map(mapExpenseScheduleToCard) : []
            } catch (err) {
                console.error(err)
            }
        }

        const handleSaveSchedule = async() => {
            scheduleError.value = ''
            if (!scheduleForm.value.title.trim() || !scheduleForm.value.amount || !scheduleForm.value.nextDate) {
                scheduleError.value = 'Title, amount, and next date are required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                scheduleError.value = 'You are not logged in.'
                return
            }
            scheduleSaving.value = true
            try {
                const isSubscription = scheduleForm.value.type === 'subscription'
                if (isSubscription) {
                    const payload = {
                        title: scheduleForm.value.title.trim(),
                        amount: Number(scheduleForm.value.amount),
                        currency: defaultCurrency.value || 'PHP',
                        billingCycle: scheduleForm.value.frequency,
                        nextBillingDate: scheduleForm.value.nextDate,
                        active: true,
                        autoPay: scheduleForm.value.autoPay,
                        categoryId: scheduleForm.value.categoryId || null,
                        notes: null
                    }
                    if (editingSubscriptionId.value) {
                        const subscription = await updateSubscription(token, editingSubscriptionId.value, payload)
                        schedules.value = schedules.value.map(s => s.id === subscription.id ? mapSubscriptionToCard(subscription) : s)
                    } else {
                        const subscription = await createSubscription(token, payload)
                        schedules.value = [mapSubscriptionToCard(subscription), ...schedules.value]
                    }
                } else {
                    const payload = {
                        title: scheduleForm.value.title.trim(),
                        amount: Number(scheduleForm.value.amount),
                        currency: defaultCurrency.value || 'PHP',
                        startDate: scheduleForm.value.nextDate,
                        frequency: scheduleForm.value.frequency || 'ONE_TIME',
                        nextRunAt: scheduleForm.value.nextDate,
                        active: true,
                        categoryId: scheduleForm.value.categoryId || null
                    }
                    if (editingSubscriptionId.value) {
                        const updated = await updateExpenseSchedule(token, editingSubscriptionId.value, payload)
                        expenseSchedules.value = expenseSchedules.value.map(e => e.id === updated.id ? mapExpenseScheduleToCard(updated) : e)
                    } else {
                        const schedule = await createExpenseSchedule(token, payload)
                        expenseSchedules.value = [mapExpenseScheduleToCard(schedule), ...expenseSchedules.value]
                    }
                }
                closeScheduleSheet()
            } catch (err) {
                scheduleError.value = err?.message || 'Unable to save schedule.'
            } finally {
                scheduleSaving.value = false
            }
        }

        const startEditSchedule = (item) => {
            editingSubscriptionId.value = item.id
            scheduleForm.value = {
                title: item.title,
                amount: item.rawAmount || item.amount,
                type: scheduleFilter.value === 'subscriptions' ? 'subscription' : 'expense',
                frequency: item.frequency || (scheduleFilter.value === 'subscriptions' ? 'MONTHLY' : 'ONE_TIME'),
                nextDate: item.rawNextDate || '',
                autoPay: item.autoPay,
                categoryId: item.categoryId || ''
            }
            showScheduleSheet.value = true
        }

        const removeSchedule = async(item) => {
            const token = localStorage.getItem('token')
            if (!token || !item.id) return
            try {
                if (scheduleFilter.value === 'subscriptions') {
                    await deleteSubscription(token, item.id)
                    schedules.value = schedules.value.filter(s => s.id !== item.id)
                } else {
                    await deleteExpenseSchedule(token, item.id)
                    expenseSchedules.value = expenseSchedules.value.filter(s => s.id !== item.id)
                }
            } catch (err) {
                console.error(err)
            }
        }

        const paySubscription = async(item) => {
            const token = localStorage.getItem('token')
            if (!token || !item.id) return
            try {
                const { expense, subscription } = await markSubscriptionPaid(token, item.id)
                if (expense) expenses.value = [expense, ...expenses.value]
                schedules.value = schedules.value.filter(s => s.id !== item.id)
                if (subscription) schedules.value = [mapSubscriptionToCard(subscription), ...schedules.value]
                await loadBudgets()
            } catch (err) {
                console.error(err)
            }
        }

        const handleDeleteExpense = async(exp) => {
            const token = localStorage.getItem('token')
            if (!token || !exp.id) return
            try {
                await deleteExpense(token, exp.id)
                expenses.value = expenses.value.filter(e => e.id !== exp.id)
            } catch (err) {
                console.error(err)
            }
        }

        const openAddExpense = () => {
            // For now, route to schedules tab with expense filter and sheet
            setTab('schedules')
            scheduleFilter.value = 'expenses'
            resetScheduleForm()
            showScheduleSheet.value = true
            showQuickActions.value = false
        }

        const toggleAutoPay = async(item) => {
            const token = localStorage.getItem('token')
            if (!token || !item.id) return
            try {
                const updated = await updateSubscription(token, item.id, { autoPay: !item.autoPay })
                const mapped = mapSubscriptionToCard(updated)
                schedules.value = schedules.value.map(s => s.id === item.id ? mapped : s)
            } catch (err) {
                console.error(err)
            }
        }

        const onBudgetScroll = () => {
            const el = budgetCarousel.value
            if (!el) return
            const slideWidth = el.clientWidth
            const idx = Math.round(el.scrollLeft / slideWidth)
            budgetActiveIndex.value = Math.min(Math.max(idx, 0), budgets.value.length - 1)
        }

        const scrollBudget = (direction) => {
            const el = budgetCarousel.value
            if (!el) return
            const slideWidth = el.clientWidth
            const nextIndex = Math.min(
                Math.max(budgetActiveIndex.value + direction, 0),
                budgets.value.length - 1
            )
            el.scrollTo({ left: nextIndex * slideWidth, behavior: 'smooth' })
            budgetActiveIndex.value = nextIndex
        }

        const formatDate = (value) => value ? new Date(value).toLocaleDateString() : ''

        const subscriptionPalette = ['blue', 'amber', 'teal', 'purple', 'pink', 'green']
        const subscriptionDot = (idx) => subscriptionPalette[idx % subscriptionPalette.length]

        watch(activeTab, (tab) => {
            if (tab === 'profile' && !categoriesLoaded.value) {
                loadCategories()
            }
            if (tab === 'profile' && !accountsLoaded.value) {
                loadAccounts()
            }
            if (tab === 'profile' && !currenciesLoaded.value) {
                loadCurrencies()
            }
            if (tab === 'home' && !budgetsLoaded.value) {
                loadBudgets()
                if (!categoriesLoaded.value) loadCategories()
            }
            if (tab === 'home' && schedules.value.length === 0) {
                loadSubscriptions()
            }
            if (tab === 'schedules' && schedules.value.length === 0) {
                loadSubscriptions()
                loadExpenseSchedules()
            }
        })

        watch(categories, (newCats) => {
            if (!Array.isArray(expenses.value)) return
            expenses.value = expenses.value.map(exp => {
                const cat = newCats.find(c => c.id === exp.categoryId)
                return {
                    ...exp,
                    categoryIcon: cat?.icon || exp.categoryIcon || null,
                    categoryColor: cat?.color || exp.categoryColor || null
                }
            })
        })

        onMounted(() => {
            if (activeTab.value === 'profile') {
                loadCategories()
                loadAccounts()
                loadCurrencies()
            }
            if (activeTab.value === 'home') {
                loadBudgets()
                loadCategories()
                loadExpenses()
            }
            if (activeTab.value === 'schedules') {
                loadSubscriptions()
                loadExpenseSchedules()
            }
        })

        return {
            router,
            activeTab,
            setTab,
            barLabels,
            showAddCategory,
            openAddCategory,
            closeAddCategory,
            categories,
            accounts,
            currencies,
            defaultCurrency,
            defaultAccountName,
            colorPalette,
            selectedColor,
            selectColor,
            iconOptions,
            selectedIcon,
            selectIcon,
            categoryName,
            makeDefault,
            saving,
            saveError,
            saveMessage,
            handleSaveCategory,
            budgets,
            totalBudget,
            activeBudgetAmount,
            budgetCarousel,
            budgetActiveIndex,
            showBudgetSheet,
            budgetForm,
            budgetError,
            budgetSaving,
            openBudgetSheet,
            closeBudgetSheet,
            handleSaveBudget,
            onBudgetScroll,
            scrollBudget,
            formatDate,
            showScheduleSheet,
            scheduleForm,
            scheduleError,
            scheduleSaving,
            schedules,
            expenseSchedules,
            scheduleFilter,
            filteredSchedules,
            openScheduleSheet,
            closeScheduleSheet,
            handleSaveSchedule,
            toggleAutoPay,
            scheduleTotal,
            subscriptionTotal,
            transactionOut,
            transactionIn,
            transactionNet,
            monthLabel,
            todayLabel,
            startEditSchedule,
            removeSchedule,
            subscriptionDot,
            showQuickActions,
            openQuickActions,
            closeQuickActions,
            expenses,
            loadExpenses,
            showExpenseSheet,
            expenseForm,
            expenseSaving,
            expenseError,
            openExpenseSheet,
            closeExpenseSheet,
            selectExpenseType,
            handleSaveExpense,
            goToAddCategory,
            changeMonth,
            onMonthTouchStart,
            onMonthTouchEnd,
            displayedExpenses,
            monthOffset,
            viewMonthKey,
            paySubscription,
            handleDeleteExpense,
            formatMoney,
            currencySymbol
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f7f9fb 0%, #eef2f7 100%);
    color: #0f172a;
}

.top-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 10px;
    backdrop-filter: blur(8px);
}

.icon-btn {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: none;
    background: #e7ecf3;
    color: #0f172a;
}

.icon-btn.ghost {
    background: transparent;
}

.quick-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    font-weight: 800;
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.35);
}

.title-group h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
}

.title-group .eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #64748b;
}

.content {
    flex: 1;
    padding: 6px 14px 80px;
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.card {
    background: #fff;
    border-radius: 18px;
    padding: 14px;
    box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06);
}

.card.primary {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
}

.budget-card .budget-list {
    display: grid;
    gap: 10px;
    margin-top: 8px;
}

.budget-head {
    display: grid;
    gap: 4px;
}

.label-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.inline-plus {
    width: 28px;
    height: 28px;
    background: transparent;
    box-shadow: none;
}

.budget-amount {
    margin: 0;
}

.budget-carousel-wrapper {
    margin-top: 10px;
}

.budget-carousel {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 8px;
}

.budget-carousel::-webkit-scrollbar {
    display: none;
}

.budget-slide {
    min-width: 100%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 12px;
    scroll-snap-align: start;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
}

.budget-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}

.dots {
    display: flex;
    gap: 6px;
    align-items: center;
}

.dots .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #cbd5e1;
    transition: background 0.2s ease, transform 0.2s ease;
}

.dots .dot.active {
    background: #4f46e5;
    transform: scale(1.1);
}

.arrows {
    display: flex;
    gap: 8px;
}

.progress.big {
    height: 10px;
    background: #e2e8f0;
}

.progress .bar.gradient {
    background: linear-gradient(90deg, #22c55e, #16a34a);
}

.inline-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    padding: 6px 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 8px 18px rgba(79, 70, 229, 0.28);
}

.sheet-title + .sub {
    margin-top: -4px;
}

.action-row .icon-circle {
    width: 38px;
    height: 38px;
}

.icon-btn.top-right {
    align-self: flex-start;
}
.budget-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
}

.card.primary .label,
.card.primary .sub {
    color: #e8e9ff;
}

.card .label {
    margin: 0 0 6px;
    font-size: 13px;
    color: #64748b;
}

.card h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
}

.card h4 {
    margin: 2px 0 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
}

.card .sub {
    margin: 4px 0 0;
    font-size: 13px;
    color: #475569;
}

.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.pill {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
}

.pill.safe {
    background: #ecfdf3;
    color: #15803d;
}

.pill.ghost {
    background: #f1f5f9;
    color: #0f172a;
}

.pill.tiny-pill {
    padding: 6px 8px;
    gap: 4px;
    display: inline-flex;
    align-items: center;
    border: none;
    box-shadow: none;
}

.pill.tiny-pill.danger {
    background: linear-gradient(135deg, #fee2e2, #fecdd3);
    color: #b91c1c;
    border: none;
    box-shadow: 0 8px 18px rgba(185, 28, 28, 0.25);
}

.pill.tiny-pill.success {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #166534;
    border: none;
    box-shadow: 0 8px 18px rgba(22, 101, 52, 0.25);
}

.pill.tiny-pill.success mdicon {
    color: #16a34a;
}

.progress {
    width: 100%;
    height: 8px;
    border-radius: 8px;
    background: #e2e8f0;
    margin: 10px 0 6px;
    overflow: hidden;
}

.progress .bar {
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(90deg, #22c55e, #16a34a);
}

.mini-list {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: grid;
    gap: 6px;
    color: #0f172a;
}

.mini-list .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    display: inline-block;
    margin-right: 8px;
}

.dot.blue { background: #3b82f6; }
.dot.amber { background: #f59e0b; }
.dot.teal { background: #14b8a6; }
.dot.purple { background: #8b5cf6; }
.dot.pink { background: #ec4899; }
.dot.green { background: #22c55e; }

.section {
    margin-top: 16px;
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.section-head h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
}

.text-btn {
    background: none;
    border: none;
    color: #6366f1;
    font-weight: 700;
    font-size: 13px;
}

.list {
    display: grid;
    gap: 10px;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.05);
}

.icon-circle {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #fff;
}

.icon-circle.purple { background: #7c3aed; }
.icon-circle.teal { background: #14b8a6; }
.icon-circle.orange { background: #f97316; }
.icon-circle.purple-bg { background: #a855f7; color: #fff; }
.icon-circle.blue-bg { background: #3b82f6; color: #fff; }
.icon-circle.green-bg { background: #22c55e; color: #fff; }

.transactions-list .compact-item {
    padding: 10px;
}

.compact-item .item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.insights-cta {
    margin-top: 16px;
    padding: 14px;
    border-radius: 16px;
    background: linear-gradient(135deg, #eef2ff, #e0f2fe);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 8px 22px rgba(79, 70, 229, 0.1);
}

.transactions-header .months {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #475569;
}

.transactions-header .month {
    padding-bottom: 4px;
}

.transactions-header .month.current {
    font-weight: 800;
    color: #0f172a;
    border-bottom: 3px solid #4f46e5;
}

.transactions-header .month.muted {
    opacity: 0.6;
}

.summary-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 10px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    gap: 8px;
}

.summary-bar .flow {
    font-weight: 800;
    text-align: center;
}

.summary-bar .flow.out { color: #e11d48; }
.summary-bar .flow.in { color: #16a34a; }
.summary-bar .flow.net { color: #0f172a; }

.month-slide-enter-active,
.month-slide-leave-active {
    transition: all 0.25s ease;
}

.month-slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
}

.month-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.transactions-date {
    font-weight: 800;
    color: #0f172a;
    margin: 10px 0 6px;
}

.swipeable {
    position: relative;
    overflow: hidden;
}

.swipe-actions {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}

.transaction-footer {
    text-align: center;
    color: #475569;
    margin-top: 12px;
}

.fab {
    position: fixed;
    right: 16px;
    bottom: 70px;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    border: none;
    background: #fcd34d;
    color: #0f172a;
    display: grid;
    place-items: center;
    box-shadow: 0 12px 28px rgba(0,0,0,0.2);
}
.schedule-actions {
    display: flex;
    gap: 6px;
}

.icon-btn.small {
    width: 32px;
    height: 32px;
    background: #f8fafc;
    box-shadow: none;
}

.icon-btn.small.danger {
    color: #e11d48;
}

.schedule-row {
    align-items: center;
}

.schedule-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toggle-auto {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 999px;
    padding: 6px 10px;
}

.item-title {
    margin: 0;
    font-weight: 700;
    color: #0f172a;
}

.item-sub {
    margin: 2px 0 0;
    font-size: 12px;
    color: #64748b;
}

.item-amount {
    font-weight: 800;
    color: #ef4444;
}

.hero-insights {
    position: relative;
    background: radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.22), transparent 50%),
        radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.18), transparent 50%),
        #0f172a;
    color: #e2e8f0;
    border-radius: 18px;
    padding: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.35);
}

.hero-insights .glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.08), transparent 50%);
    pointer-events: none;
}

.hero-insights h2 {
    margin: 6px 0 2px;
    font-size: 32px;
    font-weight: 800;
}

.sparkline {
    display: grid;
    grid-auto-flow: column;
    align-items: end;
    gap: 6px;
    margin-top: 10px;
}

.sparkline span {
    width: 6px;
    border-radius: 999px;
    background: linear-gradient(180deg, #38bdf8, #6366f1);
}

.insights-grid {
    display: grid;
    gap: 12px;
}

.category-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
}

.category-row:last-child {
    border-bottom: none;
}

.category {
    display: flex;
    gap: 10px;
    align-items: center;
}

.circle {
    width: 12px;
    height: 12px;
    border-radius: 999px;
}

.circle.purple { background: #7c3aed; }
.circle.teal { background: #14b8a6; }
.circle.amber { background: #f59e0b; }

.chip {
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 6px 10px;
    border-radius: 999px;
    font-weight: 700;
    color: #0f172a;
}

.bars {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    align-items: end;
    padding: 6px 0 0;
}

.bar-col {
    display: grid;
    gap: 6px;
    justify-items: center;
}

.bar-pill {
    width: 14px;
    border-radius: 12px;
    background: linear-gradient(180deg, #22c55e, #16a34a);
}

.bar-label {
    font-size: 10px;
    color: #94a3b8;
    letter-spacing: 0.2px;
}

.gradient-card {
    background: linear-gradient(135deg, #eef2ff, #e0f2fe);
}

.primary-btn {
    margin-top: 12px;
    width: 100%;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    padding: 12px;
    border-radius: 12px;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.35);
}

.hero-schedules {
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 18px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 12px 36px rgba(15, 23, 42, 0.3);
}

.hero-schedules h2 {
    margin: 6px 0 2px;
    font-size: 30px;
    font-weight: 800;
}

.primary-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 10px 24px rgba(99, 102, 241, 0.35);
}

.schedule-toggle {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.toggle-pill {
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 700;
    color: #0f172a;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.toggle-pill.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    border: none;
}

.schedule-list {
    display: grid;
    gap: 12px;
}

.schedule-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.schedule-main {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    margin-top: 8px;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 800;
    color: #0f172a;
    background: #e2e8f0;
}

.badge.pink { background: #fce7f3; color: #be185d; }
.badge.blue { background: #e0f2fe; color: #0369a1; }
.badge.purple { background: #ede9fe; color: #5b21b6; }
.badge.teal { background: #ccfbf1; color: #0f766e; }
.badge.green { background: #dcfce7; color: #15803d; }

.profile-hero {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(79, 70, 229, 0.35);
}

.avatar {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.18);
    display: grid;
    place-items: center;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.profile-meta h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
}

.profile-cards {
    display: grid;
    gap: 12px;
}

.profile-card {
    border: 1px solid #e2e8f0;
}

.profile-card.danger {
    background: linear-gradient(135deg, #fff1f2, #ffe4e6);
    border: none;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.ghost-chip {
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #e2e8f0;
    box-shadow: none;
}

.toggles {
    display: grid;
    gap: 10px;
    margin-top: 12px;
}

.toggle-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
}

.switch {
    width: 42px;
    height: 24px;
    border-radius: 999px;
    background: #e2e8f0;
    position: relative;
}

.switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
}

.switch.on {
    background: linear-gradient(135deg, #4f46e5, #22c55e);
}

.switch.on::after {
    transform: translateX(18px);
}

.text-btn.danger-text {
    color: #e11d48;
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(10px);
    display: grid;
    place-items: end center;
    padding: 0 12px 16px;
    z-index: 20;
}

.sheet {
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 18px 18px 0 0;
    padding: 16px;
    box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.25);
    animation: slideUp 0.2s ease;
}

.sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.action-list {
    display: grid;
    gap: 10px;
    margin-top: 10px;
}

.action-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: center;
    padding: 10px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 14px;
}

.sheet-title {
    margin: 6px 0 4px;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
}

.form {
    display: grid;
    gap: 12px;
    margin-top: 10px;
}

.field {
    display: grid;
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
}

.field span {
    font-size: 13px;
    color: #475569;
}

.field input {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    font-size: 15px;
    background: #f8fafc;
}

.field select {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    font-size: 15px;
    background: #f8fafc;
    appearance: none;
}

.pill-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
}

.pill-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-weight: 700;
    color: #0f172a;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.pill-option.active {
    border-color: #4f46e5;
    background: linear-gradient(135deg, #eef2ff, #e0f2fe);
    color: #1e1b4b;
}

.pill-option.add-pill {
    background: #fff;
    border-style: dashed;
    color: #0f172a;
}

.pill-option mdicon {
    color: inherit;
}

.inline {
    align-items: center;
}

.field.inline select,
.field.inline input {
    width: 100%;
}

.color-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.color-chip {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 2px solid transparent;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
}

.color-chip.active {
    border-color: #0f172a;
    box-shadow: 0 6px 14px rgba(0,0,0,0.16);
}

.color-chip.picker {
    padding: 0;
    display: grid;
    place-items: center;
    background: #f8fafc;
}

.color-chip.picker input {
    width: 100%;
    height: 100%;
    border: none;
    padding: 0;
    background: transparent;
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
}

.icon-bubble {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: grid;
    place-items: center;
    background: #f8fafc;
}

.icon-bubble.active {
    background: #eef2ff;
    border-color: #6366f1;
    color: #4f46e5;
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
}

.micro {
    margin: 4px 0 0;
    font-size: 12px;
    color: #475569;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #0f172a;
}

.checkbox input {
    width: 18px;
    height: 18px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

.primary-btn.solid {
    width: auto;
    padding: 12px 16px;
    border-radius: 12px;
}

.error-text {
    color: #e11d48;
    font-size: 13px;
    margin: 0;
}

.success-text {
    color: #16a34a;
    font-size: 13px;
    margin: 0;
}

.chip-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: #fff;
    padding: 8px 10px 12px;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -8px 20px rgba(15, 23, 42, 0.08);
}

.nav-btn {
    border: none;
    background: none;
    display: grid;
    justify-items: center;
    gap: 4px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
}

.nav-btn.active {
    color: #4f46e5;
}
</style>
