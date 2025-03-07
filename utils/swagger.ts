import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import * as fs from 'fs';
import * as path from 'path';

// Import the Swagger document
const swaggerDocument = JSON.parse(fs.readFileSync(path.join('./src/swagger.json'), 'utf8'));

export const setupSwagger = (app: Express): void => {
	// If using an existing Swagger document
	const swaggerDocument = JSON.parse(
		fs.readFileSync(path.join(__dirname, '../src/swagger.json'), 'utf8'),
	);

	app.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerDocument, {
			explorer: true,
		}),
	);
};
