import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

const PORT = process.env.PORT;

export { PORT };
