const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('../config/appconfig');
const BaseController = require('./BaseController');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const auth = require('../utils/auth');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class UsersController extends BaseController {
	
	static async getUserById(req, res) {
		try {
			const reqParam = req.params.id;
			const schema = Joi.object({
				id: Joi.number().integer().min(1),
			});

			const { error } = schema.validate({ id: reqParam });
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid User Id');
			}
      const options = {
        where:{id:req.params.id},
        attributes: {exclude: ['pwd']},
        include: [
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_user_role], as: DEFINED.tbAlias.UserRole
          },
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup
          }
        ],
      }
      let result = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
      if(result){
        return requestHandler.sendSuccess(res, 'User Data Extracted')(result);
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid User Id');
      }
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

	static async deleteById(req, res) {
		try {
      //check userid
      let arrData = []
      let uids = req.body
      if(!_.isArray(uids)) {
        arrData.push(uids)
      }else{
        arrData = _.cloneDeep(uids, true)
      }
      const schema = Joi.object({
        userid: Joi.number().integer().min(1),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid userid');
        return
      }
      uids = arrData.map(u => u.userid)
      const options = { 
        where : { 
          id: {
            [Op.in]: uids
          },
          role : {
            [Op.ne]: 1 //Skip delete for Super Administrator
          }
        }
      }
			const result = await super.deleteById(req, DEFINED.tableNames.tbl_user, options);
			return requestHandler.sendSuccess(res, 'User successfully deleted')(result);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

	static async getProfile(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			const options = {
				where: { id: user.payload.id },
        include: [
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_user_role], as: DEFINED.tbAlias.UserRole
          },
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup
          }
        ],
			};
			const userProfile = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
      if(userProfile) {
        const profile = _.omit(userProfile.dataValues, ['pwd']);
        return requestHandler.sendSuccess(res, 'User Profile successfully fetched.')({ profile });
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

  static async getUserTree(req, res) {
    try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
      const userProfile = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, {where: {id: user.payload.id}});
      if(userProfile) {
        let options = {}
        if(userProfile.role === 1) {
          options = {
            where: {
              id : { [Op.gt] : 0 }
            },
            include: [
              { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, required: false, include: { all: true }},
              { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false},
            ]
          }
        } else {
          const where = {
            uid: user.payload.id
          }
          options = {
            where: {
              id : { [Op.gt] : 0 }
            },
            include: [
              { model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup, where},
              { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, required: false, include: { all: true }},
              { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false}
            ]
          }
        }
        const result = await super.getList(req, DEFINED.tableNames.tbl_group, options);
        //user node
        let groupTreeData = []
        groupTreeData.push({ "id" : "u"+userProfile.id, "parent" : "#", "text" : userProfile.name , "icon":"fa fa-user-circle", type: 'user', data: {uid:userProfile.id}})
        if(_.size(result)) {
          //group nodes
          result.map(g => {
            groupTreeData.push({ "id" : "g"+g.id, "parent" : "u"+userProfile.id, "text" : g.name , "icon":"fa fa-dot-circle-o", type: 'group', data: g})
            if(_.size(g.VehicleGroup)) {
              g.VehicleGroup.map(v => {
                groupTreeData.push({ "id" : "v"+v.id, "parent" : "g"+v.gid, "text" : v.Vehicle.name , "icon":"fa fa-car", type: 'vehicle', data: v})
              })
            }
          })
        }
        return requestHandler.sendSuccess(res, 'tree data fetched')(groupTreeData);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}    
  }

  static async getList(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
      const options = {
        attributes: {exclude: ['pwd']},
        order: [['id','DESC']],
        include: [
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_user_role], as: DEFINED.tbAlias.UserRole
          },
          {
            model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup
          }
        ],

        //Get list and skip current login user
        where: {
          id: {
            [Op.ne]: user.payload.id
          }
        }
      }
			const userList = await super.getList(req, DEFINED.tableNames.tbl_user, options);
      if(userList) {
        return requestHandler.sendSuccess(res, 'User Profile fetched Successfully')(userList);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getRoles(req, res) {
    try {
			const userRoles = await super.getList(req, DEFINED.tableNames.tbl_user_role);
      if(userRoles) {
        return requestHandler.sendSuccess(res, 'all user roles')(userRoles);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getRoleById(req, res) {
    try {
      const reqParam = req.params.id;
			const schema = Joi.object({
				id: Joi.number().integer().min(1),
			});

			const { error } = schema.validate({ id: reqParam });
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid role id');
			}
			const userRoles = await super.getById(req, DEFINED.tableNames.tbl_user_role);
      if(userRoles) {
        return requestHandler.sendSuccess(res, 'user role by roleid')(userRoles);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async getUserGroup(req, res) {
    try {
      const schema =  Joi.object({
				userid:  Joi.number().integer().min(1).required(),
        groupid: Joi.number().integer().optional()
			})
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      const {groupid, userid} = req.body
      let where 
      if(groupid) {
        where = {
          uid: userid,
          gid: groupid
        }
      }else{
        where = {
          uid: userid
        }
      }
      const options = {
          include: [
            { model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup, where},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false},
          ]
      }
			const Groups = await super.getList(req, DEFINED.tableNames.tbl_group, options);
      if(Groups) {
        return requestHandler.sendSuccess(res, 'user group successfully fetched')(Groups);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'your session might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async updateById(req,res) {
    try {
      //check userid
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { userid_error } = schema.validate({ id:  req.params.id });
      if(userid_error) {
        requestHandler.validateJoi(userid_error, 400, 'Bad request', 'Invalid User Id');
			}
      schema =  Joi.object({
				name:   Joi.string().optional(),
        email:  Joi.string().email().optional(),
        phone:  Joi.string().optional().allow('')
                .regex(/^[0-9]{3}[-]+[0-9]{3,4}[-]+[0-9]{3,4}$/)
                .message({
                  'string.pattern.base': `Phone number should be like 010-1234-1234`
                }),
        role: Joi.number().integer().min(1).optional(),
			}).min(1).required()
      const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      //get user
      let user = await super.getById(req, DEFINED.tableNames.tbl_user);
      if(user){
        // update user info
        const ret = await super.updateById(req, DEFINED.tableNames.tbl_user, req.body);
        if(ret) {
          const options = {
            where: { id: user.id },
            include: [
              {
                model: req.app.get('db')[DEFINED.tableNames.tbl_user_role], as: DEFINED.tbAlias.UserRole
              },
              {
                model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup
              }
            ],
          };
          user = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
          const result = _.omit(user.dataValues, 'pwd');
          requestHandler.sendSuccess(res, 'User is successfully updated.', 200)(result);
        }
        else{
          requestHandler.throwError(500, 'Server error', "Failed to update user password.")();
        }
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid User');
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async setPwdById(req, res) {
    try {
      //check userid
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { userid_error } = schema.validate({ id:  req.params.id });
      if(userid_error) {
        requestHandler.validateJoi(userid_error, 400, 'Bad request', 'Invalid User Id');
			}
      schema = Joi.object({
				password: Joi.string().min(6).max(30)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
          .required()
          .messages({
            'string.empty': `Password is required.`,
            'any.required': `Password id is required.`,
            'string.min': `Password should have a minimum length of {#limit}`,
            'string.max': `Password should have a maximum length of {#limit}`,
            'string.pattern.base': `Password should be at least one uppercase letter, one lowercase letter, one number and one special character`
          }),
        repeat_password: Joi.string().min(6).max(30)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
          .required()
          .messages({
            'string.empty': `Repeat Password is required.`,
            'any.required': `Repeat Password is required.`,
            'string.min': `Repeat Password should have a minimum length of {#limit}`,
            'string.max': `Repeat Password should have a maximum length of {#limit}`,
            'string.pattern.base': `Repeat password should be at least one uppercase letter, one lowercase letter, one number and one special character`,
          }),
			});
      const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}

      const { password, repeat_password } = req.body
      if(_.isUndefined(password) || _.isUndefined(repeat_password) || (password !== repeat_password)) {
        requestHandler.throwError(400, 'Bad request', "Invalid data between password and repeat password.")();
      }

      //get user
      let user = await super.getById(req, DEFINED.tableNames.tbl_user);
      if(user){
        //generate hash password
			  const hashedPass = bcrypt.hashSync(password, config.auth.saltRounds);
        // update user info
        const ret = await super.updateById(req, DEFINED.tableNames.tbl_user, {pwd: hashedPass});
        if(ret) {
          requestHandler.sendSuccess(res, 'User\'s password is successfully modified.', 200)();
        }
        else{
          requestHandler.throwError(500, 'Server error', "Failed to update user password.")();
        }
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid User');
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async modPwdById(req, res) {
    try {
      //check userid
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { userid_error } = schema.validate({ id:  req.params.id });
      if(userid_error) {
        requestHandler.validateJoi(userid_error, 400, 'Bad request', 'Invalid User Id');
			}
      schema = Joi.object({
        current_password: Joi.string().min(6).max(30)
          .required()
          .messages({
            'string.empty': `Current Password is required.`,
            'any.required': `Current Password id is required.`,
            'string.min': `Current Password should have a minimum length of {#limit}`,
            'string.max': `Current Password should have a maximum length of {#limit}`,
          }),
        new_password: Joi.string().min(6).max(30)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
          .required()
          .messages({
            'string.empty': `New Password is required.`,
            'any.required': `New Password id is required.`,
            'string.min': `New Password should have a minimum length of {#limit}`,
            'string.max': `New Password should have a maximum length of {#limit}`,
            'string.pattern.base': `New Password should be at least one uppercase letter, one lowercase letter, one number and one special character`
          }),
        repeat_password: Joi.string().min(6).max(30)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
          .required()
          .messages({
            'string.empty': `Repeat Password is required.`,
            'any.required': `Repeat Password is required.`,
            'string.min': `Repeat Password should have a minimum length of {#limit}`,
            'string.max': `Repeat Password should have a maximum length of {#limit}`,
            'string.pattern.base': `Repeat password should be at least one uppercase letter, one lowercase letter, one number and one special character`,
          }),
			});
      const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}

      const { current_password, new_password, repeat_password } = req.body
      if(_.isUndefined(new_password) || _.isUndefined(repeat_password) || (new_password !== repeat_password)) {
        requestHandler.throwError(400, 'Bad request', "Invalid data between new password and repeat password.")();
      }

      //get user
      let user = await super.getById(req, DEFINED.tableNames.tbl_user);
      if(user){
        await bcrypt
        .compare(current_password, user.pwd)
        .then(
          requestHandler.throwIf(r => !r, 400, 'Bad request', "Your current password is incorrect."),
          requestHandler.throwError(500, 'Server got error'),
        );
        //generate hash password
			  const hashedPass = bcrypt.hashSync(new_password, config.auth.saltRounds);
        // update user info
        const ret = await super.updateById(req, DEFINED.tableNames.tbl_user, {pwd: hashedPass});
        if(ret) {
          requestHandler.sendSuccess(res, 'User\'s password is successfully modified.', 200)();
        }
        else{
          requestHandler.throwError(500, 'Server error', "Failed to update user password.")();
        }
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid User');
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }
}

module.exports = UsersController;
