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
        name: 'forgot-password',
        component: () => import('../views/Auth/ForgotPasswordPage.vue')
      },
      {
        path: 'reset-password',
        name: 'reset-password',
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
        path: 'create-bot',
        name: 'CreateBot',
        component: () => import('../views/Admin/CreateChatbotPage.vue')
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
        path: '/page',
        name: 'DynamicSection',
        component: ()=> import('../views/Admin/DynamicParent.vue'),
        children: [
          {
            path: ':pageId',
            name: 'DynamicPage',
            component: () => import('../views/Admin/DynamicPage.vue'),
            props: (route: any) => {
              return {
                // page: route.params.page,
                // pageId: route.query.pageId
                pageId: route.params.pageId,
              }
            }
          },
          {
            path: ':pageId/settings',
            name: 'DynamicPageSettings',
            component: () => import('../views/Admin/DynamicPageSettings.vue'),
            props: (route: any) => {
              return {
                pageId: route.params.pageId
              }
            }
          }
        ]
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
        children: [],
        // beforeEnter: (to: any, _from: any, next: any) => {
        //   const chatbotId = to.params.chatbotId
        //   const pageId = to.params.pageId
        //   const authStore = useAuthStore()
        //
        //   console.log('chatbot-page', chatbotId, pageId)
        //   //
        //   // if (!chatbotId || !pageId) {
        //   //   console.log('No pageId or ChatbotId')
        //   //   next({ name: 'not-found' })
        //   // }
        //   // else if (authStore.chatBotUser || authStore.adminIsLoggedIn) {
        //   //   console.log('user-login', pageId, chatbotId)
        //   //   console.log('to', to.name)
        //   //   next()
        //   // }
        //   // next({ name: 'chatbot-signup', params: { pageId, chatbotId } })
        //
        //   // else if (!authStore.adminIsLoggedIn) {
        //   //   next({ name: 'admin-login' })
        //   // }else {
        //   // next()
        //   // }
        //   if (authStore.chatBotUser || authStore.adminIsLoggedIn) {
        //     next()
        //   }
        //   next()
        // }

        // beforeEnter: (to:any, from:any, next:any) =>{
        //   const chatbotId = to.params.chatbotId;
        //   const pageId = to.params.pageId;
        //   const authStore = useAuthStore();
        //   // if(!chatbotId || !pageId){
        //   //   next({name: 'not-found'})
        //   // }else if(!authStore.chatBotUser || !authStore.adminIsLoggedIn){
        //   //   next({name: 'lets-chat', params: {pageId, chatbotId}})
        //   // }
        //   // else if(authStore.adminIsLoggedIn){
        //   //   next({name: 'chatbot-page', params: {pageId, chatbotId}})
        //   // }
        //   if(!authStore.chatBotUser){
        //     console.log("Loading chatbot page")
        //     next({name: 'lets-chat', params: {pageId, chatbotId}})
        //   }
        //   next()
        //
        // }


      },
      {
        // path: 'sign-up',
        path: ':chatbotId/:pageId/lets-chat',
        name: 'lets-chat',
        component: () => import('../views/Auth/Users/UserLoginPage.vue'),
        props: (route: any) => {
          return {
            pageId: route.params.pageId,
            chatbotId: route.params.chatbotId
          }
        },
        beforeEnter: (to: any, _from: any, next: any) => {
          const chatbotId = to.params.chatbotId
          const pageId = to.params.pageId
          const authStore = useAuthStore()

          console.log('chatbot-signup', chatbotId, pageId)
          //
          if (!chatbotId || !pageId) {
            next({ name: 'not-found' })
            console.log('No pageId or ChatbotId')
          } else if (authStore.chatBotUser || authStore.adminIsLoggedIn) {
            console.log('admin is logged in')
            next({
              name: 'chatbot-page',
              params: { chatbotId: to.params.chatbotId, pageId: to.params.pageId }
            })
            }else if (!authStore.chatBotUser && !authStore.adminIsLoggedIn) {
              next()
          }
          //console.log('chat-bot beforeEnter')
          // next()
          // next()
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
    'reset-password',
    'lets-chat',
     'chatbot-page'
  ]

  const isExcludedRoute = excludedRoutes.includes(to.name as string)

  // is the user accessing the admin area?
  // const isAdminRoute = to.path.includes('/admin')

  if (!authStore.adminIsLoggedIn) {
    console.log('admin is not logged in')
    console.log('to.name', to.name)
    console.log('from.name', _from.name)
    if (!isExcludedRoute) {
      console.log('not excluded route')
      // if the admin is not logged in, redirect to login page
      next({ name: 'admin-login' })
    } else {
      console.log('excluded route')

         if (to.name === 'chatbot-page') {

           console.log('chatbot-page')
           const chatbotId = to.params.chatbotId
           const pageId = to.params.pageId

           console.log('user is not logged in', authStore.chatBotUser, authStore.adminIsLoggedIn)

           if (!chatbotId || !pageId) {
             next({name: 'not-found'})
           }
           else if(authStore.chatBotUser || authStore.adminIsLoggedIn){
             console.log('toxx', to.name)
             next();
           }
           // else if (!authStore.chat=BotUser || !authStore.adminIsLoggedIn) {
           //   console.log('load chatbot page')
           //   console.log('to', to.name)
           //   next()
           // }
         }



    }
  }
    else {

    next()
  }
  next()
})

export default router
