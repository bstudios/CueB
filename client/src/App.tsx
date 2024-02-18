import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import Router from './Router'
import { DeviceStatusProvider } from './contexts/DeviceStatusReducer'
import { Notifications } from '@mantine/notifications'
import "@mantine/core/styles.css";
//<DeviceStatusProvider>
function App() {
	return (
		<>
			<ColorSchemeScript defaultColorScheme="auto" />
			<MantineProvider defaultColorScheme="auto">
				<Notifications />

				<Router />
			</MantineProvider>
		</>
	)
}

export default App
