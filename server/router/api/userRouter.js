
const router = require('express').Router();
const UsersController = require('../../controllers/UserController');
const auth = require('../../utils/auth');

/**
* @swagger
* definitions:
*   Users:
*     properties:
*       id:
*         type: integer
*       userid:
*         type: string
*       name:
*         type: string
*       email:
*         type: string
*       phone:
*         type: string
*       role:
*         type: integer
*       state:
*         type: integer
*       last_login:
*         type: string
*       last_logout:
*         type: string
*       reg_date:
*         type: string
*       update_date:
*         type: string
*   UserRoles:
*     properties:
*       id:
*         type: integer
*       name:
*         type: string
*       desc:
*         type: string
*/


/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     description: Return a specific user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: userId
 *        description: numeric id of the user to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single user object
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.get('/:id([0-9]{1,10})', auth.isAuthunticated, UsersController.getUserById);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user profile
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.get('/profile', auth.isAuthunticated, UsersController.getProfile);


/**
 * @swagger
 * /users/list:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user list (array object)
 *         schema:
 *           type: array
 *           $ref: '#/definitions/Users'
 */
 router.get('/list', auth.isAuthunticated, UsersController.getList);


 /**
 * @swagger
 * /users/roles:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return user role list (array object)
 *         schema:
 *           type: array
 *           $ref: '#/definitions/UserRoles'
 */
router.get('/roles', auth.isAuthunticated, UsersController.getRoles);

/**
 * @swagger
 * /users/role/{roleid}:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: roleid
 *        description: roleid is required to get role info.
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: return the specific role
 *         schema:
 *           type: object
 *           $ref: '#/definitions/UserRoles'
 */
router.get('/role/:id([0-9]{1,10})', auth.isAuthunticated, UsersController.getRoleById);


 /**
 * @swagger
 * /users/group:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: get all user groups or sepecific user group
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - userid
 *         properties:
 *           userid:
 *             type: integer
 *           groupid:
 *             type: integer
 *     responses:
 *       200:
 *         description: return user group list (array object)
 *         schema:
 *            properties:
 *              id:
 *                type: integer
 *              uid:
 *                type: integer
 *              gid:
 *                type: integer
 */
router.post('/group', auth.isAuthunticated, UsersController.getUserGroup);


 /**
 * @swagger
 * /users/tree:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return user clean routes tree
 */
  router.get('/tree', auth.isAuthunticated, UsersController.getUserTree);


/**
 * @swagger
 * /users/delete:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: body
 *        name: body
 *        type: array
 *        description: delete user by id (single or array of userid) is required.
 *        required: true
 *        schema:
 *          items:
 *            properties:
 *              userid:
 *                type: number
 *     responses:
 *       200:
 *         description: user is successfully deleted.
 */
 router.post('/delete', auth.isAuthunticated, UsersController.deleteById);


/**
 * @swagger
 * /users/update/{userid}:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: path
 *        name: userid
 *        description: userid is required.
 *        required: true
 *        type: integer
 *        minimum: 1
 *      - in: body
 *        name: body
 *        description: coulde update user name, email, phone or role
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            phone:
 *              type: string
 *            role:
 *              type: number
 *     responses:
 *       200:
 *         description: return the updated user info
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Users'
 */
router.post('/update/:id([0-9]{1,10})', auth.isAuthunticated, UsersController.updateById);


/**
 * @swagger
 * /users/setpwd/{userid}:
 *   description: super administrator could reset user password.
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: path
 *        name: userid
 *        description: userid is required.
 *        required: true
 *        type: integer
 *        minimum: 1
 *      - in: body
 *        name: body
 *        description: update the user password
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            password:
 *              type: string
 *            repeat_password:
 *              type: string
 *     responses:
 *       200:
 *         description: User password is successfully modified.
 */
router.post('/setpwd/:id([0-9]{1,10})', auth.isAuthunticated, UsersController.setPwdById);


/**
 * @swagger
 * /users/modpwd/{userid}:
 *   description: user could update their own password.
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: path
 *        name: userid
 *        description: userid is required.
 *        required: true
 *        type: integer
 *        minimum: 1
 *      - in: body
 *        name: body
 *        description: update the user password
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            current_password:
 *              type: string
 *            new_password:
 *              type: string
 *            repeat_password:
 *              type: string
 *     responses:
 *       200:
 *         description: User password is successfully modified.
 */
 router.post('/modpwd/:id([0-9]{1,10})', auth.isAuthunticated, UsersController.modPwdById);

module.exports = router;
