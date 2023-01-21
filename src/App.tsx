import React from 'react'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import Router from './Router'
import { useColorScheme, useLocalStorage } from '@mantine/hooks'
import { NotificationsProvider } from '@mantine/notifications'
import { DeviceStatusProvider } from './contexts/DeviceStatusReducer'

function App() {
	const preferredColorScheme = useColorScheme()
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: preferredColorScheme,
		getInitialValueInEffect: true,
	})
	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

	return (
		<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
			<MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
				<NotificationsProvider position="top-right">
					<DeviceStatusProvider>
						<Router />
					</DeviceStatusProvider>
				</NotificationsProvider>
			</MantineProvider>
		</ColorSchemeProvider>
	)
}

export default App
