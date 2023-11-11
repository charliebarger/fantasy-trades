const info = (message: string) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(message);
  }
};

const error = (message: string) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(message);
  }
};

export default {
  info,
  error,
};
