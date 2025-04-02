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
const PencatatanController = () => import('../app/controllers/pencatatan_controller.js')
const SessionController = () => import('#controllers/session_controller')

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
