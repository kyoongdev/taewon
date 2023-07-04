const Joi = require('joi');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const Logger = require('../utils/logger');
const RequestHandler = require('../utils/RequestHandler');
const BaseController = require('./BaseController');
const config = require('../config/appconfig');
const auth = require('../utils/auth');
const logger = new Logger();
const requestHandler = new RequestHandler(logger);
const tokenList = {};
const EMAIL = require('../utils/email');

class AuthController extends BaseController {

	static async login(req, res) {
		try { 
			const schema = Joi.object({
				userid: Joi.string()
						.alphanum()
						.min(3)
						.max(30)
						.required()
						.messages({
							'string.empty': `UserID is required.`,
							'string.min': `UserID should have a minimum length of {#limit}`,
							'string.max': `UserID should have a maximum length of {#limit}`,
							'any.required': `User id is required.`
						}),
				password: Joi.string().min(6).max(30)
						// .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/)
						.required()
						.messages({
							'string.empty': `Password is required.`,
							'any.required': `Password is required.`,
							'string.min': `Password should have a minimum length of {#limit}`,
							'string.max': `Password should have a maximum length of {#limit}`,
							// 'string.pattern.base': `Password should be at least one uppercase letter, one lowercase letter, one number and one special character`
						}),
			});
			const { error } = schema.validate(req.body);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
			
			const invalidMsg = 'Invalid UserId or password'
			const options = {
				where: { userid: req.body.userid },
				include: [
					{
						model: req.app.get('db')[DEFINED.tableNames.tbl_user_role], as: DEFINED.tbAlias.UserRole
					},
					{
						model: req.app.get('db')[DEFINED.tableNames.tbl_user_group], as: DEFINED.tbAlias.UserGroup
					}
				],
			};
			const user = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
			if (!user) {
				requestHandler.throwError(400, 'Bad request', invalidMsg)();
			}

			await bcrypt
			.compare(req.body.password, user.pwd)
			.then(
				requestHandler.throwIf(r => !r, 400, 'Bad request', invalidMsg),
				requestHandler.throwError(500, 'Server got error'),
			);
			req.params.id = user.id;
			user.state |= DEFINED.user.state.login
			user.last_login = new Date()
			user.save()
			
			const payload = {
				id: user.id,
				userid: user.userid,
			}
			//Generate token & refresh-token
			const token = jwt.sign({ payload }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
			const refreshToken = jwt.sign({
				payload,
			}, config.auth.refresh_token_secret, {
				expiresIn: config.auth.refresh_token_expiresin,
			});
			// update user token
			let user_access_ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.ip || req.socket.remoteAddress
			user_access_ip = user_access_ip.toString().replace('::ffff:', '');
			const find = {
				where: {
					uid: user.id
				},
			};
			const userToken = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user_token, find);			
			const utdata = {uid: user.id, token, refresh_token: refreshToken, last_login_ip: user_access_ip}
			if (userToken) {
				req.app.io.sendUserEvent(req.app.io.code.cmd.set_login, {
					token : userToken.token
				})
				await super.updateByCustomWhere(req, DEFINED.tableNames.tbl_user_token, utdata, {uid: user.id});
			} else {
				await super.create(req, DEFINED.tableNames.tbl_user_token, utdata);
			}

			const response = {
				status: 'Logged in',
				token,
				refreshToken,
			};
			tokenList[refreshToken] = response;
			const userdata = _.omit(user.dataValues,['pwd'])
			requestHandler.sendSuccess(res, 'User logged in Successfully')({ user:userdata, token, refreshToken });
		} catch (error) {
			requestHandler.sendError(req, res, error);
		}
	}

	static async signUp(req, res) {
		try {
			let data = req.body
			const { userid , password, name, email } =  data
			const checkProps = { userid , password, name, email }
			const schema = Joi.object({
				userid: Joi.string()
						.alphanum()
						.min(3)
						.max(30)
						.required()
						.messages({
							'string.empty': `UserID is required.`,
							'string.min': `UserID should have a minimum length of {#limit}`,
							'string.max': `UserID should have a maximum length of {#limit}`,
							'any.required': `User id is required.`
						}),
				password: Joi.string()
						.min(6)
						.max(30)
						.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
						.required()
						.messages({
							'string.empty': `Password is required.`,
							'any.required': `Password is required.`,
							'string.min': `Password should have a minimum length of {#limit}`,
							'string.max': `Password should have a maximum length of {#limit}`,
							'string.pattern.base': `Password should be at least one uppercase letter, one lowercase letter, one number and one special character`
						}),
				name: 	Joi.string().required(),
				email: 	Joi.string().email().required()
								.messages({
									'string.email': `Invalid Email Address.`
								})
			});

			const { error } = schema.validate(checkProps);
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}

			//check duplicated user id
			let options = { where: { userid: data.userid } };
			let user = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
			if (user) {
				requestHandler.throwError(400, 'Bad request', 'invalid Userid account, Userid already existed')();
			}
			//check duplicated user email
			options = { where: { email: data.email } };
			user = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
			if (user) {
				requestHandler.throwError(400, 'Bad request', 'invalid Email address, Email already existed')();
			}
			//generate hash password
			const hashedPass = bcrypt.hashSync(data.password, config.auth.saltRounds);
			data.pwd = hashedPass;
			if(data.roleid) {
				data.role = data.roleid;
			}else{
				data.role = 3; // 3: User Role.
			}
			const createdUser = await super.create(req, DEFINED.tableNames.tbl_user);
			if (!(_.isNull(createdUser))) {
					options = {
						where:{id:createdUser.id},
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
				const result = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
				requestHandler.sendSuccess(res, 'User is successfully registered.', 200)(result);
			} else {
				requestHandler.throwError(422, 'Unprocessable Entity', 'Failed to register user.')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async refreshToken(req, res) {
		try {
			const data = req.body;
			if (_.isNull(data)) {
				requestHandler.throwError(400, 'bad request', 'please provide the refresh token in request body')();
			}
			const schema = Joi.object({
				refreshToken: Joi.string().required(),
			})
			const { error } = schema.validate({ refreshToken: req.body.refreshToken });
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			if ((data.refreshToken) && (data.refreshToken in tokenList)) {
				const token = jwt.sign({ user }, config.auth.jwt_secret, { expiresIn: config.auth.jwt_expiresin, algorithm: 'HS512' });
				const response = {
					token,
				};
				const user_access_ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.ip || req.socket.remoteAddress
				const utdata = {token, refresh_token: data.refreshToken, last_login_ip: user_access_ip}
				await super.updateByCustomWhere(req, DEFINED.tableNames.tbl_user_token, utdata, {uid: user.id});

				// update the token in the list
				tokenList[data.refreshToken].token = token;
				requestHandler.sendSuccess(res, 'a new token is issued ', 200)(response);
			} else {
				requestHandler.throwError(400, 'bad request', 'no refresh token present in refresh token list')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async logOut(req, res) {
		try {
			const tokenFromHeader = auth.getJwtToken(req);
			const user = jwt.decode(tokenFromHeader);
			if(user) {
				const options = {
					where: {
						uid: user.payload.id,
					},
				};
				const userToken = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user_token, options);
				if(userToken) {
					const deleteFcm = await super.deleteById(req, DEFINED.tableNames.tbl_user_token, options);
					if (deleteFcm === 1) {
						requestHandler.sendSuccess(res, 'User Logged Out Successfully')();
					} else {
						requestHandler.throwError(400, 'Bad request', 'User Already logged out Successfully')();
					}
				}else{
					requestHandler.sendSuccess(res, 'User Already logged out Successfully')();
				}
			} else {
				requestHandler.sendSuccess(res, 'User Already logged out Successfully')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async findID(req, res){
		try {
			const { username , email } =  req.body
			const schema = Joi.object({
				username: 	Joi.string().required(),
				email: 	Joi.string().email().required()
								.messages({
									'string.email': `Invalid Email Address.`
								})
			});
			const { error } = schema.validate({ username , email });
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
			let options = { 
				where: { 
					email,
					name: username
				}
			};
			const user = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
			if (user) {
				requestHandler.sendSuccess(res,`Your account have found. Your id is [${user.userid}]`)();
			}else{
				requestHandler.throwError(400, 'Bad request', 'Account is not found.')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}

	static async findPwd(req, res){
		try {
			const { userid, username , email } =  req.body
			const schema = Joi.object({
				userid: Joi.string()
						.alphanum()
						.min(3)
						.max(30)
						.required()
						.messages({
							'string.empty': `UserID is required.`,
							'string.min': `UserID should have a minimum length of {#limit}`,
							'string.max': `UserID should have a maximum length of {#limit}`,
							'any.required': `User id is required.`
						}),
				username: 	Joi.string().required(),
				email: 	Joi.string().email().required()
								.messages({
									'string.email': `Invalid Email Address.`
								})
			});
			const { error } = schema.validate({ userid, username , email });
			if(error) {
				requestHandler.validateJoi(error, 400, 'Bad request', error ? error.details[0].message : '');
			}
			let options = { 
				where: { 
					userid,
					email,
					name: username
				}
			};
			const user = await super.getByCustomOptions(req, DEFINED.tableNames.tbl_user, options);
			if (user) {
				const ret = EMAIL.sendEmail(config.mail.user, email, "Sorry, we need to fix this.","<b>Sorry, we need to fix this.</b>")
				ret.then((res) => {
					requestHandler.sendSuccess(res,`Reset password link have sent to your email address, [${email}].`)();
				}).catch((err) => {
					requestHandler.sendError(req, res, err);
				})
			}else{
				requestHandler.throwError(400, 'Bad request', 'Account is not found.')();
			}
		} catch (err) {
			requestHandler.sendError(req, res, err);
		}
	}
}
module.exports = AuthController;
