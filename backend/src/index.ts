import 'dotenv/config';
import { appOlustur } from './app.js';
import { config } from './config.js';

const app = appOlustur();

app.listen(config.port, () => {
  console.log(`ERP API dinleniyor: http://localhost:${config.port}/api`);
  console.log(`Saglik kontrolu: http://localhost:${config.port}/api/health`);
});
