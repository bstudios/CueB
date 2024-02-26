import {
  Button,
  Title,
  Grid,
  Modal,
  TextInput,
  Group,
  NumberInput,
  Loader,
} from "@mantine/core";
import { useState } from "react";
import { DeviceCard } from "./Components/DeviceCard";
import { trpc } from "../trpc/TRPCProvider";
import { DevicesList } from "../../../server/src/db/controllers/devices";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

export const ManualAddDeviceModal = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const createDevice = trpc.devices.create.useMutation({
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
        autoClose: 5000,
      });
    },
  });
  const form = useForm({
    initialValues: {
      ip: "",
      recievePort: 53001,
    },
    validate: {
      ip: (value) => {
        if (!value) return "IP Address is required";
        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value))
          return "Invalid IP Address";
        else return null;
      },
    },
  });
  return (
    <>
      <Modal opened={opened} onClose={close} title="Add new Device" centered>
        <form
          onSubmit={form.onSubmit((values) => {
            createDevice.mutate({
              ip: values.ip,
              name: "Device",
              port: values.recievePort,
            });
            close();
          })}
        >
          <TextInput
            label="IP Address"
            description="Enter the IP Address of the Device to Add"
            placeholder=""
            {...form.getInputProps("ip")}
          />
          <NumberInput
            label="Recieve Port"
            description="Enter the Port the device receives OSC on"
            min={1024}
            max={65535}
            {...form.getInputProps("recievePort")}
          />
          <Group justify="flex-end" mt="lg">
            <Button type="submit" variant="outline">
              Add Device
            </Button>
          </Group>
        </form>
      </Modal>
      <Button onClick={open}>Add Device</Button>
    </>
  );
};

export const Devices = () => {
  const [devices, setDevices] = useState<DevicesList | false>(false);
  const scanForDevices = trpc.devices.scanForDevices.useMutation();
  const findDevices = () => scanForDevices.mutate();
  console.log(scanForDevices.data);

  trpc.devices.sub.useSubscription(undefined, {
    onStarted() {
      console.log("[Devices subscription] Connected");
    },
    onData(data) {
      setDevices(data.devices);
    },
    onError(err) {
      console.error("[Devices Subscription]", err);
    },
  });
  if (!devices) return <Loader size="xl" type="dots" />;
  return (
    <>
      <Title order={1}>Project Devices</Title>
      <Grid columns={12} my={"lg"}>
        {devices &&
          devices
            //.sort((a, b) => a.channel - b.channel)
            .map((device, i) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={i}>
                <DeviceCard device={device} />
              </Grid.Col>
            ))}
      </Grid>
      <Title order={1}>Discovered Devices</Title>
      {/*<Grid columns={12} my={'lg'}>
				{discoveredDevices.map((device, i) => (
					<Grid.Col xs={12} sm={6} md={4} lg={3} xl={2} key={i}>
						<DiscoveredDeviceCard
							device={device}
							addDeviceToProject={device => {
								setProjectDevices([
									...projectDevices,
									{
										ip: device.ip,
										version: device.version,
										type: device.type,
										name: 'Device ' + (getHighestDeviceNumber(projectDevices, 'Device ') + 1),
										disabled: false,
										emulated: false,
										sort: projectDevices.length,
										config: {
											autoAcknowledgeStandby: false,
										},
									},
								])
								setDiscoveredDevices(
									discoveredDevices.filter(discoveredDevice => discoveredDevice.ip !== device.ip)
								)
							}}
						/>
					</Grid.Col>
				))}
						</Grid>*/}
      {/*<Button
				onClick={() =>
					setProjectDevices([
						...projectDevices,
						{
							ip: 'emulator.' + (getHighestDeviceNumber(projectDevices, 'Emulator ') + 1),
							version: 'emulator',
							type: 'emulator',
							name: 'Emulator ' + (getHighestDeviceNumber(projectDevices, 'Emulator ') + 1),
							disabled: false,
							emulated: true,
							sort: projectDevices.length,
							config: {
								autoAcknowledgeStandby: true,
							},
						},
					])
				}
			>
				Add demo device
			</Button>
			<Button loading={scanningForDevices} onClick={() => setScanModalShow(true)}>
				Scan Network
			</Button>
			<ScanModal
				show={scanModalShow}
				onModalClose={() => setScanModalShow(false)}
				scanForDevices={(ip, subnetMask) => {
					setScanningForDevices(true)
					setDiscoveredDevices([])
					scanForDevices(ip, subnetMask).then(devices => {
						devices.map(device => {
							if (!projectDevices.find(projectDevice => projectDevice.ip === device.ip)) return device
						})
						setDiscoveredDevices(devices)
						setScanningForDevices(false)
					})
				}}
			/>*/}
      <Button loading={scanForDevices.isPending} onClick={findDevices}>
        Scan Network
      </Button>
      {scanForDevices.data && scanForDevices.data.length === 0 ? (
        <p>No devices found</p>
      ) : null}
      {scanForDevices.data && scanForDevices.data.length > 0 ? (
        <ul>
          {scanForDevices.data.map((device, i) => (
            <li key={i}>{device}</li>
          ))}
        </ul>
      ) : null}
      <ManualAddDeviceModal />
    </>
  );
};
