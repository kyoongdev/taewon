
const router = require('express').Router();
const WsController = require('../../controllers/WsController');

/**
 * @swagger
 * /ws/commands:
 *   post:
 *     tags:
 *       - Websocket
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ws_message
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              header:
 *                type: object
 *                properties:
 *                  Code:
 *                    type: number
 *                  VID:
 *                    type: number
 *                  Datetime:
 *                    type: string
 *                    format: date-time
 *              payload:
 *                type: object
 *     responses:
 *       200:
 *         description: Command is successfully sent
 */
router.post('/commands', WsController.sendCommand);

/**
 * @swagger
 * /ws/events:
 *   post:
 *     tags:
 *       - Websocket
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: ws_message
 *         required: true
 *         schema:
 *            type: object
 *            properties:
 *              header:
 *                type: object
 *                properties:
 *                  Code:
 *                    type: number
 *                  VID:
 *                    type: number
 *                  Datetime:
 *                    type: string
 *                    format: date-time
 *              payload:
 *                type: object
 *     responses:
 *       200:
 *         description: Event is successfully sent
 */
 router.post('/events', WsController.sendEvent);

module.exports = router;