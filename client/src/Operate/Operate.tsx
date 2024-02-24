import { useState, useEffect } from "react";
import { Button, Grid, Stack, Avatar, Card, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { trpc } from "../trpc/TRPCProvider";
import { Device, DevicesList } from "../../../server/src/db/controllers/devices";

const DURATION_TO_HOLD_GO = 2000;

const secondsToTime = (milliseconds: number) => {
  const secs = milliseconds / 1000;
  console.log(milliseconds);
  const hours = Math.floor(secs / (60 * 60));
  const minutes = Math.floor((secs % (60 * 60)) / 60) - hours * 60;
  const seconds = Math.floor(secs % 60) - hours * 60 * 60 - minutes * 60;
  if (hours === 0 && minutes === 0) return seconds + "s";
  if (hours === 0) return minutes + "m" + seconds + "s";
  else return hours + "h" + minutes + "m";
};

const DeviceChannelDisplay = (props: { device: Device, status: number | false }) => {
  const setState = trpc.devices.setState.useMutation();
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!props.device) return null;
  return (
    <Card>
      <Text weight={500} ta="center" mb="md">
        {props.device.name} {props.device.ip}
      </Text>
      {props.status !== false ? (
        <Stack justify="flex-start" spacing="lg">
          <Button
            size="xl"
            uppercase
            radius={0}
            fullWidth
            type="button"
            color="red"
            loaderPosition="left"
            loaderProps={{ variant: "dots" }}
            loading={false}
            styles={(theme) =>
              props.status === 2
                ? {
                    root: {
                      animation:
                        keyframes({
                          "0%, 49%": {
                            opacity: 1,
                          },
                          "50%, 100%": {
                            opacity: 0.2,
                          },
                        }) + " 1s infinite",
                    },
                  }
                : props.status !== 3
                ? { root: { opacity: 0.5 } }
                : {}
            }
            rightIcon={
              props.status === 2 ? (
                <Avatar variant="filled" radius="xl" color="orange">
                  {secondsToTime(100)}
                </Avatar>
              ) : props.status === 3 ? (
                <Avatar variant="filled" radius="xl" color="green">
                  <IconCheck />
                </Avatar>
              ) : null
            }
            onClick={() => {
              let newState = 2;
              if (
                props.status === 2 ||
                props.status === 3
              ) {
                newState = 3;
              }
              setState.mutate({ id: props.device.id, newState: newState })
            }}
          >
            Standby
          </Button>
          <Button
            rightSection={
              false ? null : (
                <Avatar variant="filled" radius="xl" color="dark">
                  <IconCheck />
                </Avatar>
              )
            }
            size="xl"
            uppercase
            radius={0}
            fullWidth
            type="button"
            color="orange"
            loaderPosition="left"
            styles={(theme) =>
              false ? { root: { opacity: 0.6 } } : {}
            }
            onClick={() => {
              console.log("CLicked")
            }}
          >
            Preset
          </Button>
          <Button
            size="xl"
            uppercase
            radius={0}
            fullWidth
            type="button"
            color="green"
            loading={false}
            styles={(theme) =>
              props.status !== 4 ? { root: { opacity: 0.6 } } : {}
            }
            loaderPosition="left"
            loaderProps={{ variant: "dots" }}
            onClick={() => {
              let newState = 4
              if (props.status === 4) {
                newState = 1;
              }
              setState.mutate({ id: props.device.id, newState: newState })
            }}
          >
            Go
          </Button>
        </Stack>
      ) : (
        "Disconnected"
      )}
    </Card>
  );
};

const MasterChannel = () => {
  const devicesInPreset1: Array<string> = [];
  return (
    <Card>
      <Text weight={500} ta="center" mb="md">
        Master
      </Text>
      <Stack justify="flex-start" spacing="lg">
        <Button
          size="xl"
          uppercase
          radius={0}
          fullWidth
          type="button"
          color="red"
          rightIcon={
            devicesInPreset1.length > 0 ? "x" + devicesInPreset1.length : null
          }
          disabled={devicesInPreset1.length < 1}
          onClick={() => {
            devicesInPreset1.forEach((device) => {
              setDeviceStatus({
                type: "SET_DEVICE_STATE",
                id: device,
                newState: "await-standby",
              });
            });
          }}
        >
          Standby
        </Button>
        <Button
          size="xl"
          uppercase
          radius={0}
          fullWidth
          type="button"
          color="orange"
          disabled={devicesInPreset1.length < 1}
          onClick={() => {
            setDeviceStatus({
              type: "CLEAR_PRESET",
            });
          }}
        >
          Clear
        </Button>
        <Button
          size="xl"
          uppercase
          radius={0}
          fullWidth
          type="button"
          color="green"
          rightIcon={
            devicesInPreset1.length > 0 ? "x" + devicesInPreset1.length : null
          }
          disabled={devicesInPreset1.length < 1}
        >
          Go
        </Button>
      </Stack>
    </Card>
  );
};

export const Operate = () => {
  const [devices, setDevices] = useState<DevicesList | false>(false);
  const [deviceStatus, setDeviceStatus] = useState<{ [deviceId: number]: number | false }>({});
  trpc.devices.sub.useSubscription(undefined, {
    onStarted() {
      console.log("[Devices subscription] Connected");
    },
    onData(data) {
      setDevices(data.devices);
    },
    onError(err) {
      console.error('[Devices Subscription]', err);
    }
  });
  trpc.devices.subStatus.useSubscription(undefined, {
    onStarted() {
      console.log("[Devices status subscription] Connected");
    },
    onData(data) {
      setDeviceStatus(data);
    },
    onError(err) {
      console.error('[Devices status Subscription]', err);
    }
  });
  //trpc.devices.get.useQuery(); // Trigger the query to get the devices

  if (devices === false) return <div>Loading...</div>;
  if (devices.length === 0)
    return <div>Setup your devices in the Devices tab</div>;
  return (
    <Grid justify="center" columns={12} gutter="sm">
      <Grid.Col xs={12} sm={6} md={4} lg={3} xl={2}>
        <MasterChannel />
      </Grid.Col>
      {devices
        .filter((device) => device.hidden === false)
      //.sort((a, b) => a.channel - b.channel)
        .map((device, i) => (
          <Grid.Col xs={12} sm={6} md={4} lg={3} xl={2} key={i}>
            <DeviceChannelDisplay device={device} status={deviceStatus[device.id]} />
          </Grid.Col>
        ))}
    </Grid>
  );
};
