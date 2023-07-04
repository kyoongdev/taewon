const Joi = require('joi');
const _ = require('lodash');
const { Op } = require("sequelize");
const BaseController = require('./BaseController');
const WsController = require('./WsController');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class GroupsController extends BaseController {

	static async getGroupById(req, res) {
		try {
			const reqParam = req.params.id;
			const schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { error } = schema.validate({ id: reqParam });
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request', 'Invalid group id');
			}
      const options = {
        where:{id:req.params.id},
        include: [
          { model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false, include : {
            model: req.app.get('db')[DEFINED.tableNames.tbl_route_detail], as: DEFINED.tbAlias.RouteDetail
          }},
        ]
      }
      let result = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_group, options);
      if(result){
        return requestHandler.sendSuccess(res, 'Group data fetched')(result.dataValues);
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', `No group for id : ${reqParam}`);
      }
		} catch (error) {
			return requestHandler.sendError(req, res, error);
		}
	}

  static async newGroup(req, res) {
    try {
			const schema =  Joi.object({
				name:   Joi.string().required(),
        desc:   Joi.string().allow('').optional()
			})
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}

			//check duplicated group name
			let options = { where: { name: req.body.name } };
			let group = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_group, options);
			if (group) {
				requestHandler.throwError(400, 'Bad request', `Invalid group name, [${req.body.name}] group already existed`)();
			}

      //register new group
			const createdGroup = await super.create(req, DEFINED.tableNames.tbl_group);
			if (!(_.isNull(createdGroup))) {
        const options = {
          where: { id: createdGroup.id},
          order: [['id','DESC']],
          include: [
            { model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, required: false},
            { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false},
          ]
        }
        const groupList = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_group, options);
        if(groupList) {
          req.app.io.sendUserEvent(req.app.io.code.cmd.set_add_group, groupList)
        }
				requestHandler.sendSuccess(res, 'Group is successfully registered.', 200)(groupList);
			} else {
				requestHandler.throwError(422, 'Unprocessable Entity', 'Failed to register group.')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
  }

  static async updateById(req,res) {
    try {
      //check groupid
			let schema = Joi.object({
				id: Joi.number().integer().min(1),
			});
			const { groupid_error } = schema.validate({ id:  req.params.id });
      if(groupid_error) {
        requestHandler.validateJoi(groupid_error, 400, 'Bad request', 'Invalid group id');
			}

      schema =  Joi.object({
				name:   Joi.string().optional(),
        desc:   Joi.string().optional()
			}).min(1).required()
      const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
      //check duplicated group name
      if(!_.isEmpty(req.body.name)) {
        let options = { where: { name: req.body.name , id : {[Op.ne]: req.params.id} } };
        const group = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_group, options);
        if (group) {
          requestHandler.throwError(400, 'Bad request', `Invalid group name, [${req.body.name}] group already existed`)();
        }
      }
      //get group
      let group = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_group, {where:{id: req.params.id}});
      if(group){
        // update group info
        if(req.body.name){
          group.name = req.body.name
        }
        if(req.body.desc){
          group.desc = req.body.desc
        }
        group.save();
        if(group) {
          req.app.io.sendUserEvent(req.app.io.code.cmd.set_update_group, group)
        }
        requestHandler.sendSuccess(res, 'Group is successfully updated.', 200)(group);
      }else{
        requestHandler.validateJoi(error, 400, 'Bad request', `No group for ${req.params.id}`);
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

	static async deleteById(req, res) {
		try {
      //check groupid
      let arrData = []
      let gids = req.body
      if(!_.isArray(gids)) {
        arrData.push(gids)
      }else{
        arrData = _.cloneDeep(gids, true)
      }
      const schema = Joi.object({
        groupid: Joi.number().integer().min(1),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid groupid');
        return
      }
      gids = arrData.map(u => u.groupid)
      const options = { 
        where : { 
          id: {
            [Op.in]: gids
          }
        }
      }
			const result = await super.deleteById(req, DEFINED.tableNames.tbl_group, options);
      if(result) {
        req.app.io.sendUserEvent(req.app.io.code.cmd.set_delete_group, {
					id: gids
				})
      }
      return requestHandler.sendSuccess(res, 'Group successfully deleted')(result);
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
	}

  static async getList(req, res) {
    try {
      const options = {
        order: [['id','DESC']],
        include: [
          { model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_vehicle_group], as: DEFINED.tbAlias.VehicleGroup, required: false},
          { model: req.app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, required: false, include : {
            model: req.app.get('db')[DEFINED.tableNames.tbl_route_detail], as: DEFINED.tbAlias.RouteDetail
          }},
        ]
      }
			const groupList = await super.getList(req, DEFINED.tableNames.tbl_group, options);
      if(groupList) {
        return requestHandler.sendSuccess(res, 'Group list successfully fetched')(groupList);
      } else {
        requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
      }
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async userGroup(req, res) {    
    try {
      let arrData = []
      const ugroups = req.body
      if(!_.isArray(ugroups)) {
        arrData.push(ugroups)
      }else{
        arrData = _.cloneDeep(ugroups, true)
      }
      //command: add - 100, delete - 200
      const schema = Joi.object({
        cmd: Joi.number().integer().valid(100, 200),
        id: Joi.number().integer(),
        gid: Joi.number().integer().min(1),
        uid: Joi.number().integer().min(1),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid data format.');
        return
      }
      let addList = arrData.map(d => {
        if(d.cmd === 100) {
          const {id, uid, gid} = d
          return {id, uid, gid}
        }
      })
      addList = addList.filter(i => i)
      let delList = arrData.map((d) => {
        if(d.cmd === 200){
          const {id, uid, gid} = d
          return {id, uid, gid}
        }
      })
      delList = delList.filter(i => i)

      //Add List
      if(_.size(addList)) {
        addList = addList.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.uid === value.uid && t.gid === value.gid
          ))
        )
        let gids = _.sortedUniq(addList.map(d=> d.gid))
        let uids = _.sortedUniq(addList.map(d=> d.uid))
        //check group id
        const optgid = {
          where:{
            id: {
              [Op.in]: gids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_gids = await super.getList(req, DEFINED.tableNames.tbl_group, optgid);
        if(!_.size(db_gids)){
          requestHandler.throwError(400, 'Unprocessable', 'No group avaialble.')();
          return
        }
        gids = db_gids.map(g => g.id)
        //check user id        
        const optuid = {
          where:{
            id: {
              [Op.in]: uids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_uids = await super.getList(req, DEFINED.tableNames.tbl_user, optuid);
        if(!_.size(db_uids)){
          requestHandler.throwError(400, 'Unprocessable', 'No user avaialble.')();
          return
        }
        uids = db_uids.map(u => u.id)
        //filter only existing user id and group id
        addList = addList.filter(i => uids.includes(i.uid) && gids.includes(i.gid))
        const options = {
          where: {
            uid: {
              [Op.in] : uids
            },
            gid: {
              [Op.in] : gids
            }
          },
          raw: true
        }
        const db_user_group = await super.getList(req, DEFINED.tableNames.tbl_user_group, options);
        if(_.size(db_user_group)) {
          addList = addList.filter((u) =>{
            if(!_.size(db_user_group.filter(d => (d.uid === u.uid && d.gid === u.gid)))) {
              return u
            }
          })
        }
        if(_.size(addList)) {
          await super.bulkCreate(req, DEFINED.tableNames.tbl_user_group, addList);
        }
      }
      //Delete list
      if(_.size(delList)) {
        delList = delList.filter((value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
        )
        let ids = _.sortedUniq(delList.map(d => d.id))
        const options = {
          where: {
            id: {
              [Op.in] : ids
            }
          }
        }
        await super.deleteById(req, DEFINED.tableNames.tbl_user_group, options);
      }
      requestHandler.sendSuccess(res, `group's user command is successfully executed.`, 200)();
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async vehicleGroup(req, res) {
    try {
      let arrData = []
      const vgroups = req.body
      if(!_.isArray(vgroups)) {
        arrData.push(vgroups)
      }else{
        arrData = _.cloneDeep(vgroups, true)
      }
      //command: add - 100, delete - 200
      const schema = Joi.object({
        cmd: Joi.number().integer().valid(100, 200),
        id: Joi.number().integer(),
        gid: Joi.number().integer().min(1),
        vid: Joi.number().integer().min(1),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid data format.');
        return
      }
      let addList = arrData.map(d => {
        if(d.cmd === 100) {
          const {id, vid, gid} = d
          return {id, vid, gid}
        }
      })
      addList = addList.filter(i => i)
      let delList = arrData.map((d) => {
        if(d.cmd === 200){
          const {id, vid, gid} = d
          return {id, vid, gid}
        }
      })
      delList = delList.filter(i => i)

      //Add List
      if(_.size(addList)) {
        addList = addList.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.vid === value.vid && t.gid === value.gid
          ))
        )
        let gids = _.sortedUniq(addList.map(d=> d.gid))
        let vids = _.sortedUniq(addList.map(d=> d.vid))
        //check group id
        const optgid = {
          where:{
            id: {
              [Op.in]: gids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_gids = await super.getList(req, DEFINED.tableNames.tbl_group, optgid);
        if(!_.size(db_gids)){
          requestHandler.throwError(400, 'Unprocessable', 'No group avaialble.')();
          return
        }
        gids = db_gids.map(g => g.id)
        //check user id        
        const optvid = {
          where:{
            id: {
              [Op.in]: vids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_vids = await super.getList(req, DEFINED.tableNames.tbl_vehicle, optvid);
        if(!_.size(db_vids)){
          requestHandler.throwError(400, 'Unprocessable', 'No vehicle avaialble.')();
          return
        }
        vids = db_vids.map(v => v.id)
        //filter only existing user id and group id
        addList = addList.filter(i => vids.includes(i.vid) && gids.includes(i.gid))
        const options = {
          where: {
            vid: {
              [Op.in] : vids
            },
            gid: {
              [Op.in] : gids
            }
          },
          raw: true
        }
        const db_vehicle_group = await super.getList(req, DEFINED.tableNames.tbl_vehicle_group, options);
        if(_.size(db_vehicle_group)) {
          addList = addList.filter((u) =>{
            if(!_.size(db_vehicle_group.filter(d => (d.uid === u.uid && d.gid === u.gid)))) {
              return u
            }
          })
        }
        if(_.size(addList)) {
          await super.bulkCreate(req, DEFINED.tableNames.tbl_vehicle_group, addList);
        }
      }
      //Delete list
      if(_.size(delList)) {
        delList = delList.filter((value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
        )
        let ids = _.sortedUniq(delList.map(d => d.id))
        const options = {
          where: {
            id: {
              [Op.in] : ids
            }
          }
        }
        await super.deleteById(req, DEFINED.tableNames.tbl_vehicle_group, options);
      }
      requestHandler.sendSuccess(res, `group's user command is successfully executed.`, 200)();
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async groupChargeStation(req, res) {
    try {
      let arrData = []
      const vgroups = req.body
      if(!_.isArray(vgroups)) {
        arrData.push(vgroups)
      }else{
        arrData = _.cloneDeep(vgroups, true)
      }
      //command: add - 100, delete - 200, update- 300
      const schema = Joi.object({
        cmd: Joi.number().integer().valid(100, 200, 300),
        id: Joi.number().integer(),
        gid: Joi.number().integer().min(1),
        name: Joi.string().allow('').optional(),
        address: Joi.string().allow('').optional(),
        location: Joi.string().allow('').optional(),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid data format.');
        return
      }
      let addList = arrData.map(d => {
        if(d.cmd === 100) {
          const {id, gid, name, address, location} = d
          return {id, gid, name, address, location}
        }
      })
      addList = addList.filter(i => i)

      let delList = arrData.map((d) => {
        if(d.cmd === 200) {
          const {id, gid} = d
          return {id, gid}
        }
      })
      delList = delList.filter(i => i)

      let modList = arrData.filter((d) => d.cmd === 300)
      //Add List
      if(_.size(addList)) {
        addList = addList.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.name === value.name && t.gid === value.gid
          ))
        )
        let gids = _.sortedUniq(addList.map(d=> d.gid))
        //check group id
        const optgid = {
          where:{
            id: {
              [Op.in]: gids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_gids = await super.getList(req, DEFINED.tableNames.tbl_group, optgid);
        if(!_.size(db_gids)){
          requestHandler.throwError(400, 'Unprocessable', 'No group avaialble.')();
          return
        }
        gids = db_gids.map(g => g.id)
        
        //filter only existing user id and group id
        addList = addList.filter(i => gids.includes(i.gid))
        let names = _.sortedUniq(addList.map(d=> d.name))
        const options = {
          where: {
            name: {
              [Op.in] : names
            },
            gid: {
              [Op.in] : gids
            }
          },
          raw: true
        }
        const db_charge = await super.getList(req, DEFINED.tableNames.tbl_group_charge_station, options);
        if(_.size(db_charge)) {
          addList = addList.filter((u) =>{
            if(!_.size(db_charge.filter(d => (d.name === u.name && d.gid === u.gid)))) {
              return u
            }
          })
        }
        if(_.size(addList)) {
          await super.bulkCreate(req, DEFINED.tableNames.tbl_group_charge_station, addList);
        }
      }
      //Delete list
      if(_.size(delList)) {
        delList = delList.filter((value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
        )
        let ids = _.sortedUniq(delList.map(d => d.id))
        const options = {
          where: {
            id: {
              [Op.in] : ids
            }
          }
        }        
        await super.deleteById(req, DEFINED.tableNames.tbl_group_charge_station, options);
        //SendSocket
        if(req.app.io) {
          let data = []
          delList.map(a => {
            data.push({
              id: a.id
            })
          })
          if(_.size(data)) {
            const socketData = {
              subcmd: 'delete', data
            }
            console.log(socketData)
            req.app.io.sendCommand(req.app.io.code.cmd.set_charge, socketData)
          }
        }
      }
      //Update list
      if(_.size(modList)) {
        modList = modList.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.name === value.name && t.gid === value.gid
          ))
        )
        let gids = _.sortedUniq(modList.map(d=> d.gid))
        //check group id
        const optgid = {
          where:{
            id: {
              [Op.in]: gids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_gids = await super.getList(req, DEFINED.tableNames.tbl_group, optgid);
        if(!_.size(db_gids)){
          requestHandler.throwError(400, 'Unprocessable', 'No group avaialble.')();
          return
        }
        gids = db_gids.map(g => g.id)
        
        //filter only existing user id and group id
        modList = modList.filter(i => gids.includes(i.gid))
        let names = _.sortedUniq(modList.map(d=> d.name))
        const options = {
          where: {
            name: {
              [Op.in] : names
            },
            gid: {
              [Op.in] : gids
            },
          },
          raw: true
        }
        const db_charge = await super.getList(req, DEFINED.tableNames.tbl_group_charge_station, options);
        if(_.size(db_charge)) {
          modList = modList.filter((u) =>{
            if(!_.size(db_charge.filter(d => (d.name === u.name && d.gid === u.gid && u.id !== d.id)))) {
              return u
            }
          })
        }
        if(_.size(modList)) {
          modList.map((m) => {
            req.params.id = m.id
            super.updateById(req, DEFINED.tableNames.tbl_group_charge_station, m)
          })
          //SendSocket
          if(req.app.io) {
            let data = []
            modList.map(a => {
              data.push(a.id)
            })
            if(_.size(data)) {
              WsController.setCharges('update', data)
            }
          }
        }
      }
      requestHandler.sendSuccess(res, `group's charge station command is successfully executed.`, 200)();
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

  static async groupGarage(req, res) {
    try {
      let arrData = []
      const vgroups = req.body
      if(!_.isArray(vgroups)) {
        arrData.push(vgroups)
      }else{
        arrData = _.cloneDeep(vgroups, true)
      }
      //command: add - 100, delete - 200, update- 300
      const schema = Joi.object({
        cmd: Joi.number().integer().valid(100, 200, 300),
        id: Joi.number().integer(),
        gid: Joi.number().integer().min(1),
        name: Joi.string().allow('').optional(),
        address: Joi.string().allow('').optional(),
        location: Joi.string().allow('').optional(),
      });
      let schemas = Joi.array().items(schema)
      const { error } = schemas.validate(arrData)
      if(error) {
        requestHandler.validateJoi(error, 400, 'Bad request',  error ? error.details[0].message : 'Invalid data format.');
        return
      }
      let addList = arrData.map(d => {
        if(d.cmd === 100) {
          const {id, gid, name, address, location} = d
          return {id, gid, name, address, location}
        }
      })
      addList = addList.filter(i => i)
      
      let delList = arrData.map((d) => {
        if(d.cmd === 200) {
          const {id, gid} = d
          return {id, gid}
        }
      })
      delList = delList.filter(i => i)

      let modList = arrData.filter((d) => d.cmd === 300)
      //Add List
      if(_.size(addList)) {
        addList = addList.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.name === value.name && t.gid === value.gid
          ))
        )
        let gids = _.sortedUniq(addList.map(d=> d.gid))
        //check group id
        const optgid = {
          where:{
            id: {
              [Op.in]: gids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_gids = await super.getList(req, DEFINED.tableNames.tbl_group, optgid);
        if(!_.size(db_gids)){
          requestHandler.throwError(400, 'Unprocessable', 'No group avaialble.')();
          return
        }
        gids = db_gids.map(g => g.id)
        
        //filter only existing user id and group id
        addList = addList.filter(i => gids.includes(i.gid))
        let names = _.sortedUniq(addList.map(d=> d.name))
        const options = {
          where: {
            name: {
              [Op.in] : names
            },
            gid: {
              [Op.in] : gids
            }
          },
          raw: true
        }
        const db_charge = await super.getList(req, DEFINED.tableNames.tbl_group_garage, options);
        if(_.size(db_charge)) {
          addList = addList.filter((u) =>{
            if(!_.size(db_charge.filter(d => (d.name === u.name && d.gid === u.gid)))) {
              return u
            }
          })
        }
        if(_.size(addList)) {
          await super.bulkCreate(req, DEFINED.tableNames.tbl_group_garage, addList);
        }
      }
      //Delete list
      if(_.size(delList)) {
        delList = delList.filter((value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
        )
        let ids = _.sortedUniq(delList.map(d => d.id))
        const options = {
          where: {
            id: {
              [Op.in] : ids
            }
          }
        }
        await super.deleteById(req, DEFINED.tableNames.tbl_group_garage, options);
        //SendSocket
        if(req.app.io) {
          let data = []
          delList.map(a => {
            data.push({
              id: a.id
            })
          })
          if(_.size(data)) {
            const socketData = {
              subcmd: 'delete', data
            }
            console.log(socketData)
            req.app.io.sendCommand(req.app.io.code.cmd.set_garage, socketData)
          }
        }
      }
      //Update list
      if(_.size(modList)) {
        modList = modList.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.name === value.name && t.gid === value.gid
          ))
        )
        let gids = _.sortedUniq(modList.map(d=> d.gid))
        //check group id
        const optgid = {
          where:{
            id: {
              [Op.in]: gids
            }
          },
          attributes: ['id'],
          raw : true
        }
        const db_gids = await super.getList(req, DEFINED.tableNames.tbl_group, optgid);
        if(!_.size(db_gids)){
          requestHandler.throwError(400, 'Unprocessable', 'No group avaialble.')();
          return
        }
        gids = db_gids.map(g => g.id)
        
        //filter only existing user id and group id
        modList = modList.filter(i => gids.includes(i.gid))
        let names = _.sortedUniq(modList.map(d=> d.name))
        const options = {
          where: {
            name: {
              [Op.in] : names
            },
            gid: {
              [Op.in] : gids
            }
          },
          raw: true
        }
        const db_charge = await super.getList(req, DEFINED.tableNames.tbl_group_garage, options);
        if(_.size(db_charge)) {
          modList = modList.filter((u) =>{
            if(!_.size(db_charge.filter(d => (d.name === u.name && d.gid === u.gid && u.id !== d.id)))) {
              return u
            }
          })
        }
        if(_.size(modList)) {
          modList.map((m) => {
            req.params.id = m.id
            super.updateById(req, DEFINED.tableNames.tbl_group_garage, m)
          })
          //SendSocket
          if(req.app.io) {
            let data = []
            modList.map(a => {
              data.push(a.id)
            })
            if(_.size(data)) {
              WsController.setGarages('update', data)
            }
          }
        }
      }
      requestHandler.sendSuccess(res, `gargage command is successfully executed.`, 200)();
		} catch (err) {
			return requestHandler.sendError(req, res, err);
		}
  }

}

module.exports = GroupsController;