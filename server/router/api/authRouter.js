const router = require('express').Router();
const AuthController = require('../../controllers/AuthController');
const auth = require('../../utils/auth');

/**
 * @swagger
 * /findId:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          description: require user's name and email address
 *          required: true
 *          schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *            properties:
 *              username:
 *                type: string
 *              email:
 *                type: string
 *     responses:
 *       200:
 *         description: Your account have found. Your id is [{userid}]
 */
 router.post('/findId', AuthController.findID);

 
/**
 * @swagger
 * /findPwd:
 *   post:
 *     tags:
 *       - Auth
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: body
 *          name: body
 *          description: require user's id, name and email address
 *          required: true
 *          schema:
 *            type: object
 *            required:
 *              - userid
 *              - username
 *              - email
 *            properties:
 *              userid:
 *                type: string
 *              username:
 *                type: string
 *              email:
 *                type: string
 *     responses:
 *       200:
 *         description: Reset password link have sent to your email address, [{email}].
 */
 router.post('/findPwd', AuthController.findPwd);


/**
  * @swagger
  * /login:
  *   post:
  *     tags:
  *       - Auth
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: the login credentials
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - userid
  *           - password
  *         properties:
  *           userid:
  *             type: string
  *           password:
  *             type: string
  *     responses:
  *       200:
  *         description: user logged in successfully
  */
router.post('/login', AuthController.login);


/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Auth
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: log out from application
 */
 router.post('/logout', auth.isAuthunticated, AuthController.logOut);

 
/**
  * @swagger
  * /signUp:
  *   post:
  *     tags:
  *       - Auth
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: sign up using userid, password, name, email, phone and roleid
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - userid
  *           - password
  *           - name
  *           - email
  *         properties:
  *           userid:
  *             type: string
  *           password:
  *             type: string
  *           name:
  *             type: string
  *           email:
  *             type: string
  *           phone:
  *             type: string
  *           roleid:
  *             type: number
  *     responses:
  *       200:
  *         description: user is successfully registered.
  *         schema:
  *           type: object
  *           $ref: '#/definitions/Users'
  */
router.post('/signUp', auth.isAuthunticated, AuthController.signUp);


/**
  * @swagger
  * /refreshToken:
  *   post:
  *     tags:
  *       - Auth
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: the refresh token
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - refreshToken
  *         properties:
  *           refreshToken:
  *             type: string
  *     responses:
  *       200:
  *         description: a new jwt token with a new expiry date is issued
  */
router.post('/refreshToken', auth.isAuthunticated, AuthController.refreshToken);

module.exports = router;
