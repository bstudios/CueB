import { Button, Modal, Title, Select, Group, Input, TextInput, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import React from 'react'

export const ScanModal = (props: {
	show: boolean
	onModalClose: () => void
	scanForDevices: (ip: string, subnetMask: string) => void
}) => {
	const form = useForm({
		initialValues: {
			subnetMask: '255.255.255.0',
			ip: '192.168.1.1',
		},
		validateInputOnBlur: true,
		clearInputErrorOnChange: true,
		validate: {
			subnetMask: value => {
				if (!value) return 'Subnet mask is required'
			},
			ip: value => (/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(value) ? false : 'Invalid IP address'),
		},
	})

	const handleSubmit = (values: typeof form.values) => {
		if (form.isValid()) {
			props.scanForDevices(values.ip, values.subnetMask)
			props.onModalClose()
		}
	}
	return (
		<Modal
			centered
			withCloseButton={true}
			opened={props.show}
			onClose={props.onModalClose}
			title="Select Network to Scan"
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Select
					label="Subnet Mask"
					searchable={true}
					{...form.getInputProps('subnetMask')}
					data={[
						'255.255.255.255',
						'255.255.255.254',
						'255.255.255.252',
						'255.255.255.248',
						'255.255.255.240',
						'255.255.255.224',
						'255.255.255.192',
						'255.255.255.128',
						'255.255.255.0',
						'255.255.254.0',
						'255.255.252.0',
						'255.255.248.0',
						'255.255.240.0',
						'255.255.224.0',
						'255.255.192.0',
						'255.255.128.0',
						'255.255.0.0',
						'255.254.0.0',
						'255.252.0.0',
						'255.248.0.0',
						'255.240.0.0',
						'255.224.0.0',
						'255.192.0.0',
						'255.128.0.0',
						'255.0.0.0',
						'254.0.0.0',
						'252.0.0.0',
						'248.0.0.0',
						'240.0.0.0',
						'224.0.0.0',
						'192.0.0.0',
						'128.0.0.0',
						'0.0.0.0',
					]}
				/>
				<TextInput label="IP Address" {...form.getInputProps('ip')} />
				<Text>CueB will scan for CueB devices on the network selected</Text>
				<Group position="right" mt="md">
					<Button type="submit">Scan</Button>
				</Group>
			</form>
		</Modal>
	)
}
