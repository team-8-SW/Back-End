import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';

// Import the Swagger document
const swaggerDocument = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf8'),
);

export const setupSwagger = (app: Express): void => {
	app.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerDocument, {
			explorer: true,
		}),
	);
};
