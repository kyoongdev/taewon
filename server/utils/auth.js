const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('../config/appconfig');
const RequestHandler = require('../utils/RequestHandler');
const Logger = require('../utils/logger');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);

function getTokenFromHeader(req) {
	if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token')
		|| (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
		return req.headers.authorization.split(' ')[1];
	}
	return null;
}

async function verifyToken(req, res, next) {
	try {
		if (_.isUndefined(req.headers.authorization)) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		//Get Bearer Key
		const Bearer = req.headers.authorization.split(' ')[0];
		if (!Bearer || Bearer !== 'Bearer') {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		//Get Token Value
		const token = req.headers.authorization.split(' ')[1];
		if (!token) {
			requestHandler.throwError(401, 'Unauthorized', 'Not Authorized to access this resource!')();
		}
		let result;
		try {
			result = await req.app.get('db')[DEFINED.tableNames.tbl_user_token].findOne({where: {token}});
			if(result) {
				// verifies secret and checks exp
				jwt.verify(token, config.auth.jwt_secret, (err, decoded) => {
					if (err) {
						requestHandler.throwError(401, 'Unauthorized', 'please provide a vaid token ,your token might be expired')();
					}
					req.decoded = decoded;
					next();
				});
			} else {
				requestHandler.throwError(401, 'Unauthorized', 'your session might be expired')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);	
		}
	} catch (err) {
		requestHandler.sendError(req, res, err);
	}
}


module.exports = { getJwtToken: getTokenFromHeader, isAuthunticated: verifyToken };
