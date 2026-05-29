import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, '../docs/swagger.yaml'), 'utf8')
) as object;

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Deportes UCB - API Docs',
  }));
  console.log('Swagger disponible en http://localhost:3001/api/docs');
};
