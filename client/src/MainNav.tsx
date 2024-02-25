import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
	AppShell,
	Container,
	useMantineTheme,
	Image,
	ScrollArea,
	useMantineColorScheme,
	Group,
	ActionIcon,
	Burger,
	SegmentedControl,
} from '@mantine/core'
import { useViewportSize } from '@mantine/hooks'
import { CueList } from './Cues/CueList'
import IconLandscape from './icon/icon-landscape.png'
import { IconSun, IconMoon } from '@tabler/icons-react';
import classes from './MainNav.module.css'
import { ConnectionStatus } from './Components/ConnectionStatus'
const HEADER_HEIGHT = 70
const FOOTER_HEIGHT = 60

export const MainNav = () => {
	const { height } = useViewportSize()
	const theme = useMantineTheme()
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const [cueListOpened, setCueListOpened] = useState(true)
	const currentPath = useLocation()
	const navigate = useNavigate()

	return (
		<AppShell
			styles={{
				main: {
					background: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
				},
			}}
			header={{ height: HEADER_HEIGHT }}
			footer={{
				height: FOOTER_HEIGHT,
			}}
			navbar={{
				width: {
					sm: 200, lg: 300
				}, collapsed: { mobile: !currentPath.pathname.startsWith('/cues') || !cueListOpened, desktop: !currentPath.pathname.startsWith('/cues') || !cueListOpened },
				breakpoint: "sm"
			}}
		>
			<AppShell.Header className={classes.navbarMain}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							height: '100%',
						padding: 'var(--mantine-spacing-md)'
						}}
					>
						<Group>
						{currentPath.pathname.startsWith('/cues') && (
							<Burger
								className={classes.burgerButton}
								opened={cueListOpened}
								onClick={() => setCueListOpened(o => !o)}
								size="sm"
								color={theme.colors.gray[6]}
							/>
							)}
						<Image src={IconLandscape} h={HEADER_HEIGHT / 1.5} fit="contain" />
						</Group>
						<SegmentedControl
							value={'/' + currentPath.pathname.split('/')[1]}
							onChange={value => navigate(value)}
							transitionTimingFunction="ease"
							radius="lg"
							size="md"
							data={[
								{ label: 'Operate', value: '/operate' },
								{ label: 'Cues', value: '/cues' },
								{ label: 'Devices', value: '/devices' },
								{ label: 'Setup', value: '/setup' },
							]}
						/>
					<ActionIcon variant="default" onClick={() => toggleColorScheme()} size={HEADER_HEIGHT / 2}>
						{colorScheme === 'dark' ? <IconSun style={{ width: '70%', height: '70%' }} /> : <IconMoon style={{ width: '70%', height: '70%' }} />}
						</ActionIcon>
					</div>
			</AppShell.Header>
			{
				currentPath.pathname.startsWith('/cues') ? (
					<AppShell.Navbar>
						<CueList />
					</AppShell.Navbar>
				) : undefined
			}
			<AppShell.Footer className={classes.footer}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						height: '100%',
					}}
				>
					<ConnectionStatus />
				</div>
			</AppShell.Footer>
			<AppShell.Main>
				<ScrollArea
					style={{ height: height - (FOOTER_HEIGHT + HEADER_HEIGHT) }}
					type="auto"
					offsetScrollbars={false}
					scrollbarSize={30}
				>
					<Container fluid py={'sm'} px={'sm'}>
						<Outlet />
					</Container>
				</ScrollArea>
			</AppShell.Main>
		</AppShell>
	)
}
