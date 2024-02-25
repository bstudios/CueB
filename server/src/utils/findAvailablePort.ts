import portfinder from "portfinder";
/**
 * Get an available port to use for the web server on the local machine to serve requests to paradise.
 * @returns - a port to use for the web server that's available
 */
export const getAvailablePort = (desiredPort: number): Promise<number> => {
  return portfinder
    .getPortPromise({
      port: desiredPort,
      stopPort: 65535,
    })
    .then((port) => {
      return port;
    })
    .catch((err) => {
      throw err;
    });
};
