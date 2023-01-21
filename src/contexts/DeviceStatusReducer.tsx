import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react'
import { DeviceConnectedManager } from './DeviceConnectedManager'

export type PossibleDeviceStates = 'blank' | 'await-standby' | 'acknowledged-standby' | 'go' | 'error'
export interface ProjectDeviceState {
	/**
	 * Blank = all lights are blank and not awaiting any user input
	 * Await Standby = red light is flashing, the device is awaiting the user to press the standby button
	 * Acknowledged Standby = the standby has been acknowledged
	 * Go = the green light is lit
	 * Error = all lights are lit solidly
	 */
	state: PossibleDeviceStates
	stateLastChanged: number
	loading: boolean
	connected: boolean
	preset: number | null
}

interface DispatchProjectDeviceState {
	type: string
	id?: string
	newState?: PossibleDeviceStates
	newPreset?: number | null
	newLoading?: boolean
	newConnected?: boolean
}

const DeviceStatusContext = createContext<{ [id: string]: ProjectDeviceState }>({})
const DeviceStatusDispatchContext = createContext({} as Dispatch<DispatchProjectDeviceState>)

export const DeviceStatusProvider = ({ children }: { children?: ReactNode }) => {
	const [state, dispatch] = useReducer(devicesReducer, {})
	return (
		<DeviceStatusContext.Provider value={state}>
			<DeviceStatusDispatchContext.Provider value={dispatch}>
				<DeviceConnectedManager>{children}</DeviceConnectedManager>
			</DeviceStatusDispatchContext.Provider>
		</DeviceStatusContext.Provider>
	)
}

export const useDeviceStatus = () => useContext(DeviceStatusContext)
export const useDeviceStatusDispatch = () => useContext(DeviceStatusDispatchContext)

const devicesReducer = (state: { [ip: string]: ProjectDeviceState }, action: DispatchProjectDeviceState) => {
	switch (action.type) {
		case 'SET_DEVICE_STATE': {
			if (action.newState === undefined || action.id === undefined) throw Error('Invalid action payload')
			const newState = state[action.id]
			newState.state = action.newState
			newState.stateLastChanged = Date.now()
			return { ...state, [action.id]: newState }
		}
		case 'SET_DEVICE_CONNECTED': {
			if (action.newConnected === undefined || action.id === undefined) throw Error('Invalid action payload')
			const newState = state[action.id]
			newState.connected = action.newConnected
			newState.stateLastChanged = Date.now()
			return { ...state, [action.id]: newState }
		}
		case 'SET_DEVICE_PRESET': {
			if (action.newPreset === undefined || action.id === undefined) throw Error('Invalid action payload')
			const newState = state[action.id]
			newState.preset = action.newPreset
			return { ...state, [action.id]: newState }
		}
		case 'SET_DEVICE_LOADING': {
			if (action.newLoading === undefined || action.id === undefined) throw Error('Invalid action payload')
			const newState = state[action.id]
			newState.loading = action.newLoading
			return { ...state, [action.id]: newState }
		}
		case 'CLEAR_PRESET': {
			const newState = state
			Object.keys(state).forEach(device => {
				newState[device].preset = null
			})
			return state
		}
		case 'ADD_DEVICE': {
			if (action.id === undefined) throw Error('Invalid action payload')
			const newState: ProjectDeviceState = {
				state: 'blank',
				preset: null,
				stateLastChanged: 0,
				loading: false,
				connected: false,
			}
			return { ...state, [action.id]: newState }
		}
		default:
			throw Error('Invalid action type')
	}
}
