import type { NextApiRequest, NextApiResponse } from 'next';
import { openApiSpec } from '@/lib/openapi';

/**
 * API Route: /api/docs
 *
 * GET - Retorna la documentación de la API
 *
 * - Con Accept: application/json → retorna el spec OpenAPI en JSON
 * - Con cualquier otro Accept → retorna Swagger UI HTML
 */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `El método ${req.method} no está permitido`,
    });
  }

  const accept = req.headers.accept || '';

  // Si piden JSON, devolver el spec
  if (accept.includes('application/json')) {
    return res.status(200).json(openApiSpec);
  }

  // Si no, devolver Swagger UI
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Docs - Sistema de Gestión</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
  `.trim();

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
