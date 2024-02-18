import { MantineProvider } from '@mantine/core'
import Router from './Router'
import { DeviceStatusProvider } from './contexts/DeviceStatusReducer'
import { Notifications } from '@mantine/notifications'

function App() {
	return (
			<MantineProvider>
				<Notifications />
					<DeviceStatusProvider>
						<Router />
					</DeviceStatusProvider>
			</MantineProvider>
	)
}

export default App
