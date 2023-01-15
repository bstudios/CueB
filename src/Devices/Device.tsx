import { Text, Button } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { IconArrowLeft } from '@tabler/icons'
import React from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

export interface ProjectDevice {
	name: string
	location?: string
	ip: string
	version: string
	type: string
	sort: number
	disabled: boolean
}

export const Device = () => {
	const [projectDevices, setProjectDevices] = useLocalStorage<Array<ProjectDevice>>({
		key: 'project-devices',
		defaultValue: [],
	})
	const devicePath = useParams()
	const device = projectDevices.find(device => device.ip === devicePath.ip)
	if (projectDevices.length === 0) return <Text>Loading</Text>
	if (!device) return <Navigate to="/" />
	return (
		<>
			<Link to="/devices/">
				<Button color="gray" variant="outline" radius="lg" mb="lg" size="md" leftIcon={<IconArrowLeft />}>
					Devices
				</Button>
			</Link>
			<div>Device {device.name}</div>
			<p>
				You can change the IP here, but we need to change the path when you do that - or maybe easier to just
				boot you back to the devices page
			</p>
		</>
	)
}
