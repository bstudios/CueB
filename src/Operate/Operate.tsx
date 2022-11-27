import React from 'react'
import { Button, Grid, Stack, Avatar } from '@mantine/core'

const Channel = (props: { channel?: number; value?: number; onChange?: (channel: number, value: number) => void }) => {
	return (
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
	)
}

export const Operate = () => {
	return (
		<Grid justify="center" columns={3} gutter="sm">
			<Grid.Col span={1}>
				<Channel />
			</Grid.Col>
			<Grid.Col span={1}>
				<Channel />
			</Grid.Col>
			<Grid.Col span={1}>
				<Channel />
			</Grid.Col>
			<Grid.Col span={1}>
				<Channel />
			</Grid.Col>
		</Grid>
	)
}
