import { Text, Button } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'

import { Link, Navigate, useParams } from 'react-router-dom'
import { trpc } from '../trpc/TRPCProvider';
import { useState } from 'react';
import { DevicesList } from '../../../server/src/db/controllers/devices';

export const Device = () => {
	const [devices, setDevices] = useState<DevicesList | false>(false);
	const params = useParams()

	trpc.devices.sub.useSubscription(undefined, {
		onStarted() {
			console.log("[Devices subscription] Connected");
		},
		onData(data) {
			setDevices(data.devices);
		},
		onError(err) {
			console.error('[Devices Subscription]', err);
		}
	});
	if (!devices) return <Text>Loading...</Text>

	if (!params.deviceId || params.deviceId === undefined) return <Navigate to="/devices" />
	const device = devices.find(device => device.id === Number(params.deviceId))
	if (!device) return <Navigate to="/devices" />
	return (
		<>
			<Link to="/devices/">
				<Button color="gray" variant="outline" radius="lg" mb="lg" size="md" leftSection={<IconArrowLeft />}>
					Devices
				</Button>
			</Link>
			<div>Device {device.name}</div>
		</>
	)
}
