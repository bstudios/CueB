import { Text, Card, Button, Badge, Menu } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import { IconTrash, IconBulb, IconPencil } from '@tabler/icons'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectDevice } from '../Device'
import { identifyDevice } from '../Scan/IdentifyDevice'

export const DeviceCard = (props: ProjectDevice) => {
	const [projectDevices, setProjectDevices] = useLocalStorage<Array<ProjectDevice>>({
		key: 'project-devices',
		defaultValue: [],
	})
	const navigate = useNavigate()
	return (
		<Card shadow="sm" p="lg" radius="md" withBorder>
			<Text weight={500}>{props.name}</Text>
			<Text>{props.location}</Text>
			{!props.emulated ? <Badge variant="outline">IP: {props.ip}</Badge> : null}
			{!props.emulated ? <Badge variant="light">Version {props.version}</Badge> : null}
			<Menu withinPortal>
				<Menu.Target>
					<Button variant="light" fullWidth mt="md" radius="md">
						Menu
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>Device</Menu.Label>
					<Menu.Item icon={<IconPencil />} onClick={() => navigate(props.ip)}>
						Settings
					</Menu.Item>
					<Menu.Item
						icon={<IconBulb />}
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
						icon={<IconTrash />}
						onClick={() => {
							setProjectDevices(projectDevices.filter(device => device.ip !== props.ip))
						}}
					>
						Remove from Project
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Card>
	)
}
