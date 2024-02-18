
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Operate } from './Operate/Operate'
import { Devices } from './Devices/Devices'
import { Device } from './Devices/Device'
import { Cues } from './Cues/Cues'
import { Cue } from './Cues/Cue'
import { Setup } from './Setup/Setup'
import { MainNav } from './MainNav'

const Router = () => {
	return (
		<HashRouter>
			<Routes>
				<Route element={<MainNav />}>
					<Route path="operate" element={<Operate />} />
					<Route path="devices">
						<Route index element={<Devices />} />
						<Route path=":ip" element={<Device />} />
					</Route>
					<Route path="cues">
						<Route index element={<Cues />} />
						<Route path=":cueId" element={<Cue />} />
					</Route>
					<Route path="setup" element={<Setup />} />
				</Route>
				<Route path="*" element={<Navigate replace to="/operate" />} />
			</Routes>
		</HashRouter>
	)
}

export default Router
