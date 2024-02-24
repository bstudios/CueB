import { Text, Card, Button, Badge, Menu } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconTrash, IconBulb, IconPencil } from '@tabler/icons-react'

import { useNavigate } from 'react-router-dom'
import { Device } from '../../../../server/src/db/controllers/devices'
import { trpc } from '../../trpc/TRPCProvider'

export const DeviceCard = (props: { device: Device }) => {
	const navigate = useNavigate()
	const deleteDevice = trpc.devices.delete.useMutation();

	if (!props.device) return <Text>Loading</Text>
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
					<Menu.Item leftSection={<IconPencil />} onClick={() => navigate(props.device.id)}>
						Settings
					</Menu.Item>
					<Menu.Item
						leftSection={<IconBulb />}
						onClick={() =>
							identifyDevice(props.ip).then(result => {
								if (result) {
									showNotification({
										message: 'Blinking lights on ' + props.ip,
										withCloseButton: false,
										autoClose: 5000,
									})
								} else {
									showNotification({
										message: 'Could not connect to ' + props.ip + '. Is it still connected?',
									})
								}
							})
						}
					>
						Identify
					</Menu.Item>
					<Menu.Item
						color={'red'}
						leftSection={<IconTrash />}
						onClick={() => {
							deleteDevice.mutate({ id: props.device.id })
						}}
					>
						Remove from Project
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Card>
	)
}
