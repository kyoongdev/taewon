
const router = require('express').Router();
const VehicleController = require('../../controllers/VehicleController');
const auth = require('../../utils/auth');
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads');
    },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});
const upload = multer({storage: storage}).single('file');

/**
* @swagger
* definitions:
*   Vehicles:
*     properties:
*       id:
*         type: integer
*       vcode:
*         type: string
*       name:
*         type: string
*       type:
*         type: integer
*       model:
*         type: string
*       myear:
*         type: string
*       state:
*         type: integer
*       latitude:
*         type: double
*       longtitude:
*         type: double
*       voltage:
*         type: float
*       garbage:
*         type: integer
*       battery:
*         type: integer
*       reg_date:
*         type: date
*       update_date:
*         type: date
*   VehicleType:
*     properties:
*       id:
*         type: integer
*       name:
*         type: string
*       desc:
*         type: string
*   VehicleLog:
*     properties:
*       id:
*         type: integer
*       log_date:
*         type: integer
*       log_code:
*         type: integer
*       vid:
*         type: integer
*       rid:
*         type: integer
*       vstate:
*         type: integer
*       speed:
*         type: integer
*       latitude:
*         type: double
*       longtitude:
*         type: double
*       voltage:
*         type: float
*       garage:
*         type: integer
*       battery:
*         type: integer
*/


/**
 * @swagger
 * /vehicles/{vehicleid}:
 *   get:
 *     tags:
 *       - Vehicles
 *     description: Return a specific vehicle
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: vehicleid
 *        description: numeric id of the vehicle to query
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: a single vehicle object
 *         schema:
 *           $ref: '#/definitions/Vehicles'
 */
router.get('/:id([0-9]{1,10})', auth.isAuthunticated,  VehicleController.getVehicleById);


/**
 * @swagger
 * /vehicles/list:
 *   get:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return the user list (array object)
 *         schema:
 *           type: array
 *           $ref: '#/definitions/Vehicles'
 */
 router.get('/list', auth.isAuthunticated,  VehicleController.getList);
 router.get('/list/:raw', auth.isAuthunticated,  VehicleController.getList);


 /**
 * @swagger
 * /vehicles/types:
 *   get:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: return user type list (array object)
 *         schema:
 *           type: array
 *           $ref: '#/definitions/VehicleType'
 */
router.get('/types', auth.isAuthunticated,  VehicleController.getTypes);

/**
 * @swagger
 * /vehicles/type/{typeid}:
 *   get:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - name: typeid
 *        description: typeid is required to get type info.
 *        in: path
 *        required: true
 *        type: integer
 *        minimum: 1
 *     responses:
 *       200:
 *         description: return the specific type
 *         schema:
 *           type: object
 *           $ref: '#/definitions/VehicleType'
 */
router.get('/type/:id([0-9]{1,10})', auth.isAuthunticated,  VehicleController.getTypeById);


 /**
 * @swagger
 * /vehicles/group:
 *   post:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: get all vehicle groups or sepecific vehicle group
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - vehicleid
 *         properties:
 *           vehicleid:
 *             type: integer
 *           groupid:
 *             type: integer
 *     responses:
 *       200:
 *         description: return vehicle group list (array object)
 *         schema:
 *          properties:
 *            id:
 *              type: integer
 *            vid:
 *              type: integer
 *            gid:
 *              type: integer
 */
router.post('/group', auth.isAuthunticated,  VehicleController.getVehicleGroup);


/**
  * @swagger
  * /vehicles/add:
  *   post:
  *     tags:
  *       - Vehicles
  *     security:
  *       - Bearer: []
  *     produces:
  *       - application/json
  *     parameters:
  *     - name: body
  *       in: body
  *       description: register new vehicle
  *       required: true
  *       schema:
  *         type: object
  *         required:
  *           - vcode
  *           - name
  *         properties:
  *           vcode:
  *             type: string
  *           name:
  *             type: string
  *           type:
  *             type: integer
  *           model:
  *             type: string
  *           myear:
  *             type: string
  *     responses:
  *       200:
  *         description: vehicle is successfully registered.
  *         schema:
  *           type: array
  *           $ref: '#/definitions/Vehicles'
  */
 router.post('/add', auth.isAuthunticated, VehicleController.newVehicle);

/**
 * @swagger
 * /vehicles/delete:
 *   post:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: body
 *        name: body
 *        type: array
 *        description: delete vehicle by id (single or array of vehicleid) is required.
 *        required: true
 *        schema:
 *          items:
 *            properties:
 *              vehicleid:
 *                type: number
 *     responses:
 *       200:
 *         description: vehicle is successfully deleted.
 */
 router.post('/delete', auth.isAuthunticated,  VehicleController.deleteById);

/**
 * @swagger
 * /vehicles/update/{vehicleid}:
 *   post:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: path
 *        name: vehicleid
 *        description: vehicleid is required.
 *        required: true
 *        type: integer
 *        minimum: 1
 *      - in: body
 *        name: body
 *        description: coulde update vehicle vcode, name, model or myear
 *        required: true
 *        schema:
 *          type: object
 *          required:
 *            - vcode
 *            - name
 *          properties:
 *            vcode:
 *              type: string
 *            name:
 *              type: string
 *            type:
 *              type: integer
 *            model:
 *              type: string
 *            myear:
 *              type: string
 *     responses:
 *       200:
 *         description: return the updated vehicle info
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Vehicles'
 */
router.post('/update/:id([0-9]{1,10})', auth.isAuthunticated,  VehicleController.updateById);

 /**
 * @swagger
 * /vehicles/detected_fod:
 *   post:
 *     tags:
 *       - Vehicles
 *     security:
 *       - Bearer: []
 *     produces:
 *       - application/json
 *     parameters:
 *     - name: body
 *       in: body
 *       description: get vehicle fod 
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - vid
 *           - rid
 *         properties:
 *           vid:
 *             type: integer
 *           rid:
 *             type: integer
 *     responses:
 *       200:
 *         description: return vehicle fod list (array object)
 *         schema:
 *          properties:
 *            id:
 *              type: string
 *            vid:
 *              type: integer
 *            rid:
 *              type: integer
 *            lon:
 *              type: number
 *            lat:
 *              type: number
 *            label:
 *              type: string 
 *            image:
 *              type: string
 *            video:
 *              type: string
 *            create_dt:
 *              type: string
 */
  router.post('/detected_fod', auth.isAuthunticated,  VehicleController.getDetectedFOD);
  router.post('/uploadfile', upload, VehicleController.uploadFile);

module.exports = router;

