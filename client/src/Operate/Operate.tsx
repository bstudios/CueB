import { useState } from "react";
import { Button, Grid, Stack, Avatar, Card, Text, Alert, Loader } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconPlugConnectedX } from "@tabler/icons-react";
import { trpc } from "../trpc/TRPCProvider";
import { Device, DevicesList } from "../../../server/src/db/controllers/devices";
import classes from "./Operate.module.css";
import { Link } from "react-router-dom";

const DeviceChannelDisplay = (props: { device: Device, status: number | false, devicesInMasterChannel: number[], setDevicesInMasterChannel: React.Dispatch<React.SetStateAction<number[]>> }) => {
  const setState = trpc.devices.setState.useMutation();
  if (!props.device || props.device === undefined || props.device.id === undefined) return null;
  return (
    <Card>
      <Text fw={500} ta="center" mb="md">
        {props.device.name} {props.device.ip}
      </Text>
      {props.status === false ? (
        <Alert variant="transparent" title="Device Disconnected" icon={<IconPlugConnectedX />} mb="md">
          Outstation is not responding - check the network connection of this device, or change the IP address in <Link to={"/devices/" + props.device.id}>device settings</Link>.
        </Alert>
      ) : null}
      {props.status === 6 ? (
        <Alert color="red" title="Panic Mode" icon={<IconAlertTriangle />} mb="md">
          Outstation has been placed in panic mode by operator
          <Button mt={10} size="lg" color="yellow" fullWidth={true} onClick={() => props.device ? setState.mutate({ id: props.device.id, newState: 1 }) : null}>
            Reset
          </Button>
        </Alert>
      ) : null
      }
      {props.status === 7 ? (
        <Alert color="yellow" title="Identify Mode" icon={<IconAlertTriangle />} mb="md">
          Outstation lights are blinking
          <Button mt={10} size="lg" color="yellow" fullWidth={true} onClick={() => props.device ? setState.mutate({ id: props.device.id, newState: 1 }) : null}>
            Reset
          </Button>
        </Alert>
      ) : null
      }
      {
        props.status !== false && props.status !== 6 && props.status !== 7 ? (
          <Stack justify="flex-start" gap="lg">
          <Button
            size="xl"
              tt="uppercase"
            radius={0}
            fullWidth
            type="button"
              color="red"
            loaderProps={{ variant: "dots" }}
            loading={false}
              className={classes.flashButton}
              data-flash={props.status === 2 ? "true" : "false"}
              data-opacity={props.status !== 3 ? "true" : "false"}
              rightSection={
                props.status === 3 ? (
                  <Avatar variant="outline" radius="xl" color="white">
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
                newState = 1;
              }
              if (props.device) setState.mutate({ id: props.device.id, newState: newState })
            }}
          >
            Standby
          </Button>
          <Button
            rightSection={
                props.devicesInMasterChannel.includes(props.device.id) ? (
                <Avatar variant="filled" radius="xl" color="dark">
                  <IconCheck />
                </Avatar>
                ) : null
            }
            size="xl"
              tt="uppercase"
            radius={0}
            fullWidth
            type="button"
            color="orange"
              className={classes.flashButton}
              data-flash={"false"}
              data-opacity={props.devicesInMasterChannel.includes(props.device.id) ? "false" : "true"}
            onClick={() => {
              props.setDevicesInMasterChannel((prevState) => {
                if (props.device) {
                  if (prevState.includes(props.device.id)) {
                    return prevState.filter((id) => id !== props.device?.id);
                  }
                  return [...prevState, props.device?.id];
                } else return prevState;
              });
            }}
          >
            Preset
          </Button>
          <Button
              size="xl"
              tt="uppercase"
              radius={0}
              fullWidth
              type="button"
              color="green"
              loading={false}
              className={classes.flashButton}
              data-flash={"false"}
              data-opacity={props.status !== 5 ? "true" : "false"}
              loaderProps={{ variant: "dots" }}
              onClick={() => {
                let newState = 5
                if (props.status === 5) {
                  newState = 1;
                }
                if (props.device) setState.mutate({ id: props.device.id, newState: newState })
              }}
            >
            Go
          </Button>
        </Stack>
        ) : null
      }
    </Card>
  );
};

const MasterChannel = (props: { devicesInMasterChannel: number[], setDevicesInMasterChannel: React.Dispatch<React.SetStateAction<number[]>> }) => {
  const setState = trpc.devices.setState.useMutation();
  return (
    <Card>
      <Text fw={500} ta="center" mb="md">
        Master
      </Text>
      <Stack justify="flex-start" gap="lg">
        <Button
          size="xl"
          tt="uppercase"
          radius={0}
          fullWidth
          type="button"
          color="red"
          rightSection={
            props.devicesInMasterChannel.length > 0 ? (
              <Avatar variant="white" radius="xl" color="dark">
                {props.devicesInMasterChannel.length}
              </Avatar>
            ) : null
          }
          disabled={props.devicesInMasterChannel.length < 1}
          onClick={() => {
            props.devicesInMasterChannel.forEach((deviceId) => {
              setState.mutate({ id: deviceId, newState: 2 });
            });
          }}
        >
          Standby
        </Button>
        <Button
          size="xl"
          tt="uppercase"
          radius={0}
          fullWidth
          type="button"
          color="orange"
          disabled={props.devicesInMasterChannel.length < 1}
          onClick={() => {
            props.setDevicesInMasterChannel([]);
          }}
        >
          Clear
        </Button>
        <Button
          size="xl"
          tt="uppercase"
          radius={0}
          fullWidth
          type="button"
          color="green"
          rightSection={
            props.devicesInMasterChannel.length > 0 ? (
              <Avatar variant="white" radius="xl" color="dark">
                {props.devicesInMasterChannel.length}
              </Avatar>
            ) : null
          }
          disabled={props.devicesInMasterChannel.length < 1}
          onClick={() => {
            props.devicesInMasterChannel.forEach((deviceId) => {
              setState.mutate({ id: deviceId, newState: 5 });
            });
          }}
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
  const [devicesInMasterChannel, setDevicesInMasterChannel] = useState<Array<number>>([]);
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
  if (devices === false) return <Loader size="xl" type="dots" />;
  if (devices.length === 0)
    return <div>Setup your devices in the Devices tab</div>;
  return (
    <Grid justify="center" columns={12} gutter="sm">
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
        <MasterChannel devicesInMasterChannel={devicesInMasterChannel} setDevicesInMasterChannel={setDevicesInMasterChannel} />
      </Grid.Col>
      {devices
        .filter((device) => device.hidden === false)
      //.sort((a, b) => a.channel - b.channel)
        .map((device, i) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={i}>
            <DeviceChannelDisplay device={device} status={deviceStatus[device.id]} devicesInMasterChannel={devicesInMasterChannel} setDevicesInMasterChannel={setDevicesInMasterChannel} />
          </Grid.Col>
        ))}
    </Grid>
  );
};
