const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const _ = require('lodash');
const BaseController = require('../controllers/BaseController');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class VehicleController extends BaseController {
	
	static async getVehicleById(req, res) {
		try {
			const schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
      
			const { error } = schema.validate({ id: req.params.id });
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid vehicle id');
			}
      const options = {
        where:{ id: req.params.id},
        include: [
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_type], as: DEFINED.tbAlias.VehicleType
          },
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup
          }
        ],
      }
      let result = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle, options);
      if(result){
        return requestHandler.sendSuccess(res, `Vehicle data by id ${req.params.id}.`)(result);
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid vehicle id');
      }
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

	static async deleteById(req, res) {
		try {
      //check vehicleid
      let arrData = []
      let vids = req.body
      if(!_.isArray(vids)) {
        arrData.push(vids)
      }else{
        arrData = _.cloneDeep(vids, true)
      }
      const schema = Joi.object({
        vehicleid: Joi.number().integer().min(1),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid vehicle id');
        return
      }
      vids = arrData.map(u => u.vehicleid)
      const options = { 
        where : { 
          id: {
            [Op.in]: vids
          }
        }
      }
			const result = await super.deleteById(req, DEFINED.tableNames.tbl_vehicle, options);
			return requestHandler.sendSuccess(res, 'Vehicle successfully deleted')(result);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

  static async getList(req, res) {
    try {
      const raw = req.params.raw;
      let options = {}
      if(!raw) {
        options = {
          order: [['id','DESC']],
          include: [
            {
              model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_type], as: DEFINED.tbAlias.VehicleType
            },
            {
              model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup
            }
          ],
        }
      }else {
        options = {order: [['id','DESC']]}
      }
			const vehicleList = await super.getList(req, DEFINED.tableNames.tbl_vehicle, options);
      return requestHandler.sendSuccess(res, 'Vehicle fetched Successfully')(vehicleList);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getTypes(req, res) {
    try {
			const vehicleType = await super.getList(req, DEFINED.tableNames.tbl_vehicle_type);
      return requestHandler.sendSuccess(res, 'all vehicle types')(vehicleType);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getTypeById(req, res) {
    try {
      const reqParam = req.params.id;
			const schema = Joi.object({
				id: Joi.number().integer().min(1),
			});

			const { error } = schema.validate({ id: reqParam });
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid type id');
			}
      const options = {
        where:{ id: reqParam}
      }
			const vehicleType = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle_type, options);
      if(vehicleType) {
        return requestHandler.sendSuccess(res, 'vehicle type by roleid')(vehicleType);
      } else {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid vehicle type id');
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async updateById(req,res) {
    try {
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { vehicleid_error } = schema.validate({ id:  req.params.id });
      if(vehicleid_error) {
        requestHandler.validateJoi(vehicleid_error, 400, 'Bad request', 'Invalid vehicle id');
			}
      schema =  Joi.object({
				vcode: Joi.string(),
        name:  Joi.string(),
        type:  Joi.number().integer().min(1),
        model: Joi.string(),
        myear: Joi.string(),
			}).required()
      const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      
      //check duplicated name or vcode
			let options = { 
        where: { 
          [Op.and]:[
            { id: {
              [Op.ne]: req.params.id}
            }
          ],
          [Op.or]: [
            { name: req.body.name },
            { vcode: req.body.vcode }
          ]
        },
        raw: true 
      };
			let vehicle = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle, options);
			if (vehicle) {
        if(req.body.vcode === vehicle.vcode) {
          requestHandler.throwError(400, 'Bad request', `Invalid vehicle code, [${req.body.vcode}] vehicle code already existed`)();
        }
        else{
          requestHandler.throwError(400, 'Bad request', `Invalid vehicle name, [${req.body.name}] vehicle name already existed`)();
        }
			}

      //get vehicle
      options = {
        where: { id: req.params.id },
        include: [
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_type], as: DEFINED.tbAlias.VehicleType
          },
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup
          }
        ],
      }
      vehicle = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle, options);
      if(vehicle){
        // update vehicle info
        const ret = await super.updateById(req, DEFINED.tableNames.tbl_vehicle, req.body);
        if(ret) {
          vehicle = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle, options);
          requestHandler.sendSuccess(res, 'vehicle is successfully updated.', 200)(vehicle);
        }
        else{
          requestHandler.throwError(500, 'Server error', "Failed to update vehicle information.")();
        }
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid vehicle id');
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async newVehicle(req, res) {
    try {
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { vehicleid_error } = schema.validate({ id:  req.params.id });
      if(vehicleid_error) {
        requestHandler.validateJoi(vehicleid_error, 400, 'Bad request', 'Invalid vehicle id');
			}
      schema =  Joi.object({
				vcode: Joi.string().required(),
        name:  Joi.string().required(),
        type:  Joi.number().integer().required(),
        model: Joi.string().optional(),
        myear: Joi.string().optional(),
			})
      const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
			//check duplicated name or vcode
			let options = { 
        where: { 
          [Op.or]: [
            { name: req.body.name },
            { vcode: req.body.vcode }
          ]
        },
        raw: true 
      };
			let vehicle = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle, options);
      if (vehicle) {
        if(req.body.vcode === vehicle.vcode) {
          requestHandler.throwError(400, 'Bad request', `Invalid vehicle code, [${req.body.vcode}] vehicle code already existed`)();
        }
        else{
          requestHandler.throwError(400, 'Bad request', `Invalid vehicle name, [${req.body.name}] vehicle name already existed`)();
        }
			}

      //register new vehicle
			const created = await super.create(req, DEFINED.tableNames.tbl_vehicle);
			if (!(_.isNull(created))) {
        options = { 
          where: { 
           id: created.id
          },
          include: [
            {
              model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_type], as: DEFINED.tbAlias.VehicleType
            },
            {
              model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup
            }
          ],
          raw: true 
        };
        vehicle = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_vehicle, options);
				requestHandler.sendSuccess(res, 'vehicle is successfully registered.', 200)(vehicle);
			} else {
				requestHandler.throwError(422, 'Unprocessable Entity', 'Failed to register group.')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
  }

  static async getVehicleGroup(req, res) {
    try {
      const schema =  Joi.object({
				vehicleid:  Joi.number().integer().min(1).required(),
        groupid: Joi.number().integer().optional()
			})
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      const {groupid, vehicleid} = req.body
      let where 
      if(groupid) {
        where = {
          vid: vehicleid,
          gid: groupid
        }
      }else{
        where = {
          vid: vehicleid
        }
      }
      const options = {
        include: [
          { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, where},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false},
        ]
      }
			const vehicleGroups = await super.getList(req, DEFINED.tableNames.tbl_group, options);
      if(vehicleGroups) {
        return requestHandler.sendSuccess(res, 'vehicle group successfully fetched')(vehicleGroups);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'your session might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getDetectedFOD(req, res) { 
    try {
      const schema =  Joi.object({
				vid:  Joi.number().integer().min(1).required(),
        rid: Joi.number().integer().optional()
			})
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      const {vid, rid} = req.body
      let where 
      if(rid) {
        where = {
          vid,
          rid
        }
      }else{
        where = {
          vid
        }
      }
      const options = { where }
			const VehicleFod = await super.getList(req, DEFINED.tableNames.tbl_vehicle_fod, options);
      if(VehicleFod) {
        return requestHandler.sendSuccess(res, 'vehicle group successfully fetched')(VehicleFod);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'your session might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }
  
  static async uploadFile(req, res) { 
    try {
      // const schema =  Joi.object({
      //   key: Joi.string().required()
			// })
			// const { error } = schema.validate(req.body);
			// if(error) {
			// 	requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			// }
      res.json({ message: "Successfully uploaded files" });
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }
}


module.exports = VehicleController;
