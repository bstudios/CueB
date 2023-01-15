import { Button, Modal, Title, Grid } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import React, { useState } from 'react'
import { ProjectDevice } from './Device'
import { DeviceCard } from './Components/DeviceCard'
import { DiscoveredDeviceCard } from './Scan/DiscoveredDeviceCard'
import { DiscoveredDevice, scanForDevices } from './Scan/Scan'
import { ScanModal } from './Scan/ScanModal'

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
				{projectDevices.map((device, i) => (
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
										name: device.ip,
										disabled: false,
										sort: projectDevices.length,
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
