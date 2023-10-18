import logger from './utils/logger';
import { PORT } from './utils/config';
import { app } from './app';

app.listen(PORT, () => {
  logger.info(`Server running on port  
    http://localhost:${PORT}`);
});
