import { useLocalStorage } from '@mantine/hooks'
import axios from 'axios'
import React, { ReactNode, useEffect, useState } from 'react'
import { ProjectDevice } from '../Devices/Device'
import { useDeviceStatus, useDeviceStatusDispatch } from './DeviceStatusReducer'

export const DeviceConnectedManager = ({ children }: { children?: ReactNode }) => {
	const [projectDevices, setProjectDevices] = useLocalStorage<Array<ProjectDevice>>({
		key: 'project-devices',
		defaultValue: [],
	})
	const [lastCheckedDevice, setLastCheckedDevice] = useState<{ [id: string]: number }>({})
	const setDeviceStatus = useDeviceStatusDispatch()
	const deviceStatus = useDeviceStatus()
	useEffect(() => {
		const checkStatusInterval = setInterval(() => {
			console.log('Dispatching checks')
			projectDevices.forEach(device => {
				if (device.emulated === false) {
					axios
						.get(`http://${device.ip}/set/`, { responseType: 'json' })
						.catch(() => {
							return false
						})
						.then(success => {
							if (success) {
								setLastCheckedDevice({
									...lastCheckedDevice,
									[device.ip]: Date.now(), //TODO change this to a value given to you by the device, which enables you to check if buttons have been pressed by asking when you last checked.
								})
								setDeviceStatus({
									type: 'SET_DEVICE_CONNECTED',
									id: device.ip,
									newConnected: false,
								})
							} else {
								setDeviceStatus({
									type: 'SET_DEVICE_CONNECTED',
									id: device.ip,
									newConnected: true,
								})
							}
						})
				} else {
					// Device is emulated, so simulate some of the behaviour
					setDeviceStatus({
						type: 'SET_DEVICE_CONNECTED',
						id: device.ip,
						newConnected: Math.random() > 0.01, // TODO remove. Simulate some of the emulators dropping offline randomly
					})
					if (deviceStatus[device.ip]?.state === 'await-standby') {
						// The device is awaiting standby, so simulate it acknowledging standby
						/* 
						setTimeout(() => {
							if (deviceStatus[device.ip]?.state === 'await-standby') {
								setDeviceStatus({
									type: 'SET_DEVICE_STATE',
									id: device.ip,
									newState: 'acknowledged-standby',
								})
							}
						}, Math.random() * 2000) */
					}
				}
			})
		}, 1000)
		return () => clearInterval(checkStatusInterval)
	}, [projectDevices, setDeviceStatus, deviceStatus, lastCheckedDevice])
	return <>{children}</>
}
