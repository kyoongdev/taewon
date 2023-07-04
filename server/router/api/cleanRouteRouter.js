
const router = require('express').Router();
const CleanRouteController = require('../../controllers/CleanRouteController');
const auth = require('../../utils/auth');

/**
* @swagger
* definitions:
*   Routes:
*     properties:
*       id:
*         type: integer
*       gid:
*         type: integer
*       name:
*         type: string
*       start_point:
*         type: string
*       end_point:
*         type: string
*       area:
*         type: string
*   RouteDetails:
*     properties:
*       id:
*         type: integer
*       vid:
*         type: integer
*       charge_id:
*         type: integer
*       garage_id:
*         type: integer
*       clean_start_time:
*         type: integer
*       clean_endtime_time:
*         type: integer
*       estimated_time:
*         type: integer
*/


/**
 * @swagger
 * /routes/list:
 *   get:
 *     tags:
 *       - Routes
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the route list
 *         schema:
 *           type: array
 *           $ref: '#/definitions/Routes'
 */
router.get('/list', auth.isAuthunticated, CleanRouteController.getList);

/**
 * @swagger
 * /routes/detaillist:
 *   get:
 *     tags:
 *       - Routes
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the route list
 *         schema:
 *           type: array
 *           $ref: '#/definitions/Routes'
 */
 router.get('/detaillist', auth.isAuthunticated, CleanRouteController.getDetailList);

/**
 * @swagger
 * /routes/{routeid}:
 *   get:
 *     tags:
 *       - Routes
 *     description: Return a specific user
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: routeid
 *        description: numeric id of the route to get
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single route object
 *         schema:
 *           $ref: '#/definitions/Routes'
 */
router.get('/:id([0-9]{1,10})', auth.isAuthunticated, CleanRouteController.getRouteById);


/**
  * @swagger
  * /routes/add:
  *   post:
  *     tags:
  *       - Routes
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: register new route
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - gid
  *           - name
  *           - start_point
  *           - end_point
  *           - area
  *         properties:
  *           gid:
  *             type: number
  *           name:
  *             type: string
  *           start_point:
  *             type: string
  *           end_point:
  *             type: string
  *           area:
  *             type: string
  *     responses:
  *       200:
  *         description: route is successfully registered.
  *         schema:
  *           type: object
  *           $ref: '#/definitions/Routes'
  */
 router.post('/add', auth.isAuthunticated, CleanRouteController.newRoute);


/**
  * @swagger
  * /routes/details:
  *   post:
  *     tags:
  *       - Routes
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: set route detail
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - cmd
  *           - id
  *           - rid
  *           - vid
  *           - name
  *           - charge_id
  *           - garage_id
  *         properties:
  *           cmd:
  *             type: number
  *           id:
  *             type: number
  *           rid:
  *             type: number
  *           vid:
  *             type: number
  *           name:
  *             type: string
  *           charge_id:
  *             type: number
  *           garage_id:
  *             type: number
  *     responses:
  *       200:
  *         description: route is successfully registered.
  *         schema:
  *           type: object
  *           $ref: '#/definitions/Routes'
  */
 router.post('/details', auth.isAuthunticated, CleanRouteController.setRouteDetail);


/**
 * @swagger
 * /routes/update/{routeid}:
 *   post:
 *     tags:
 *       - Routes
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: path
 *        name: routeid
 *        description: routeid is required.
 *        required: true
 *        type: integer
 *        minimum: 1
 *      - in: body
 *        name: body
 *        description: coulde update Routes
 *        required: true
 *        schema:
 *          type: object
 *          required: true
 *            - gid
 *            - name
 *            - start_point
 *            - end_point
 *            - area
 *          properties:
 *            name:
 *              type: string
 *            start_point:
 *              type: string
 *            end_point:
 *              type: string
 *            area:
 *              type: string
 *     responses:
 *       200:
 *         description: return update route info.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Routes'
 */
router.post('/update/:id([0-9]{1,10})', auth.isAuthunticated, CleanRouteController.updateById);

/**
 * @swagger
 * /routes/delete/{routeid}:
 *   post:
 *     tags:
 *       - Routes
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: routeid
 *        description: routeid is required.
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: route is successfully deleted.
 */
router.post('/delete/:id([0-9]{1,10})', auth.isAuthunticated, CleanRouteController.deleteById);

/**
 * @swagger
 * /routes/details/delete:
 *   post:
 *     tags:
 *       - Routes
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         type: array
 *         description: id is required.
 *     responses:
 *       200:
 *         description: route detail is successfully deleted.
 */
 router.post('/details/delete', auth.isAuthunticated, CleanRouteController.deleteRoutesDetailById);


module.exports = router;
