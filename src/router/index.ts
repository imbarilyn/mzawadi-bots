import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/admin'
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/Auth/RootPage.vue'),
    children: [
      {
        path: 'signup',
        name: 'Signup',
        component: () => import('../views/Auth/SignupPage.vue')
      },
      {
        path: 'admin/login',
        name: 'admin-login',
        component: () => import('../views/Auth/AdminLoginPage.vue')
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('../views/Auth/Users/UsersPage.vue'),
        children: [
          {
            path: ':chatbotId/:pageId/login',
            name: 'user-login',
            component: () => import('../views/Auth/Users/UserLoginPage.vue'),
            props: (route: any) => {
              return {
                pageId: route.params.pageId,
                chatbotId: route.params.chatbotId
              }
            }
          },
          {
            path: ':chatbotId/:pageId/signup',
            name: 'user-signup',
            component: () => import('../views/Auth/Users/UsersSignUpPage.vue'),
            props: (route: any) => {
              return {
                pageId: route.params.pageId,
                chatbotId: route.params.chatbotId
              }
            }
          }
        ]
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/Auth/ForgotPasswordPage.vue')
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: () => import('../views/Auth/ResetPasswordPage.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'HomeAdmin',
    component: () => import('../views/HomeAdmin.vue'),
    children: [
      {
        path: 'pages',
        name: 'AdminPages',
        component: () => import('../views/Admin/PagesPage.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/Admin/SettingsPage.vue'),
        children: [
          {
            path: 'home',
            redirect: 'admin/settings/general'
          },
          {
            path: ':tab',
            name: 'AdminSettingsTab',
            component: () => import('../views/Admin/SettingsTab.vue'),
            props: (route: any) => {
              return {
                tab: route.params.tab
              }
            }
          }
        ]
      },
      {
        path: '',
        name: 'AdminHome',
        component: () => import('../views/Admin/HomePage.vue')
      },
      {
        path: ':page',
        name: 'DynamicPage',
        component: () => import('../views/Admin/DynamicPage.vue'),
        props: (route: any) => {
          return {
            page: route.params.page,
            pageId: route.query.pageId
          }
        }
      }
    ]
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/ChatPage.vue'),
    children: [
      {
        path: ':chatbotId/:pageId',
        name: 'chatbot-page',
        component: () => import('../views/Chats/ChatbotPage.vue'),
        props: (route: any) => {
          return {
            chatbotId: route.params.chatbotId,
            pageId: route.params.pageId
          }
        },
        beforeEnter: (to: any, _from: any, next: any) => {
          const chatbotId = to.params.chatbotId
          const pageId = to.params.pageId
          const authStore = useAuthStore()

          if (!chatbotId || !pageId) {
            next({ name: 'not-found' })
          } else if (!authStore.userIsLoggedIn()) {
            if (authStore.userIsAdmin()) {
              next({ name: 'admin-login' })
            } else {
              console.log('user-login', pageId, chatbotId)
              next({ name: 'user-login', query: { pageId, chatbotId } })
            }
          } else {
            next()
          }
        }
      }
    ]
  },
  // all
  {
    path: '/:notFound(.*)*',
    name: 'not-found',
    component: () => import('../views/errors/NotFound.vue')
  }
] as any[]

const router = createRouter({
  history: createWebHistory(),
  // @ts-ignore
  // base: process.env.VITE_APP_BASE_URL || '/',
  base: '/',
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  }
  // history: createWebHistory()
} as any)

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  const userInfo = authStore.getUserInfo()

  console.log('userInfo', userInfo)

  const excludedRoutes = [
    'landing',
    'admin-login',
    'user-login',
    'user-signup',
    'otp',
    'not-found',
    'forgot-password',
    'reset-password'
  ]

  const isExcludedRoute = excludedRoutes.includes(to.name as string)

  // is the user accessing the admin area?
  const isAdminRoute = to.path.includes('/admin')

  if (!authStore.userIsLoggedIn()) {
    if (!isExcludedRoute) {
      // if the user is not logged in, redirect to login page
      if (isAdminRoute) {
        next({ name: 'admin-login' })
      } else {
        next({
          name: 'user-login',
          params: { pageId: to.params.pageId, chatbotId: to.params.chatbotId }
        })
      }
    } else {
      next()
    }
  } else {
    // if the user is logged in and is trying to access the login page, redirect to home page
    if (isExcludedRoute) {
      if (isAdminRoute) {
        next({ name: 'AdminHome' })
      } else {
        if (authStore.userIsAdmin()) {
          next({ name: 'AdminHome' })
        } else {
          next({ name: 'chatbot-page' })
        }
      }
    } else {
      next()
    }
  }
})

export default router
