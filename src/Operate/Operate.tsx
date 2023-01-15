import React from 'react'
import { Button, Grid, Stack, Avatar, Card, Text } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { ProjectDevice } from '../Devices/Device'

const Channel = (props: { device: ProjectDevice }) => {
	return (
		<Card>
			<Text weight={500} ta="center" mb="md">
				{props.device.name}
			</Text>
			<Stack justify="flex-start" spacing="lg">
				<Button
					leftIcon={
						<Avatar variant="filled" radius="xl" color="dark">
							1
						</Avatar>
					}
					size="xl"
					uppercase
					radius={0}
					fullWidth
					type="button"
					color="red"
					loaderPosition="center"
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
					loading
					loaderPosition="center"
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
					loading
					loaderPosition="center"
				>
					Go
				</Button>
			</Stack>
		</Card>
	)
}

export const Operate = () => {
	const [projectDevices, setProjectDevices] = useLocalStorage<Array<ProjectDevice>>({
		key: 'project-devices',
		defaultValue: [],
	})
	return (
		<Grid justify="center" columns={12} gutter="sm">
			{projectDevices
				.filter(device => device.disabled === false)
				.sort((a, b) => a.sort - b.sort)
				.map((device, i) => (
					<Grid.Col xs={12} sm={6} md={4} lg={3} xl={2} key={i}>
						<Channel device={device} />
					</Grid.Col>
				))}
		</Grid>
	)
}
