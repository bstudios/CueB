/**import { Text, Card, Button, Badge } from '@mantine/core'
import { showNotification } from '@mantine/notifications'

import { identifyDevice } from './IdentifyDevice'
import { DiscoveredDevice } from './Scan'

export const DiscoveredDeviceCard = (props: {
	device: DiscoveredDevice
	addDeviceToProject: (device: DiscoveredDevice) => void
}) => (
	<Card shadow="sm" p="lg" radius="md" withBorder>
		<Text weight={500}>{props.device.ip}</Text>
		<Badge variant="light">v{props.device.version}</Badge>
		<Button
			variant="light"
			fullWidth
			mt="md"
			radius="md"
			onClick={() =>
				identifyDevice(props.device.ip).then(result => {
					if (result) {
						showNotification({
							message: 'Blinking lights on ' + props.device.ip,
							withCloseButton: false,
							autoClose: 5000,
						})
					} else {
						showNotification({
							message: 'Could not connect to ' + props.device.ip + '. Is it still connected?',
						})
					}
				})
			}
		>
			Identify
		</Button>
		<Button variant="light" fullWidth mt="md" radius="md" onClick={() => props.addDeviceToProject(props.device)}>
			Add to Project
		</Button>
	</Card>
)
*/