const uuid = require('uuid');
const _ = require('lodash');
const { Op } = require("sequelize");
const Util = require('../utils/Util');
const Logger = require('../utils/logger');
const RequestHandler = require('../utils/RequestHandler');
const BaseController = require('./BaseController');
const config = require('../config/appconfig');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class WsController extends BaseController {

	static async sendCommand(req, res) {
    let data = req.body
    const {header} = data
    if(header && header instanceof Object) {
      const {Code, VID, Datetime, room} = header
      //Vehicle
      if(Code && VID && Datetime) {
        const {payload} = data
        data['API'] = true
        req.app.io.sockets.in(room).emit(config.app.commands, data);
        return requestHandler.sendSuccess(res, 'Command is successfully sent')();
      }
      //User
      else if(room === ROOMS.USER_ROOM)
      {
        const {payload} = data
        data['API'] = true
        req.app.io.sockets.in(room).emit(config.app.commands, data);
        return requestHandler.sendSuccess(res, 'Command is successfully sent')();
      }else{
        return requestHandler.sendSuccess(res, 'Invalid Event Header Format!')(header);
      }
    } else {
      return requestHandler.sendSuccess(res, 'Invalid Event Header!')(data);
    }
  }

  static async sendEvent(req, res) {
    let data = req.body
    const {header} = data
    if(header && header instanceof Object) {
      const {Code, VID, Datetime, room} = header
      //Vehicle
      if(Code && VID && Datetime) {
        const {payload} = data
        data['API'] = true
        req.app.io.sockets.in(room).emit(config.app.events, data);
        return requestHandler.sendSuccess(res, 'Event is successfully sent')();
      }
      //User
      else if(room === ROOMS.USER_ROOM)
      {
        const {payload} = data
        data['API'] = true
        req.app.io.sockets.in(room).emit(config.app.events, data);
        return requestHandler.sendSuccess(res, 'Event is successfully sent')();
      }else{
        return requestHandler.sendSuccess(res, 'Invalid Event Header Format!')(header);
      }
    } else {
      return requestHandler.sendSuccess(res, 'Invalid Event Header!')(data);
    } 

  }

  static async setLogin({header}) {    
    try {
      const vid = header.VID
      let options = {
        where: { 
          vcode : {
            [Op.like]: `%${vid}`
          }
        },
        attributes: ['id', 'vcode', 'state']
      }
			const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
      if(vehicle) {
        vehicle.state |= DEFINED.vehicle.state.on
        vehicle.save()
        header.VID = vehicle.id
        return {header, payload: vehicle.dataValues}
      }else {
        return {header, payload: 0}
      }
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setLogout({header}) {    
    try {
      const vid = header.VID
      let options = {
        where: { 
          id: vid
        },
      }
			const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
      if(vehicle) {
        vehicle.state &= ~(DEFINED.vehicle.state.on | DEFINED.vehicle.state.autonomous_mode)
        vehicle.save()
      }
      return {header, payload: {}}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setCharges(subcmd, id_list) {    
    try {
      const options = {
        where: { 
          charge_id: id_list,
        },
        group: ['charge_id'],
        order: [['vid','DESC']],
        include: [
          { model: app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, attributes: ['id', 'location']},
        ],
      } 
      let chargelist = {}
      let location = ''
      let charge_location = {}
      const RouteDetail = await super.getByOptions(DEFINED.tableNames.tbl_route_detail, options);
      await RouteDetail.forEach((route) => {
        const {vid, charge_id, ChargeStation} = route.dataValues
        //Charge Station Location
        if(ChargeStation && !_.isEmpty(ChargeStation.location)) {
          location = JSON.parse(ChargeStation.location)
          charge_location = {lon: location.features[0].geometry.coordinates[0], lat: location.features[0].geometry.coordinates[1]}
          if(!chargelist[vid]) {
            chargelist[vid] = []
          }
          chargelist[vid].push({id: charge_id, ...charge_location});
        }
      });
      if(_.size(Object.keys(chargelist))) {
        for (const [key, value] of Object.entries(chargelist)) {
          const socketData = {
            subcmd,
            data: value
          }
          app.io.sendUserCommand(app.io.code.cmd.set_charge, socketData, key)
        }
      }
		} catch (err) {
			logger.log(err,'error')
		}
  }
  
  static async setGarages(subcmd, id_list) {    
    try {
      const options = {
        where: { 
          garage_id: id_list,
        },
        group: ['garage_id'],
        order: [['vid','DESC']],
        include: [
          { model: app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, attributes: ['id', 'location']},
        ],
      } 
      let garagelist = {}
      let location = ''
      let garage_location = {}
      const RouteDetail = await super.getByOptions(DEFINED.tableNames.tbl_route_detail, options);
      await RouteDetail.forEach((route) => { 
        const {vid, garage_id, Garage} = route.dataValues
        //Charge Station Location
        if(Garage && !_.isEmpty(Garage.location)) {
          location = JSON.parse(Garage.location)
          garage_location = {lon: location.features[0].geometry.coordinates[0], lat: location.features[0].geometry.coordinates[1]}
          if(!garagelist[vid]) {
            garagelist[vid] = []
          }
          garagelist[vid].push({id: garage_id, ...garage_location});
        }
      });
      if(_.size(Object.keys(garagelist))) {
        for (const [key, value] of Object.entries(garagelist)) {
          const socketData = {
            subcmd,
            data: value
          }
          app.io.sendUserCommand(app.io.code.cmd.set_garage, socketData, key)
        }
      }
		} catch (err) {
      logger.log(err,'error')
		}
  }
  
  static async setRoutes({header, payload}) {
    try {
      const vid = header.VID
      let add = true
      const {subcmd, data} = payload
      if(vid && !_.isEmpty(subcmd) && typeof data === 'object') {
        const {id, start_point, end_point, home_point, total_path_point, path_point} = data
        if(id && id > 0) {
          if(subcmd === "delete") {
            const result = await super.deleteId(DEFINED.tableNames.tbl_route, id);
            if(result){
              app.io.sendUserCommand(header.Code, payload)
            }
            add = false
          } else {
            let route = await super.getByOption(DEFINED.tableNames.tbl_route, {where:{id}});
            if(route) {
              if(typeof start_point === 'object') route.start_point = "["+start_point.lon+","+start_point.lat+"]"
              if(typeof end_point === 'object') route.end_point = "["+end_point.lon+","+end_point.lat+"]"
              if(typeof home_point === 'object') route.home_point = "["+home_point.lon+","+home_point.lat+"]"
              let area_text = "["
              if(total_path_point > 0) {
                if(typeof path_point === 'object') {
                  let i = 0
                  let waypath = ''
                  while(i < total_path_point) {
                    const pp = path_point[''+i]
                    area_text+= "["+pp.lon+","+pp.lat+"]"
                    waypath+= pp.lon+","+pp.lat
                    if( i < (total_path_point-1)) {
                      waypath+="|"
                      area_text+=","
                    }
                    i++
                  }
                  route.path_point = waypath
                }
              }
              area_text+= "]"
              route.area = '{"type":"FeatureCollection","features":[{"id": "'+uuid.v4()+'","type":"Feature","properties":{},"geometry":{"coordinates": '+area_text+',"type":"LineString"}}]}'
              await route.save();
              const options = { where: { rid: route.id, vid }, include:{all: true} };
              let Route_Detail = await super.getByOption(DEFINED.tableNames.tbl_route_detail, options);
              const socketData = {
                subcmd: 'update',
                data: Util.getRouteInfo(Route_Detail)
              }
              app.io.sendUserCommand(header.Code, socketData, vid)
              add = false
            }
          }
        }
        if(add === true && subcmd === 'add' || subcmd === 'set') {
          let gVehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle_group, {where:{vid}});
          console.log(gVehicle)
          //register new route
          let add_route = {
            id: 0,
            gid: 0,
            name: moment().format("YYYY-MM-DD HH:mm:ss"),
            start_point:'',
            end_point:'',
            home_point:'',
            area:'',
            path_point:''
          }
          if(gVehicle) add_route.gid = gVehicle.gid
          if(typeof start_point === 'object') add_route.start_point = "["+start_point.lon+","+start_point.lat+"]"
          if(typeof end_point === 'object') add_route.end_point = "["+end_point.lon+","+end_point.lat+"]"
          if(typeof home_point === 'object') add_route.home_point = "["+home_point.lon+","+home_point.lat+"]"
          let area_text = "["
          if(total_path_point > 0) {
            if(typeof path_point === 'object') {
              let i = 0
              let waypath = ''
              while(i < total_path_point) {
                const pp = path_point[''+i]
                area_text+= "["+pp.lon+","+pp.lat+"]"
                waypath+= pp.lon+","+pp.lat
                if( i < (total_path_point-1)) {
                  waypath+="|"
                  area_text+=","
                }
                i++
              }
              add_route.path_point = waypath
            }
          }
          area_text+= "]"
          add_route.area = '{"type":"FeatureCollection","features":[{"id": "'+uuid.v4()+'","type":"Feature","properties":{},"geometry":{"coordinates": '+area_text+',"type":"LineString"}}]}'
          const createdRoute = await super.createRecord(DEFINED.tableNames.tbl_route, add_route);
          if (!(_.isNull(createdRoute))) {
            //register new route
            const RouteDetail = {
              id: 0,
              rid: createdRoute.id,
              vid
            }
            const createdRouteDetail = await super.createRecord(DEFINED.tableNames.tbl_route_detail, RouteDetail);
            if (!(_.isNull(createdRouteDetail))) {
              const options = { where: { rid: createdRoute.id, vid }, include:{ all: true} };
              let Route_Detail = await super.getByOption(DEFINED.tableNames.tbl_route_detail, options);
              const socketData = {
                subcmd: 'add',
                data: Util.getRouteInfo(Route_Detail)
              }
              app.io.sendUserCommand(header.Code, socketData, vid)
            }
          }
        }
      }
      else
      {
        logger.log("Invalid Payload",'error')
      }
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setCameraStream({header, payload}) {
    let ret = {header, payload:{}}
    try {
      const id = header.VID
      const {url} = payload
      if(id && !_.isEmpty(url)) {
        let vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, {where:{id}});
        if(vehicle) {
          vehicle.camera_stream = url;
          vehicle.save()
          ret = vehicle
        }
      }
      else
      {
        logger.log("Invalid Payload",'error')
      }
		} catch (err) {
			logger.log({header, payload: err}, 'error');    
      ret = {header, payload: err}
		}
    return ret
  }

  static async getCharges({header}) {    
    try {
      const vid = header.VID
      const options = {
        where: { 
          vid
        },
        include: [
          { model: app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, attributes: ['id', 'location']},
        ],
      } 
      const RouteDetail = await super.getByOptions(DEFINED.tableNames.tbl_route_detail, options);
      let ret = []
      let location = ''
      let charge_location = {}
      await RouteDetail.forEach((route) => { 
        const {charge_id, ChargeStation} = route.dataValues
        //Charge Station Location
        if(ChargeStation && !_.isEmpty(ChargeStation.location)) {
          location = JSON.parse(ChargeStation.location)
          charge_location = {lon: location.features[0].geometry.coordinates[0], lat: location.features[0].geometry.coordinates[1]}
          ret.push({id: charge_id, ...charge_location});
        }
      });
      return {header, payload: ret}
		} catch (err) {
			return {header, payload: err}
		}
  }
  
  static async getGarages({header}) {    
    try {
      const vid = header.VID
      const options = {
        where: { 
          vid
        },
        include: [
          { model: app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, attributes: ['id', 'location']},
        ],
      } 
      const RouteDetail = await super.getByOptions(DEFINED.tableNames.tbl_route_detail, options);
      let ret = []
      let location = ''
      let garage_location = {}
      await RouteDetail.forEach((route) => { 
        const {garage_id, Garage} = route.dataValues
        //Garage Station Location
        if(Garage && !_.isEmpty(Garage.location)) {
          location = JSON.parse(Garage.location)
          garage_location = {lon: location.features[0].geometry.coordinates[0], lat: location.features[0].geometry.coordinates[1]}
          //Add for payload
          ret.push({id: garage_id, ...garage_location})
        }
      });
      return {header, payload: ret}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async getRoutes({header}) {    
    try {
      const vid = header.VID
      const options = {
        where: { 
          vid
        },
        include: [
          { model: app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, reqiure: true, attributes: ['id', 'gid', 'start_point', 'end_point', 'home_point', 'path_point']},
          { model: app.get('db')[DEFINED.tableNames.tbl_group_charge_station], as: DEFINED.tbAlias.ChargeStation, reqiure: false, attributes: ['id', 'location']},
          { model: app.get('db')[DEFINED.tableNames.tbl_group_garage], as: DEFINED.tbAlias.Garage, reqiure: false, attributes: ['id', 'location']},
        ],
      } 
      const RouteDetail = await super.getByOptions(DEFINED.tableNames.tbl_route_detail, options);
      let ret = []
      await RouteDetail.forEach((route) => { 
        let ppoint = []
        let location = ''
        let charge_location = {}
        let garage_location = {}
        const {id, rid, charge_id, garage_id, CleanRoute, ChargeStation, Garage} = route.dataValues
        let {start_point, area, end_point, home_point, path_point} = CleanRoute

        //Charge Station Location
        if(ChargeStation && !_.isEmpty(ChargeStation.location)) {
          location = JSON.parse(ChargeStation.location)
          charge_location = {lon: location.features[0].geometry.coordinates[0], lat: location.features[0].geometry.coordinates[1]}
        }
        //Garage Station Location
        if(Garage && !_.isEmpty(Garage.location)) {
          location = JSON.parse(Garage.location)
          garage_location = {lon: location.features[0].geometry.coordinates[0], lat: location.features[0].geometry.coordinates[1]}
        }
        //Route Start Point
        if(start_point && start_point!="") {
          start_point = JSON.parse(start_point)
          start_point = {lon: start_point[0], lat: start_point[1]}
        }else{
          start_point = {lon: 0, lat: 0}
        }
        //Route End Point
        if(end_point && end_point!="") {
          end_point = JSON.parse(end_point)
          end_point = {lon: end_point[0], lat: end_point[1]}
        }else{
          end_point = {lon: 0, lat: 0}
        }
        //Route Home Point
        if(home_point && home_point!="") {
          home_point = JSON.parse(home_point)
          home_point = {lon: home_point[0], lat: home_point[1]}
        }else{
          home_point = {lon: 0, lat: 0}
        }

        //All Path Points
        const points = path_point.split('|');
        if(_.size(points)) {
          points.forEach(p => {
            const ap = p.split(',')
            ppoint.push({lon: ap[0], lat: ap[1]})
          })
        }        
        //Add for payload
        ret.push({id: rid, charge_id, garage_id, 
          start_point, 
          end_point, 
          home_point,
          total_path_point: _.size(ppoint), 
          path_point: ppoint, 
          charge_location, 
          garage_location
        })
      });
      return {header, payload: ret}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setAutonomousMode({header, payload}){
    try {
      const vid = header.VID
      if(!_.isEmpty(payload)) {
        const {data} = payload
        //data : 1(start), 0(stop)
        const options = {
          where: { id: vid }
        } 
        const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
        if(vehicle) {
          if(data) {
            vehicle.state |= DEFINED.vehicle.state.autonomous_mode
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.return_mode)
          }else{
            vehicle.state &= ~DEFINED.vehicle.state.autonomous_mode
          }
          await vehicle.save()
          //send to user & vehicle
          app.io.sendUserCommand(header.Code, payload, vid)
        }else{
          logger.log(`setAutonomousMode - No found vehicle ${vid}`,'error')
        }
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setCleanMode({header, payload}){
    try {
      const vid = header.VID
      if(!_.isEmpty(payload)) {
        const {data} = payload
        //data : 1(start), 0(stop)
        const options = {
          where: { id: vid }
        } 
        const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
        if(vehicle) {
          if(data) {
            vehicle.state |= DEFINED.vehicle.state.clean_mode
          }else{
            vehicle.state &= ~DEFINED.vehicle.state.clean_mode
          }
          await vehicle.save()
          //send to user & vehicle
          app.io.sendUserCommand(header.Code, payload, vid)
        }else{
          logger.log(`setAutonomousMode - No found vehicle ${vid}`,'error')
        }
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setChargeMode({header, payload}){
    try {
      const vid = header.VID
      if(!_.isEmpty(payload)) {
        const {data} = payload
        //data : 1(start), 0(stop)
        const options = {
          where: { id: vid }
        } 
        const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
        if(vehicle) {
          if(data) {
            vehicle.state |= DEFINED.vehicle.state.charge_mode
          }else{
            vehicle.state &= ~DEFINED.vehicle.state.charge_mode
          }
          await vehicle.save()
          //send to user & vehicle
          app.io.sendUserCommand(header.Code, payload, vid)
        }else{
          logger.log(`setAutonomousMode - No found vehicle ${vid}`,'error')
        }
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setEmergency({header, payload}){
    try {
      const vid = header.VID
      if(!_.isEmpty(payload)) {
        const {engin, data} = payload        
        const options = {
          where: { id: vid }
        } 
        const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
        if(vehicle) {
          // if(engin == 0) {
          //   vehicle.state &= ~DEFINED.vehicle.state.on
          // }else{
          //   vehicle.state |= DEFINED.vehicle.state.on
          // }
          if(data === 1) {
            vehicle.state |= DEFINED.vehicle.state.em_stop_mode
            vehicle.state &= ~(DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.return_mode|DEFINED.vehicle.state.autonomous_mode)
          } else if(data === 2) {
            vehicle.state |= DEFINED.vehicle.state.evacuation_mode
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.return_mode|DEFINED.vehicle.state.autonomous_mode)
          }else if(data === 3) {
            vehicle.state |= DEFINED.vehicle.state.return_mode
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.autonomous_mode)
          }else{
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.return_mode)
          }
          await vehicle.save()
          //send to user & vehicle
          app.io.sendUserCommand(header.Code, payload, vid)
        }else{
          logger.log(`setAutonomousMode - No found vehicle ${vid}`,'error')
        }
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setYTRoute({header, payload}) {    
    try {
      const vid = header.VID
      const {data} = payload
      const vh =  await super.getByOption(DEFINED.tableNames.tbl_vehicle, {where:{id:vid}});
      if(vh) {
        vh.clean_route_id = data
        vh.save()
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setDetectedFod({header, payload}) {
    try {
      const vid = header.VID
      let options = {
        where: { 
          id: vid
        },
      }
			const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
      if(vehicle) {
        const {subcmd, id, lon, lat, time, image, video, label}  = payload
        if(subcmd==='add') {
          const eventLog = {
            // id: uuid.v4(),
            id,
            vid,
            rid:vehicle.clean_route_id,
            lon,
            lat,
            label,
            image,
            video,
            create_dt: time
          }
          super.createRecord(DEFINED.tableNames.tbl_vehicle_fod, eventLog );
        }else if(subcmd==='delete') {
          super.deleteId(DEFINED.tableNames.tbl_vehicle_fod, id);
        }
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }

  static async setCleanRoute({header, payload}) {    
    try {
      const vid = header.VID
      const {route_id} = payload
      let ret = {}
      if(route_id>0) {
        const options = {
          where: { rid: route_id, vid },
          include: [
            { model: app.get('db')[DEFINED.tableNames.tbl_route], as: DEFINED.tbAlias.CleanRoute, attributes: ['id', 'area', 'home_point', 'start_point', 'end_point']},
            { model: app.get('db')[DEFINED.tableNames.tbl_vehicle], as: DEFINED.tbAlias.Vehicle},
          ],
        } 
        const route = await super.getByOption(DEFINED.tableNames.tbl_route_detail, options);
        if(route){
          const {id, CleanRoute, Vehicle} = route.dataValues
          const {area,start_point, end_point, home_point} = CleanRoute.dataValues
          ret = {
            id:route_id,
            area,
            start_point, 
            end_point,
            home_point
          }
          Vehicle.clean_route_id = route_id
          Vehicle.save()
        }else{
          const vh =  await super.getByOption(DEFINED.tableNames.tbl_vehicle, {where:{id:vid}});
          if(vh) {
            vh.clean_route_id = 0
            vh.save()
          }
        }
      }
      return {header, payload: ret}
		} catch (err) {
			return {header, payload: err}
		}
  }
  
  static async updateInfo({header, payload}) {    
    try {
      const vid = header.VID
      let options = {
        where: { 
          id: vid
        },
      }
			const vehicle = await super.getByOption(DEFINED.tableNames.tbl_vehicle, options);
      if(vehicle) {
        const {lon, lat, speed, water, garbage, battery, cleanning, clean_completion, clean_remain_time, system_mode, error }  = payload
        vehicle.longitude = lon 
        vehicle.latitude = lat
        if(speed>=0) vehicle.speed = speed
        if(water>=0) vehicle.water = water
        if(garbage>=0) vehicle.garbage = garbage
        if(battery>=0) vehicle.battery = battery>100?100:battery
        if(clean_completion>=0) vehicle.clean_completion = clean_completion>100?100:clean_completion
        if(clean_remain_time>=0) vehicle.clean_remain_time = clean_remain_time>=60?60:clean_remain_time
        
        //cleaning mode setting
        vehicle.state |= DEFINED.vehicle.state.on
        if(cleanning && (vehicle.state & DEFINED.vehicle.state.clean_mode)==0)  
          vehicle.state |= DEFINED.vehicle.state.clean_mode
        else if(cleanning == 0 && (vehicle.state & DEFINED.vehicle.state.clean_mode))
          vehicle.state &= ~DEFINED.vehicle.state.clean_mode
        
        //autonomous driving mode
        // if(system_mode && (vehicle.state & DEFINED.vehicle.state.autonomous_mode)==0)  
        //   vehicle.state |= DEFINED.vehicle.state.autonomous_mode
        // else if(system_mode == 0 && (vehicle.state & DEFINED.vehicle.state.autonomous_mode))
        //   vehicle.state &= ~DEFINED.vehicle.state.autonomous_mode
        
        let mode = system_mode
        if(typeof system_mode === 'string'){                                                                          
            mode = parseInt(system_mode)
        }

        switch(mode) {
          // auto stop
          case 0:
          case 1:
            vehicle.state &= ~DEFINED.vehicle.state.autonomous_mode
          break;
          // 긴급 정지
          case 3:
            vehicle.state |= DEFINED.vehicle.state.em_stop_mode
            vehicle.state &= ~(DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.return_mode|DEFINED.vehicle.state.autonomous_mode)
          break;
          // 긴급 대피
          case 4:
            vehicle.state |= DEFINED.vehicle.state.evacuation_mode
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.return_mode|DEFINED.vehicle.state.autonomous_mode)
          break;
          // 복귀
          case 5:
            vehicle.state |= DEFINED.vehicle.state.return_mode
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.autonomous_mode)
          break;
          // Auto start
          case 2:
          case 6:
          case 7:
            vehicle.state |= DEFINED.vehicle.state.autonomous_mode
            vehicle.state &= ~(DEFINED.vehicle.state.em_stop_mode|DEFINED.vehicle.state.evacuation_mode|DEFINED.vehicle.state.return_mode)
          break;
        }

        // if(mode === 6 || mode === 2 || mode === 7) {
        //     vehicle.state |= code.vehicle.state.autonomous_mode
        // }else if(mode===0) {
        //     vehicle.state &= ~code.vehicle.state.autonomous_mode
        // }  

        const eventdate = moment().unix()
        const eventLog = {
          event_date: eventdate,
          vid,
          lng: lon,
          lat,
          speed,
          water,
          garbage,
          battery,
          clean_completion, 
          clean_remain_time,
          state: vehicle.state,
          system_mode,
          error
        }
        vehicle.save()
        super.createRecord(DEFINED.tableNames.tbl_position, eventLog );
      }
      return {header, payload}
		} catch (err) {
			return {header, payload: err}
		}
  }
  

  static vhicle_log(code,vid, {header, payload}) {
    
  }

}

module.exports = WsController;