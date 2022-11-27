import React, { useState } from 'react'
import { HashRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
	AppShell,
	Container,
	useMantineTheme,
	MediaQuery,
	Navbar,
	Image,
	Header,
	ScrollArea,
	useMantineColorScheme,
	Group,
	ActionIcon,
	Burger,
	Footer,
	SegmentedControl,
} from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { CueList } from './CueList'
import { Operate } from './Operate/Operate'
import { FaSun } from '@react-icons/all-files/fa/FaSun'
import { FaMoon } from '@react-icons/all-files/fa/FaMoon'
import IconLandscape from './assets/icon/icon-landscape.png'
import { Devices } from './Devices/Devices'
import { Device } from './Devices/Device'
import { Cues } from './Cues/Cues'
import { Cue } from './Cues/Cue'
import { Setup } from './Setup/Setup'

const Router = () => {
	return (
		<HashRouter>
			<Routes>
				<Route element={<MainNav />}>
					<Route path="operate" element={<Operate />} />
					<Route path="devices">
						<Route index element={<Devices />} />
						<Route path=":deviceId" element={<Device />} />
					</Route>
					<Route path="cues">
						<Route index element={<Cues />} />
						<Route path=":cueId" element={<Cue />} />
					</Route>
					<Route path="setup" element={<Setup />} />
				</Route>
				<Route path="*" element={<div>Test</div>} />
			</Routes>
		</HashRouter>
	)
}
const MainNav = () => {
	const { height } = useViewportSize()
	const theme = useMantineTheme()
	const { colorScheme, toggleColorScheme } = useMantineColorScheme()
	const [cueListOpened, setCueListOpened] = useState(true)
	const currentPath = useLocation()
	const navigate = useNavigate()
	return (
		<AppShell
			styles={{
				main: {
					background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
				},
			}}
			padding={0}
			navbarOffsetBreakpoint="sm"
			asideOffsetBreakpoint="sm"
			header={
				<Header height={70} p="md">
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							height: '100%',
						}}
					>
						<Group>
							{currentPath.pathname.startsWith('/cues') && (
								<MediaQuery largerThan="sm" styles={{ display: 'none' }}>
									<Burger
										opened={cueListOpened}
										onClick={() => setCueListOpened(o => !o)}
										size="sm"
										color={theme.colors.gray[6]}
									/>
								</MediaQuery>
							)}
							<Image src={IconLandscape} width={100} fit="contain" />
						</Group>
						<SegmentedControl
							value={'/' + currentPath.pathname.split('/')[1]}
							onChange={value => navigate(value)}
							transitionTimingFunction="ease"
							radius="lg"
							size="md"
							data={[
								{ label: 'Operate', value: '/operate' },
								{ label: 'Devices', value: '/devices' },
								{ label: 'Cues', value: '/cues' },
								{ label: 'Setup', value: '/setup' },
							]}
						/>
						<ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
							{colorScheme === 'dark' ? <FaSun /> : <FaMoon />}
						</ActionIcon>
					</div>
				</Header>
			}
			navbar={
				currentPath.pathname.startsWith('/cues') ? (
					<Navbar p="md" width={{ sm: 200, lg: 300 }} hidden={!cueListOpened} hiddenBreakpoint="sm">
						<CueList />
					</Navbar>
				) : undefined
			}
			footer={
				<Footer height={60} p="md">
					Application footer
				</Footer>
			}
		>
			<ScrollArea style={{ height }} type="auto" offsetScrollbars scrollbarSize={20}>
				<Container fluid py={'sm'} px={'sm'}>
					<Outlet />
				</Container>
			</ScrollArea>
		</AppShell>
	)
}
export default Router
