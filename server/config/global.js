module.exports = {
	tableNames: {
		tbl_group: "tbl_group",
		tbl_group_charge_station: "tbl_group_charge_station",
		tbl_group_garage: "tbl_group_garage",
		tbl_route: "tbl_route",
		tbl_route_detail: "tbl_route_detail",
		tbl_syslog: "tbl_syslog",
		tbl_user: "tbl_user",
		tbl_user_group: "tbl_user_group",
		tbl_user_role: "tbl_user_role",
		tbl_user_token: "tbl_user_token",
		tbl_vehicle: "tbl_vehicle",
		tbl_vehicle_fod: "tbl_vehicle_fod",
		tbl_vehicle_group: "tbl_vehicle_group",
		tbl_vehicle_log: "tbl_vehicle_log",
		tbl_vehicle_type: "tbl_vehicle_type",
		tbl_vehicle_video: "tbl_vehicle_video",
		tbl_position: "tbl_position",
	},
	tbAlias: {
		User: "User",
		UserToken: "UserToken",
		UserGroup: "UserGroup",
		UserRole: "UserRole",
		Vehicle: "Vehicle",
		VehicleType: "VehicleType",
		Group: "Group",
		VehicleGroup: "VehicleGroup",
		ChargeStation: "ChargeStation",
		Garage: "Garage",
		CleanRoute: "CleanRoute",
		RouteDetail: "RouteDetail",
		VehicleFod: "VehicleFod",
	},
	user: {
		state: {
			login: 1 << 0,
			deactivatd: 1 << 1,
		},
	},
	group: {},
	vehicle: {
		state: {
			on: 1 << 0,
			clean_mode: 1 << 1,
			autonomous_mode: 1 << 2,
			charge_mode: 1 << 3,
			parking_mode: 1 << 4,
			em_stop_mode: (1 << 5),
			evacuation_mode: (1 << 6),
			return_mode: (1 << 7),
		},
	},
};
