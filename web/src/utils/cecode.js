module.exports = {
  room      : 'USER_ROOM',
  events    : 'comm:subchannel:events',
  commands  : 'comm:subchannel:commands',
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
    set_manual_mode       : 10120,
    set_streaming         : 10130,

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

  vehicle:{
		state: {
			on: 										(1 << 0),
			clean_mode:							(1 << 1),
			autonomous_mode:				(1 << 2),
			charge_mode:						(1 << 3),
			parking_mode:						(1 << 4),
			em_stop_mode:						(1 << 5),
			evacuation_mode:			  (1 << 6),
			return_mode:						(1 << 7),
		}
	}
}
