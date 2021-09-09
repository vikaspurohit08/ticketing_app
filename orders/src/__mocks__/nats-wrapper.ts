export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ), // so that we can add tests
    // since now jest will keep track of this function
  }, //fake client
};
