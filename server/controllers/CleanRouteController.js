const Joi = require('joi');
const _ = require('lodash');
const { Op } = require("sequelize");
const BaseController = require('../controllers/BaseController');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const Util = require('../utils/Util');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class CleanRouteController extends BaseController {

	static async getRouteById(req, res) {
		try {
			const reqParam = req.params.id;
			const schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { error } = schema.validate({ id: reqParam });
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid route id');
			}
      
      const options = {
        where : { id : req.params.id },
        include: [
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_group], as: DEFINED.tbAlias.Group
          },
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_route_detail], as: DEFINED.tbAlias.RouteDetail, include: { all: true }
          }
        ]
      }
      let result = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_route, options);
      if(result){
        return requestHandler.sendSuccess(res, 'Route data fetched')(result.dataValues);
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', `No route for id : ${reqParam}`);
      }
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

  static async newRoute(req, res) {
    try {
			const schema =  Joi.object({
        gid: Joi.number().integer().min(1),
				name: Joi.string(),
        start_point: Joi.string(),
        end_point: Joi.string(),
        area: Joi.string(),
        path_point: Joi.string()
			}).required()
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}

			//check duplicated route name
			let options = { where: { name: req.body.name } };
			let route = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_route, options);
			if (route) {
				requestHandler.throwError(400, 'Bad request', `Invalid route name, [${req.body.name}] route already existed`)();
			}

      //register new route
			const createdRoute = await super.create(req, DEFINED.tableNames.tbl_route);
			if (!(_.isNull(createdRoute))) {
				requestHandler.sendSuccess(res, 'Route is successfully registered.', 200)(createdRoute);
			} else {
				requestHandler.throwError(422, 'Unprocessable Entity', 'Failed to register route.')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
  }

  static async setRouteDetail(req, res) {
    try {
			const schema =  Joi.object({
        cmd: Joi.number().integer().valid(100, 200),
        id: Joi.number().optional(),
        rid: Joi.number().integer().min(1),
        vid: Joi.number().integer().min(1),
				name: Joi.string(),
        charge_id: Joi.number().integer().min(1),
        garage_id: Joi.number().integer().min(1)
			}).required()
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}

      const {cmd, id, rid, vid} = req.body
      if(cmd === 100) {
        //check duplicated route detail
        let options = { where: { rid, vid }, include:{all: true} };
        let route = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_route_detail, options);
        if (route) {
          requestHandler.throwError(400, 'Bad request', `${route.Vehicle.name} already has [${route.CleanRoute.name}] route detail.`)();
        }
        //register new route
        const createdRouteDetail = await super.create(req, DEFINED.tableNames.tbl_route_detail);
        if (!(_.isNull(createdRouteDetail))) {
          if(req.app.io) {
            let route = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_route_detail, options);
            const socketData = {
              subcmd: 'add',
              data: Util.getRouteInfo(route)
            }
            req.app.io.sendUserCommand(req.app.io.code.cmd.set_route, socketData, createdRouteDetail.vid)
          }
          requestHandler.sendSuccess(res, 'Route is successfully registered.', 200)(createdRouteDetail);
        } else {
          requestHandler.throwError(400, 'Unprocessable Entity', 'Failed to register route detail.')();
        }
      } else if(cmd === 200){
        const result = await super.deleteById(req, DEFINED.tableNames.tbl_route_detail, {where: {id}});
        if(result) {
          return requestHandler.sendSuccess(res, 'Route successfully deleted')(result);
        }else{
          requestHandler.throwError(400, 'Bad request', `failed to delete route detail [${id}].`)();
        }
      }else{
        requestHandler.throwError(400, 'Bad request', `unknown command [${cmd}].`)();
      }
      
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
  }

  static async updateById(req,res) {
    try {
      //check userid
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { groupid_error } = schema.validate({ id:  req.params.id });
      if(groupid_error) {
        requestHandler.validateJoi(groupid_error, 400, 'Bad request', 'Invalid route id');
			}

      schema =  Joi.object({
        gid: Joi.number().integer().optional(),
				name: Joi.string(),
        start_point: Joi.string(),
        end_point: Joi.string(),
        area: Joi.string(),
        path_point: Joi.string()
			}).required()
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      //check duplicated route name
      if(!_.isEmpty(req.body.name)) {
        let options = { where: { name: req.body.name , id : {[Op.ne]: req.params.id} } };
        const route = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_route, options);
        if (route) {
          requestHandler.throwError(400, 'Bad request', `Invalid route name, [${req.body.name}] route already existed`)();
        }
      }
      //get route
      let route = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_route, {where:{id: req.params.id}});
      if(route){
        const {name,start_point, end_point,area,path_point} = req.body
        if(name) route.name = name
        if(start_point) route.start_point = start_point
        if(end_point) route.end_point = end_point
        if(area) route.area = area
        if(path_point) route.path_point = path_point
        route.save();
        requestHandler.sendSuccess(res, 'route is successfully updated.', 200)(route);
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', `No route for ${req.params.id}`);
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

	static async deleteById(req, res) {
		try {
      //check userid
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { groupid_error } = schema.validate({ id:  req.params.id });
      if(groupid_error) {
        requestHandler.validateJoi(groupid_error, 400, 'Bad request', 'Invalid route id');
			}
			const result = await super.deleteById(req, DEFINED.tableNames.tbl_route);
      if(result) {
        return requestHandler.sendSuccess(res, 'Route successfully deleted')(result);
      }else{
        requestHandler.throwError(400, 'Bad request', `failed to delete route [${req.params.id}].`)();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

  static async getList(req, res) {
    try {
      const options = {
        order: [['id','DESC']],
        include:{all: true}
      }
			const groupList = await super.getList(req, DEFINED.tableNames.tbl_route, options);
      return requestHandler.sendSuccess(res, 'Route list successfully fetched')(groupList);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getDetailList(req, res) {
    try {
      const options = {
        order: [['id','DESC']],
        include:[
          {all: true},
          {model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false, include : {
            model: req.app.get('db')[DEFINED.tableNames.tbl_group], as: DEFINED.tbAlias.Group
          }
        }]
      }
			const groupList = await super.getList(req, DEFINED.tableNames.tbl_route_detail, options);
      return requestHandler.sendSuccess(res, 'Route list successfully fetched')(groupList);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }


  static async deleteRoutesDetailById(req, res) {
		try {
      //check groupid
      let arrData = []
      let rdids = req.body
      if(!_.isArray(rdids)) {
        arrData.push(rdids)
      }else{
        arrData = _.cloneDeep(rdids, true)
      }
      const schema = Joi.object({
        id: Joi.number().integer().min(1),
        vid: Joi.number().integer().min(1),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid route detail id');
        return
      }
      rdids = arrData.map(function(obj) {
        return obj.id;
      })
      const options = { 
        where : { 
          id: {
            [Op.in]: rdids
          }
        }
      }
			const result = await super.deleteById(req, DEFINED.tableNames.tbl_route_detail, options);
      if(result) {
        if(req.app.io) {         
          let d1 = {}
          arrData.map((obj) => {
            if(!d1[obj.vid]) {
              d1[obj.vid] = []
              d1[obj.vid].push({id:obj.id})
            }else{
              d1[obj.vid].push({id:obj.id})
            }
          })
          for (const [key, value] of Object.entries(d1)) {
            const socketData = {
              subcmd: 'delete',
              data: value
            }
            req.app.io.sendUserCommand(req.app.io.code.cmd.set_route, socketData, key)
          }
        }
      }
      return requestHandler.sendSuccess(res, 'Route detail successfully deleted')(result);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

}

module.exports = CleanRouteController;