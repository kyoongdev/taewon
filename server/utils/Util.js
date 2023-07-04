const _ = require('lodash');

module.exports = {
	// generate random string
	generateString() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (let i = 0; i < 6; i += 1) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	},

	getRouteInfo(route) {
		let ppoint = []
		let location = ''
		let charge_location = {}
		let garage_location = {}
		const {rid, charge_id, garage_id, CleanRoute, ChargeStation, Garage} = route.dataValues
		let {start_point, area, end_point, path_point} = CleanRoute

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
		start_point = JSON.parse(start_point)
		start_point = {lon: start_point[0], lat: start_point[1]}
		//Route End Point
		end_point = JSON.parse(end_point)
		end_point = {lon: end_point[0], lat: end_point[1]}
		//All Path Points
		const points = path_point.split('|');
		if(_.size(points)) {
			points.forEach(p => {
				const ap = p.split(',')
				ppoint.push({lon: ap[0], lat: ap[1]})
			})
		}        
		
		return {id:rid, 
			start_point, 
			end_point, 
			charge_id, 
			charge_location, 
			garage_id, 
			garage_location,
			total_path_point: _.size(ppoint), 
			path_point: ppoint
		}
	}
};

