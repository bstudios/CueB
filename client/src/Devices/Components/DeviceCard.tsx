import { Text, Card, Button, Badge, Menu } from "@mantine/core";
import {
  IconTrash,
  IconBulb,
  IconPencil,
  IconRefresh,
} from "@tabler/icons-react";

import { useNavigate } from "react-router-dom";
import { Device } from "../../../../server/src/db/controllers/devices";
import { trpc } from "../../trpc/TRPCProvider";
import { notifications } from "@mantine/notifications";

const DeviceBlinkButton = (props: { device: Device }) => {
  const setState = trpc.devices.setState.useMutation();
  return (
    <Menu.Item
      leftSection={<IconBulb />}
      onClick={() => {
        notifications.show({
          title: "Identify",
          message: "Blinking lights on " + props.device?.name,
          autoClose: 5000,
          withCloseButton: false,
          loading: true,
        });
        if (props.device)
          setState.mutate({
            id: props.device.id,
            newState: 7,
          });
      }}
    >
      Identify
    </Menu.Item>
  );
};

const SyncDeviceButton = (props: { device: Device }) => {
  const syncMutation = trpc.devices.requestSync.useMutation({
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
        autoClose: 5000,
      });
    },
  });
  return (
    <Menu.Item
      leftSection={<IconRefresh />}
      onClick={() => {
        notifications.show({
          title: "Fetching configuration",
          message: "Syncing " + props.device?.name,
          autoClose: 5000,
          withCloseButton: false,
          loading: true,
        });
        if (props.device)
          syncMutation.mutate({
            id: props.device.id,
          });
      }}
    >
      Sync Device
    </Menu.Item>
  );
};

export const DeviceCard = (props: { device: Device }) => {
  const navigate = useNavigate();
  const deleteDevice = trpc.devices.delete.useMutation();
  if (!props.device) return <Text>Loading</Text>;
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text>{props.device.name ?? ""}</Text>
      <Text>{props.device.location}</Text>
      <Badge variant="outline">IP: {props.device?.ip}</Badge>
      <Badge variant="light">Version ??</Badge>
      <Menu withinPortal>
        <Menu.Target>
          <Button variant="light" fullWidth mt="md" radius="md">
            Menu
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Device</Menu.Label>
          <Menu.Item
            disabled={true}
            leftSection={<IconPencil />}
            onClick={() => navigate("/devices/" + props.device?.id)}
          >
            Settings
          </Menu.Item>
          <DeviceBlinkButton device={props.device} />
          <SyncDeviceButton device={props.device} />
          <Menu.Item
            color={"red"}
            leftSection={<IconTrash />}
            onClick={() => {
              if (props.device) deleteDevice.mutate({ id: props.device.id });
            }}
          >
            Remove from Project
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Card>
  );
};
