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

router.get('/profile', async ({ auth }) => {
  const user = await auth.getUserOrFail()

  return {
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar ?? '/images/default-avatar.png',

  }
}).use(middleware.auth())

router.put('/profile/update', [ProfileController, 'updateProfile']).use(middleware.auth())
router.put('/profile/password', [ProfileController, 'changePassword']).use(middleware.auth())

router.post('/profile/update', async ({ request, auth, response }) => {
  const user = await auth.getUserOrFail()
  const fullName = request.input('fullName')
  const avatar = request.file('avatar')

  if (fullName) {
    user.fullName = fullName
  }

  if (avatar) {
    const fileName = `${Date.now()}.${avatar.extname}`
    await avatar.move(app.makePath('public/uploads'), {
      name: fileName,
      overwrite: true,
    })

    if (!avatar.isValid) {
      return response.badRequest({ message: 'Gagal upload avatar' })
    }

    user.avatar = `/uploads/${fileName}`
  }

  await user.save()
  return response.ok({ message: 'Profil berhasil diperbarui!' })
}).use(middleware.auth())


router.post('/profile/change-password', async ({ request, auth, response }) => {
  const user = await auth.getUserOrFail()
  const currentPassword = request.input('currentPassword')
  const newPassword = request.input('newPassword')

  const isValid = await hash.verify(user.password, currentPassword)

  if (!isValid) {
    return response.badRequest({ message: 'Password saat ini salah' })
  }

  user.password = await hash.make(newPassword)
  await user.save()

  return response.ok({ message: 'Password berhasil diubah!' })
}).use(middleware.auth())

router
  .group(() => {
    router.get('/pencatatan', [PencatatanController, 'index'])
    router.get('/pencatatan/:id', [PencatatanController, 'show'])
    router.post('/pencatatan', [PencatatanController, 'store'])
    router.put('/pencatatan/:id', [PencatatanController, 'update'])
    router.delete('/pencatatan/:id', [PencatatanController, 'destroy'])
  })
  .use(middleware.auth({ guards: ['api'] }))

router.post('/register', [SessionController, 'register'])
router.post('/login', [SessionController, 'login'])
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