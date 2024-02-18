import { Button, Title, Grid } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useState } from 'react'
import { ProjectDevice } from './Device'
import { DeviceCard } from './Components/DeviceCard'
import { DiscoveredDeviceCard } from './Scan/DiscoveredDeviceCard'
import { DiscoveredDevice, scanForDevices } from './Scan/Scan'
import { ScanModal } from './Scan/ScanModal'

const getHighestDeviceNumber = (devices: Array<ProjectDevice>, searchString: string) => {
	const deviceNumbers = devices.map(device => {
		if (device.name.startsWith(searchString)) {
			const deviceNumber = device.name.match(/\d+$/)
			if (deviceNumber) return parseInt(deviceNumber[0])
			return 0
		} else {
			return 0
		}
	})
	return Math.max(...deviceNumbers)
}

export const Devices = () => {
	const [discoveredDevices, setDiscoveredDevices] = useState<Array<DiscoveredDevice>>([])
	const [projectDevices, setProjectDevices] = useLocalStorage<Array<ProjectDevice>>({
		key: 'project-devices',
		defaultValue: [],
	})
	const [scanModalShow, setScanModalShow] = useState(false)
	const [scanningForDevices, setScanningForDevices] = useState(false)
	return (
		<>
			<Title order={1}>Project Devices</Title>
			<Grid columns={12} my={'lg'}>
				{projectDevices
					.sort((a, b) => a.sort - b.sort)
					.map((device, i) => (
						<Grid.Col xs={12} sm={6} md={4} lg={3} xl={2} key={i}>
							<DeviceCard {...device} />
						</Grid.Col>
					))}
			</Grid>
			<Title order={1}>Discovered Devices</Title>
			<Grid columns={12} my={'lg'}>
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
			</Grid>
			<Button
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
			/>
		</>
	)
}
