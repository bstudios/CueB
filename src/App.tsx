import React from 'react'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import Router from './Router'
import { useColorScheme, useLocalStorage } from '@mantine/hooks'
import { DeviceStatusProvider } from './contexts/DeviceStatusReducer'
import { Notifications } from '@mantine/notifications'

function App() {
	const preferredColorScheme = useColorScheme()
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: preferredColorScheme,
		getInitialValueInEffect: true,
	})
	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
	//TODO https://trpc.io/docs/reactjs/setup
	return (
		<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
			<MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
				  <Notifications />
					<DeviceStatusProvider>
						<Router />
					</DeviceStatusProvider>
			</MantineProvider>
		</ColorSchemeProvider>
	)
}

export default App
