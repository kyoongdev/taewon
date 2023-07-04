
const express = require('express');
const router = express.Router();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const config = require('../config/appconfig');
const directoryPath = path.join(__dirname, '../router/api');
const use_yaml = false

let swaggerSpec
if(use_yaml) {
	const YAML = require('yamljs');
	swaggerSpec = YAML.load(path.join(__dirname, '../build/swagger.yaml'))
} else {
	const pathes = [];
	const filesName = fs.readdirSync(directoryPath, (err, files) => {
		// handling error
		if (err) {
			return console.log(`Unable to scan directory: ${err}`);
		}
		// listing all files using forEach
		return files.forEach(file => pathes.push(file));
	});

	function getFullPathes(names) {
		names.forEach((name) => {
			let customePath;
			if (name !== 'index') {
				customePath = `./router/api/${name}`;
			}
			if (!(_.isUndefined(name))) {
				pathes.push(customePath);
			}
		});
	}
	getFullPathes(filesName);
	const options = {
		swaggerDefinition: {
			swagger: '2.0',
			info: {
				title: 'SkyAutonet',
				version: '1.0.0',
				description: 'This Is Autonomous Road Sweeper API',
				contact: {
					email: 'bunseang.o@skyautonet.com',
				},
			},
			tags: [
				{
					name: 'Auth',
					description: ' for system authentication',
				},
				{
					name: 'Users',
					description: 'for user information setting',
				},
				{
					name: 'Groups',
					description: 'for user / vehicle groups setting',
				},
				{
					name: 'Routes',
					description: ' for cleaning routes setting',
				},
				{
					name: 'Vehicles',
					description: ' for vehicle information setting',
				},
				{
					name: 'Settings',
					description: ' for system related operation setting',
				},
			],
			schemes: ['http'],
			host: `${config.app.public_ip}:${config.app.port}`,
			basePath: '/api/v1',
			securityDefinitions: {
				Bearer: {
					type: 'apiKey',
					description: 'JWT authorization of an API',
					name: 'Authorization',
					in: 'header',
				}
			}
		},

		apis: pathes,
	};
	swaggerSpec = swaggerJSDoc(options);
}

require('swagger-model-validator')(swaggerSpec);
router.get('/json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});


router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
function validateModel(name, model) {
	const responseValidation = swaggerSpec.validateModel(name, model, false, true);
	if (!responseValidation.valid) {
		throw new Error('Model doesn\'t match Swagger contract');
	}
}

module.exports = {
	router,
	validateModel,
};
