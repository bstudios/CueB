import { useState, useEffect } from 'react'
import { Button, Grid, Stack, Avatar, Card, Text } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { ProjectDevice } from '../Devices/Device'
import {
	PossibleDeviceStates,
	useDeviceStatus,
	useDeviceStatusDispatch,
} from '../contexts/DeviceStatusReducer'
import { IconCheck } from '@tabler/icons-react'
import axios from 'axios'
import { trpc } from '../trpc/trpc'

const DURATION_TO_HOLD_GO = 2000

const communicateStatusToDevice = (device: ProjectDevice, state: PossibleDeviceStates) => {
	if (device.emulated) {
		return new Promise(resolve => {
			// Emulate the delay of a network connection
			setTimeout(() => {
				resolve(true)
			}, 100)
		})
	} else {
		return axios
			.get(`http://${device.ip}/set/`, { responseType: 'json' })
			.then(response => {
				return true
			})
			.catch(error => {
				return false
			})
	}
}

const secondsToTime = (milliseconds: number) => {
	const secs = milliseconds / 1000
	console.log(milliseconds)
	const hours = Math.floor(secs / (60 * 60))
	const minutes = Math.floor((secs % (60 * 60)) / 60) - hours * 60
	const seconds = Math.floor(secs % 60) - hours * 60 * 60 - minutes * 60
	if (hours === 0 && minutes === 0) return seconds + 's'
	if (hours === 0) return minutes + 'm' + seconds + 's'
	else return hours + 'h' + minutes + 'm'
}

const Channel = (props: { device: ProjectDevice }) => {
	const [time, setTime] = useState(Date.now())
	useEffect(() => {
		const interval = setInterval(() => setTime(Date.now()), 1000)
		return () => {
			clearInterval(interval)
		}
	}, [])


	const devices = useDeviceStatus()
	const deviceStatus = devices[props.device.ip]
	const setDeviceStatus = useDeviceStatusDispatch()
	useEffect(() => {
		if (!deviceStatus) {
			setDeviceStatus({ type: 'ADD_DEVICE', id: props.device.ip })
		}
	}, [deviceStatus, setDeviceStatus, props.device.ip])

	if (!deviceStatus) return null
	return (
		<Card>
			<Text weight={500} ta="center" mb="md">
				{props.device.name}
			</Text>
			{deviceStatus.connected ? (
				<Stack justify="flex-start" spacing="lg">
					<Button
						size="xl"
						uppercase
						radius={0}
						fullWidth
						type="button"
						color="red"
						loaderPosition="left"
						loaderProps={{ variant: 'dots' }}
						loading={deviceStatus.loading}
						styles={theme =>
							deviceStatus.state === 'await-standby'
								? {
										root: {
											animation:
												keyframes({
													'0%, 49%': {
														opacity: 1,
													},
													'50%, 100%': {
														opacity: 0.2,
													},
												}) + ' 1s infinite',
										},
								  }
								: deviceStatus.state !== 'acknowledged-standby'
								? { root: { opacity: 0.5 } }
								: {}
						}
						rightIcon={
							deviceStatus.state === 'await-standby' ? (
								<Avatar variant="filled" radius="xl" color="orange">
									{secondsToTime(time - deviceStatus.stateLastChanged)}
								</Avatar>
							) : deviceStatus.state === 'acknowledged-standby' ? (
								<Avatar variant="filled" radius="xl" color="green">
									<IconCheck />
								</Avatar>
							) : null
						}
						onClick={() => {
							let newState: PossibleDeviceStates = 'await-standby'
							if (
								deviceStatus.state === 'await-standby' ||
								deviceStatus.state === 'acknowledged-standby'
							) {
								newState = 'blank'
							}
							setDeviceStatus({ type: 'SET_DEVICE_LOADING', id: props.device.ip, newLoading: true })
							communicateStatusToDevice(props.device, newState).then(success => {
								setDeviceStatus({ type: 'SET_DEVICE_LOADING', id: props.device.ip, newLoading: false })
								if (success) {
									setDeviceStatus({ type: 'SET_DEVICE_STATE', id: props.device.ip, newState })
								} else {
									setDeviceStatus({
										type: 'SET_DEVICE_CONNECTED',
										id: props.device.ip,
										newConnected: false,
									})
								}
							})
						}}
					>
						Standby
					</Button>
					<Button
						rightIcon={
							deviceStatus.preset === null ? null : (
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
						styles={theme => (deviceStatus.preset === null ? { root: { opacity: 0.6 } } : {})}
						onClick={() => {
							setDeviceStatus({
								type: 'SET_DEVICE_PRESET',
								id: props.device.ip,
								newPreset: deviceStatus.preset === null ? 1 : null,
							})
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
						loading={deviceStatus.loading}
						styles={theme => (deviceStatus.state !== 'go' ? { root: { opacity: 0.6 } } : {})}
						loaderPosition="left"
						loaderProps={{ variant: 'dots' }}
						onClick={() => {
							let newState: PossibleDeviceStates = 'go'
							if (deviceStatus.state === 'go') {
								newState = 'blank'
							}
							setDeviceStatus({ type: 'SET_DEVICE_LOADING', id: props.device.ip, newLoading: true })
							communicateStatusToDevice(props.device, newState).then(success => {
								setDeviceStatus({ type: 'SET_DEVICE_LOADING', id: props.device.ip, newLoading: false })
								if (success) {
									setDeviceStatus({ type: 'SET_DEVICE_STATE', id: props.device.ip, newState })
									// TODO - tidy up this logic
									if (newState === 'go') {
										new Promise(resolve => {
											// Wait until clearing the go state and reverting to blank
											setTimeout(() => {
												resolve(true)
											}, DURATION_TO_HOLD_GO)
										}).then(() => {
											// Recheck the state after a delay to ensure it hasn't changed
											if (deviceStatus.state === 'go') {
												setDeviceStatus({
													type: 'SET_DEVICE_LOADING',
													id: props.device.ip,
													newLoading: true,
												})
												communicateStatusToDevice(props.device, newState).then(success => {
													setDeviceStatus({
														type: 'SET_DEVICE_LOADING',
														id: props.device.ip,
														newLoading: false,
													})
													if (success) {
														setDeviceStatus({
															type: 'SET_DEVICE_STATE',
															id: props.device.ip,
															newState: 'blank',
														})
													} else {
														setDeviceStatus({
															type: 'SET_DEVICE_CONNECTED',
															id: props.device.ip,
															newConnected: false,
														})
													}
												})
											}
										})
									}
								} else {
									setDeviceStatus({
										type: 'SET_DEVICE_CONNECTED',
										id: props.device.ip,
										newConnected: false,
									})
								}
							})
						}}
					>
						Go
					</Button>
				</Stack>
			) : (
				'Disconnected'
			)}
		</Card>
	)
}

const MasterChannel = () => {
	const devices = useDeviceStatus()
	const setDeviceStatus = useDeviceStatusDispatch()
	const devicesInPreset1: Array<string> = []
	Object.keys(devices).forEach(device => {
		if (devices[device].preset === 1 && devices[device].connected) {
			devicesInPreset1.push(device)
		}
	})
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
					rightIcon={devicesInPreset1.length > 0 ? 'x' + devicesInPreset1.length : null}
					disabled={devicesInPreset1.length < 1}
					onClick={() => {
						devicesInPreset1.forEach(device => {
							setDeviceStatus({
								type: 'SET_DEVICE_STATE',
								id: device,
								newState: 'await-standby',
							})
						})
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
							type: 'CLEAR_PRESET',
						})
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
					rightIcon={devicesInPreset1.length > 0 ? 'x' + devicesInPreset1.length : null}
					disabled={devicesInPreset1.length < 1}
				>
					Go
				</Button>
			</Stack>
		</Card>
	)
}

export const Operate = () => {
	const [projectDevices] = useLocalStorage<Array<ProjectDevice>>({
		key: 'project-devices',
		defaultValue: [],
	})
	const userList = trpc.userList.useQuery();

	if (projectDevices.length === 0) return (
		<div>Setup your devices in the Devices tab {userList.data ? userList.data.map(value => value.name) : null}</div>
	)
	return (
		<Grid justify="center" columns={12} gutter="sm">
			<Grid.Col xs={12} sm={6} md={4} lg={3} xl={2}>
				<MasterChannel />
			</Grid.Col>
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
