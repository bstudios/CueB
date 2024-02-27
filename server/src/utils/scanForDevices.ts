import ip from "ip";
import { Netmask } from "netmask";

export const scanForDevices = () => {
  const thisIp = ip.address();
  if (!thisIp || thisIp === null)
    throw new Error("Unable to get the local IP address");
  const ips: string[] = [];
  const block = new Netmask(thisIp, "255.255.255.0");
  block.forEach((ip: string) => ips.push(ip));

  //TODO hunt through existing devices to double check no clashes first

  console.log("Scanning for devices on the network");
  return Promise.allSettled(
    ips.map((ip) => {
      if (ip === thisIp) return Promise.resolve({ ip, cueb: false });
      else {
        return fetch(`http://${ip}/areyouacuebdevice`, {
          signal: AbortSignal.timeout(3000),
        })
          .then((res) => {
            return res.text();
          })
          .then((text) => {
            if (text === "cueb-outstation") {
              return { ip, cueb: true };
            } else return { ip, cueb: false };
          })
          .catch((err) => {
            if (err.name === "TimeoutError") {
              return { ip, cueb: false };
            } else if (err.name === "AbortError") {
              return { ip, cueb: false };
            } else if (err.name === "TypeError") {
              throw new Error("AbortSignal.timeout() method is not supported");
            } else {
              console.error(
                `Error whilst scanning for devices - type: ${err.name}, message: ${err.message}`
              );
              return { ip, cueb: false };
            }
          });
      }
    })
  ).then((results) => {
    const returnIPs: string[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.cueb) {
        returnIPs.push(result.value.ip);
      }
    });
    return returnIPs;
  });
};
