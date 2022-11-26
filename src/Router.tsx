import React, { ReactElement } from 'react'
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AppShell, Container, ScrollArea } from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { Navigation } from './Navigation'

const Router = () => {
	return (
		<HashRouter>
			<Routes>
				<Route path="test2" element={<div>Test</div>} />
        <Route
					path="*"
					element={							<MainNav navigation={<Navigation />} />
					}
				>
					<Route path="test" element={<div>Test</div>} />
				</Route>
			</Routes>
		</HashRouter>
	)
}
const MainNav = ({ navigation }: { navigation: ReactElement }) => {
	const { height } = useViewportSize()
	return (
		<AppShell navbar={navigation} padding={0}>
			<ScrollArea style={{ height }} type="auto" offsetScrollbars scrollbarSize={20}>
				<Container fluid py={'sm'} px={'sm'}>
					<Outlet />
				</Container>
			</ScrollArea>
		</AppShell>
	)
}
export default Router