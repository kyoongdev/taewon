
const router = require('express').Router();
const GroupsController = require('../../controllers/GroupController');
const auth = require('../../utils/auth');

/**
* @swagger
* definitions:
*   Groups:
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
 * /groups/list:
 *   get:
 *     tags:
 *       - Groups
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the group list (array)
 *         schema:
 *           type: array
 *           $ref: '#/definitions/Groups'
 */
router.get('/list', auth.isAuthunticated, GroupsController.getList);


/**
 * @swagger
 * /groups/{groupid}:
 *   get:
 *     tags:
 *       - Groups
 *     description: Return a specific user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: groupid
 *        description: numeric id of the group to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single group object
 *         schema:
 *           $ref: '#/definitions/Groups'
 */
router.get('/:id([0-9]{1,10})', auth.isAuthunticated, GroupsController.getGroupById);


/**
  * @swagger
  * /groups/add:
  *   post:
  *     tags:
  *       - Groups
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: register new group
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - name
  *           - desc
  *         properties:
  *           name:
  *             type: string
  *           desc:
  *             type: string
  *     responses:
  *       200:
  *         description: group is successfully registered.
  *         schema:
  *           type: array
  *           $ref: '#/definitions/Groups'
  */
 router.post('/add', auth.isAuthunticated, GroupsController.newGroup);


/**
 * @swagger
 * /groups/delete:
 *   post:
 *     tags:
 *       - Groups
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: body
 *        name: body
 *        type: array
 *        description: groupid is required.
 *        required: true
 *        schema:
 *          items:
 *            properties:
 *              groupid:
 *                type: number
 *     responses:
 *       200:
 *         description: group is successfully deleted.
 */
 router.post('/delete', auth.isAuthunticated, GroupsController.deleteById);


/**
 * @swagger
 * /groups/update/{groupid}:
 *   post:
 *     tags:
 *       - Groups
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: path
 *        name: groupid
 *        description: groupid is required.
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
 *            desc:
 *              type: string
 *     responses:
 *       200:
 *         description: return update group info.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Groups'
 */
router.post('/update/:id([0-9]{1,10})', auth.isAuthunticated, GroupsController.updateById);


/**
  * @swagger
  * /groups/user:
  *   post:
  *     tags:
  *       - Groups
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       type: array
  *       description: set user's group. command values (add - 100, del - 200)
  *       required: true
  *       schema:
  *         items:
  *           properties:
  *             cmd:
  *               type: integer
  *             id:
  *               type: integer
  *             gid:
  *               type: integer
  *             uid:
  *               type: integer
  *     responses:
  *       200:
  *         description: group's user command is successfully executed.
  */
router.post('/user', auth.isAuthunticated, GroupsController.userGroup);


/**
  * @swagger
  * /groups/vehicle:
  *   post:
  *     tags:
  *       - Groups
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       type: array
  *       description: set vehicle's group. command values (add - 100, del - 200)
  *       required: true
  *       schema:
  *         items:
  *           properties:
  *             cmd:
  *               type: integer
  *             id:
  *               type: integer
  *             gid:
  *               type: integer
  *             vid:
  *               type: integer
  *     responses:
  *       200:
  *         description: group's vehicle command is successfully executed.
  */
router.post('/vehicle', auth.isAuthunticated, GroupsController.vehicleGroup);


/**
  * @swagger
  * /groups/charge_station:
  *   post:
  *     tags:
  *       - Groups
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       type: array
  *       description: set group's charge station. command values (add - 100, del - 200)
  *       required: true
  *       schema:
  *         items:
  *           properties:
  *             cmd:
  *               type: integer
  *             id:
  *               type: integer
  *             gid:
  *               type: integer
  *             name:
  *               type: string
  *             address:
  *               type: string
  *             location:
  *               type: string
  *     responses:
  *       200:
  *         description: group's charge station command is successfully executed.
  */
 router.post('/charge_station', auth.isAuthunticated, GroupsController.groupChargeStation);


/**
  * @swagger
  * /groups/garage:
  *   post:
  *     tags:
  *       - Groups
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       type: array
  *       description: set group's gargage. command values (add - 100, del - 200)
  *       required: true
  *       schema:
  *         items:
  *           properties:
  *             cmd:
  *               type: integer
  *             id:
  *               type: integer
  *             gid:
  *               type: integer
  *             name:
  *               type: string
  *             address:
  *               type: string
  *             location:
  *               type: string
  *     responses:
  *       200:
  *         description: group's gargage command is successfully executed.
  */
router.post('/garage', auth.isAuthunticated, GroupsController.groupGarage);

module.exports = router;
