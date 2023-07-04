const _ = require('lodash');
global.moment = require('moment');
require('moment-timezone');
global.moment.tz.setDefault("Asia/Seoul"); 
const config = require('../config/appconfig');
const WsController = require('../controllers/WsController');
const VideoStream = require('node-rtsp-stream');
const { app } = require('../config/appconfig');
const { exec } = require("child_process");

const ROOMS = {
  VEHICLE_ROOM : 'VEHICLE_ROOM',
  USER_ROOM : 'USER_ROOM',
}
const code = {
  //COMMAND
  cmd: {

    //setter
    set_login             : 10000,
    set_logout            : 10010,
    set_route             : 10020,
    set_route_yt          : 10022,
    set_charge            : 10030,
    set_garage            : 10040,
    set_emergency         : 10050,
    set_streaming_info    : 10060,
    set_streaming_start   : 10070,
    set_streaming_stop    : 10080,
    set_clean_route       : 10090,

    set_self_driving      : 10100,
    set_cleaning          : 10110,
    set_streaming         : 10120,


    //getter
    get_charge            : 20000,
    get_garage            : 20010,
    get_route             : 20020,
    get_stream_info       : 20030,

    
    //web setter
    set_add_group         : 30000,
    set_update_group      : 30010,
    set_delete_group      : 30020,
    get_clean_route       : 40000,


  },
  
  //EVENT
  evt :{
    clean_prepare         : 60000,
    self_driving_start    : 60010,
    self_driving_stop     : 60020,
    clean_start           : 60030,
    clean_stop            : 60040,
    update_info           : 60050,
    move_to_charge        : 60060,
    move_to_garage        : 60070,
    charging              : 60080,
    garage_parking        : 60090,
    video_stream_start    : 60100,
    video_stream_stop     : 60110,
    video_stream_info     : 60111,
    detected_fod          : 60120,
  },
}

/*
 * Websocket (socket io setting)
 */
var StreamServer = undefined
var session_clients = {}
var vh_socket_id = {}
var vh_video_stream = {}

const io = require('socket.io')({
	path: "/webio/",
	transports: ["websocket"],
	cors: { origin: "*" }
});
io.code = code
io.ROOMS = ROOMS
io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.api_key){
    console.log('socket.handshake.query.key::::', socket.handshake.query.api_key)
    if(socket.handshake.query.api_key !== config.app.socketkey) {
      next(new Error('Authentication API Key Error.'));
    }else {
      next();
    }
  }
  else {
    next(new Error('Authentication API Key is required.'));
  } 
}).on('connection',(socket) => {
  console.log('-->id: '+socket.id)
  socket.on("error", (err) => {
    if (err) {
      socket.disconnect();
    }
  })
  //for users
  .on("subscribe", function(room) {
    // Join group
    socket.join(room)
    console.log('subscribe--> ROOM:', socket.rooms)
  })
  //for users
  .on("unsubscribe", function(room) {
    // Join group
    socket.leave(room)
    console.log('unsubscribe--> ROOM:', socket.rooms)
  })
  // Broadcast command to room
  .on(config.app.commands, async function(data) {
    const {API, header, payload} = data
    if(!API && API !== true) {
      if(header && header instanceof Object) {
        let {Code, VID, Datetime, room} = header
        if(typeof VID === 'string') {
          VID = parseInt(VID)
          data.header.VID = parseInt(VID)
        }
        //Vehicle
        if(Code && VID && Datetime) {
          console.log('--------------------------commands-----------vh', Number(Code))
          let send_response = false
          let send_to_user = false
          switch(Number(Code)){
            case code.cmd.set_login:
              result = await WsController.setLogin(data)
              if(result.header && _.isNumber(result.header.VID)) {
                session_clients[socket.id] = result.header.VID
                vh_socket_id[result.header.VID] = socket.id
                vh_video_stream[result.header.VID] = null;
              }
              send_response = true
              send_to_user = true
              break;
            case code.cmd.set_logout:
              result = await  WsController.setLogout(data)
              // send_to_user = true
              break;
            case code.cmd.set_clean_route:
              result = await  WsController.setCleanRoute(data)
              send_to_user = true
              break;
            case code.cmd.set_charge:
              result = await  WsController.setChargeMode(data)
              break;
            case code.cmd.set_self_driving:
              result = await  WsController.setAutonomousMode(data)
              break;
            case code.cmd.set_cleaning:
              result = await  WsController.setCleanMode(data)
              break;
            case code.cmd.set_emergency:
              result = await  WsController.setEmergency(data)
              break;
            case code.cmd.set_route:
              result = await  WsController.setRoutes(data)
              break;
            case code.cmd.set_route_yt:
              result = await  WsController.setYTRoute(data)
              if(VID && vh_socket_id[VID]) {
                //send to vehicle
                io.to(vh_socket_id[VID]).emit(config.app.commands, data);
              }
              break;
            case code.cmd.set_streaming_info:
              result = await  WsController.setCameraStream(data)
              if(StreamServer !== undefined) {
                if(VID ===  StreamServer["stream_vehicle_id"] ){
                  const ret = StartStreamServer(data, payload.url)
                  if(!ret){
                    //send event to webconsole
                    header.Code = code.evt.video_stream_start
                    header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
                    result = {
                      header,
                      payload:{status: 200, msg: "ready"}
                    }
                    send_response = true
                  }else{
                    if(StreamServer !== undefined) {
                      StreamServer["stream_status"] = false
                      StreamServer["stream_vehicle_id"] = VID
                    }
                  }
                }
              }
              break;
            case code.cmd.set_streaming_start:
              const {streamUrl} = payload
              if(VID && vh_socket_id[VID]) {
                //send to vehicle
                const vhCommand = {
                  header: {
                    Code: code.cmd.set_streaming,
                    VID,
                    Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
                  },
                  payload: {
                    streamin_mode: 1,
                    streamin_source : 0 //(default)
                  }
                }
                io.to(vh_socket_id[VID]).emit(config.app.commands, vhCommand);
              }
              const ret = StartStreamServer(data, streamUrl)
              if(!ret){
                //send event to webconsole
                header.Code = code.evt.video_stream_start
                header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
                result = {
                  header,
                  payload:{status: 200, msg: "ready"}
                }
                send_response = true
              }else{
                if(StreamServer !== undefined) {
                  StreamServer["stream_status"] = false
                  StreamServer["stream_vehicle_id"] = VID
                }
              }
              break;
            case code.cmd.set_streaming_stop:
              if(StreamServer !== undefined) {
                // if(StreamServer.wsServer.clients.size == 0) {
                StreamServer.stop();
                delete StreamServer	
                StreamServer = undefined
                // }
              }
              if(VID && vh_socket_id[VID]) {
                //send to vehicle
                const vhCommand = {
                  header: {
                    Code: code.cmd.set_streaming,
                    VID,
                    Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
                  },
                  payload: {
                    streamin_mode: 0,
                    streamin_source : 0 //(default)
                  }
                }
                io.to(vh_socket_id[VID]).emit(config.app.commands, vhCommand);
                // io.to(vh_socket_id[VID]).emit(config.app.commands, data);
              }
              //test send event to webconsole
              header.Code = code.evt.video_stream_stop
              header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
              io.sockets.in(ROOMS.USER_ROOM).emit(config.app.events, {header});              
              break;
            case code.cmd.get_charge:
              result = await  WsController.getCharges(data)
              send_response = true
              break;
            case code.cmd.get_garage:
              result = await  WsController.getGarages(data)
              send_response = true
              break;
            case code.cmd.get_route:
              result = await  WsController.getRoutes(data)
              send_response = true
              break;       
            case code.cmd.get_clean_route:
              result = await  WsController.setCleanRoute(data)
              send_response = true
              break;
            default:
              break;
          }
          data.header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
          if(send_response) {
            io.to(socket.id).emit(config.app.commands, result);
          }
          if(send_to_user) {
            io.sockets.in(ROOMS.USER_ROOM).emit(config.app.commands, result);
          }
        }
        //User
        else if(room === ROOMS.USER_ROOM)
        {
          const {payload} = data
          io.sockets.in(room).emit(config.app.commands, data);
        }else{
          console.log('-------------Unknown header!', header);  
        }
      } else {
        console.log('-------------Unknown command!', data);
      }
    }
  })

  // Broadcast event to room
  .on(config.app.events, async function(data) {
    const {API, header} = data
    if(!API && API !== true) {
      if(header && header instanceof Object) {
        const {Code, VID, Datetime, room} = header
        if(typeof VID === 'string') {
          data.header.VID = parseInt(VID)
        }
        //Vehicle
        if(Code && VID && Datetime) {
          let result = {}
          const EvtCode = Number(Code)
          console.log('------------------------events------------------',EvtCode);
          switch(EvtCode){
            case code.evt.update_info:
              WsController.updateInfo(data)
              break;
            case code.evt.self_driving_start:
            case code.evt.self_driving_stop:
              WsController.setAutonomousMode(data)
              break;
            case code.evt.detected_fod:
              WsController.setDetectedFod(data)
              break;
            default:
              break;
          }
          data.header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
          io.sockets.in(ROOMS.USER_ROOM).emit(config.app.events, data);
          //io.to(socket.id).emit(config.app.events, result);
        }
        //User
        else if(room === ROOMS.USER_ROOM)
        {
          const {payload} = data
          io.sockets.in(room).emit(config.app.events, data);
        }else{
          console.log('-------------Unknown header!', header);  
        }
      } else {
        console.log('-------------Unknown command!', data);
      }
    }
  })
  //client is disconnected.
  .on('disconnect', () => {
    let VID = session_clients[socket.id]
    if(typeof VID === 'string') {
      VID = parseInt(VID)
    }
    const header = {
      Code: code.cmd.set_logout,
      VID,
      Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
    }
    if(_.isNumber(VID)) {
      WsController.setLogout({header})
    }
    io.sendCommand(header.Code,{},header.VID);
    delete vh_socket_id[VID]
    if(!_.isNull(vh_video_stream[VID])) {
      // vh_video_stream[VID].stop()
      delete vh_video_stream[VID]
    }
    delete session_clients[socket.id]
    console.log('connection closed', socket.id);
  })
})

io.sendCommand = (cmd, payload, vid = 0) => {
  const header = {
    Code: cmd,
    VID: vid?vid: 0,
    Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
  }
  const command = {
    header,
    payload
  }
  io.sockets.emit(config.app.commands, command);
}

io.sendEvent = (cmd, payload, vid = 0) => {
  const header = {
    Code: cmd,
    VID: vid?vid: 0,
    Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
  }
  const event = {
    header,
    payload
  }
  io.sockets.emit(config.app.events, event);
}

io.sendUserCommand = (cmd, payload, vid = 0) => {
  vid = Number(vid)
  const header = {
    Code: cmd,
    VID: vid?vid: 0,
    Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
  }
  const command = {
    header,
    payload
  }
  console.log(command,'comand------------------')
  if(vid && vh_socket_id[vid]) {
    io.to(vh_socket_id[vid]).emit(config.app.commands, command);
  }
  io.sockets.in(ROOMS.USER_ROOM).emit(config.app.commands, command);
}

io.sendUserEvent = (cmd, payload, vid = 0) => {
  const header = {
    Code: cmd,
    VID: vid?vid: 0,
    Datetime: moment().format("YYYY-MM-DD HH:mm:ss")
  }
  const event = {
    header,
    payload
  }
  if(vid && vh_socket_id[vid]) {
    io.to(vh_socket_id[vid]).emit(config.app.events, event);
  }
  io.sockets.in(ROOMS.USER_ROOM).emit(config.app.events, event);
}

var StartStreamServer = async (data, streamUrl) => {
  const {header, payload} = data
  const {VID} = header
  
  if(StreamServer !== undefined) {
    if(StreamServer.streamUrl === streamUrl && StreamServer.wsServer.clients.size > 0) {
      return false;
    }
    StreamServer.stop()
    delete StreamServer
    StreamServer = undefined
  }
  //sleep a second.
  await new Promise(resolve => setTimeout(resolve, 1000));
  //Start new stream
  const vdeoname =  __dirname+'/../assets/video/'+VID+"__"+moment().format("YYYY_MM_DD_HH_mm_ss")+".mp4"
  StreamServer = new VideoStream({
    name: 'StreamServer',
    streamUrl : streamUrl,
    wsPort: 6055,
    ffmpegOptions: { // options ffmpeg flags
      '-stats': '', // an option with no neccessary value uses a blank string
      '-framerate': 30, // options with required values specify the value after the key
      'record': vdeoname
    },
  });              
  StreamServer.on('exitWithError',()=>{
    console.log(StreamServer,'------------------------------')
    if(StreamServer !== undefined) {
      StreamServer.stop();
      delete StreamServer	
      StreamServer = undefined
    }
  });
  StreamServer.mpeg1Muxer.on('ffmpegStderr', (data)=>{
    data = data.toString();
    if(StreamServer !== undefined) {
      if(StreamServer["stream_status"] === true && data.includes('frame=') && data.includes('time=')) {
          header.Code = code.evt.video_stream_info
          header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
          const event = { header, payload:{ video_info: data } }
          io.sockets.in(ROOMS.USER_ROOM).emit(config.app.events, event);
          StreamServer["stream_time"] = Math.floor(Date.now() / 1000) 
          return true
      }
      else if(StreamServer["stream_status"] === false && data.includes('frame=')) {
        StreamServer["stream_status"] = true
        //send event to webconsole
        header.Code = code.evt.video_stream_start
        header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
        const event = {
          header,
          payload:{status: 200, msg: "ready"}
        }
        io.sockets.in(ROOMS.USER_ROOM).emit(config.app.events, event);
        StreamServer["stream_time"] = Math.floor(Date.now() / 1000) 
        return true
      }
      if(StreamServer.wsServer.clients.size == 0) {
        const current = Math.floor(Date.now() / 1000)
        if(current - StreamServer["stream_time"] >= 30) {
          StreamServer.stop();
          delete StreamServer	
          StreamServer = undefined
        }
      }else{
        StreamServer["stream_time"] = Math.floor(Date.now() / 1000) 
      }
      if(data.includes('muxing overhead') || data.search(streamUrl+": ") !== -1){
        StreamServer.stop();
        delete StreamServer	
        StreamServer = undefined
        header.Code = code.evt.video_stream_start
        header.Datetime = moment().format("YYYY-MM-DD HH:mm:ss")
        const urlPos = data.indexOf(streamUrl);
        if(urlPos > 0) {
          data = data.substr(urlPos)
        }
        const event = {
          header,
          payload: {status: 400, msg: data}
        }
        io.sockets.in(ROOMS.USER_ROOM).emit(config.app.events, event);
      } 
    }
  });

  if(StreamServer !== undefined) {
    StreamServer["stream_time"] = Math.floor(Date.now() / 1000) 
    StreamServer["stream_status"] = false
    StreamServer["stream_vehicle_id"] = VID
  }
  return true
}

module.exports = io