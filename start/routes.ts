/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import hash from '@adonisjs/core/services/hash'
import app from '@adonisjs/core/services/app'
const KategoriController = () => import('#controllers/kategori_controller')
import { writeFile } from 'node:fs/promises'

const PencatatanController = () => import('../app/controllers/pencatatan_controller.js')
const SessionController = () => import('#controllers/session_controller')
const ProfileController = () => import('#controllers/profile_controller')
const ArticlesController = () => import('#controllers/articles_controller') // Import controller artikel

router
  .group(() => {
    router.get('/pencatatan', [PencatatanController, 'index'])
    router.get('/pencatatan/:id', [PencatatanController, 'show'])
    router.post('/pencatatan', [PencatatanController, 'store'])
    router.put('/pencatatan/:id', [PencatatanController, 'update'])
    router.delete('/pencatatan/:id', [PencatatanController, 'destroy'])
    router.get('/profile', [ProfileController, 'getProfile'])

    // Update profile
    router.post('/profile/update', [ProfileController, 'updateProfile'])

    // Change password
    router.post('/profile/change-password', [ProfileController, 'changePassword'])

    // Delete avatar
    router.delete('/profile/avatar', [ProfileController, 'deleteAvatar'])
  })
  .use(middleware.auth({ guards: ['api'] }))

router.post('/register', [SessionController, 'register'])
router.post('/login', [SessionController, 'login'])
router.post('/google-login', [SessionController, 'googleLogin']);



router.delete('/logout', [SessionController, 'logout']).use(middleware.auth({ guards: ['api'] }))
router.get('/kategori', [KategoriController, 'index']).use(middleware.auth({ guards: ['api'] }))
router.post('/kategori', [KategoriController, 'store']).use(middleware.auth({ guards: ['api'] }))

// Grup rute untuk API articles yang dilindungi oleh internalApiKey middleware
router
  .group(() => {
    router.get('/articles', [ArticlesController, 'index'])
    router.get('/articles/:id', [ArticlesController, 'show'])
    router.post('/articles', [ArticlesController, 'store'])
  })
  .prefix('/api')
  .use(middleware.internalApiKey())

// Rute dasar (jika belum ada)
router.get('/', async () => {
  return { hello: 'world' }
})
