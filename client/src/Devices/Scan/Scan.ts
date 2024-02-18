import axios, { AxiosResponse } from 'axios'
import { Netmask } from 'netmask'

const SIMULTANEOUS_REQUESTS = 10 // Max number of simultaneous requests to send from Axios
const TIMEOUT_TIME = 1000 // Timeout time for each request

export interface DiscoveredDevice {
	ip: string
	version: string
	type: string
}

export const scanForDevices = async (ip: string, subnet: string): Promise<Array<DiscoveredDevice>> => {
	const block = new Netmask(ip, subnet)
	const ipsToScan: Array<string> = []
	const ipsToScanChunks: Array<Array<string>> = []
	block.forEach((ip: string) => ipsToScan.push(ip))
	for (let i = 0; i < ipsToScan.length; i += SIMULTANEOUS_REQUESTS) {
		// Batch the IPs into chunks of SIMULTANEOUS_REQUESTS
		ipsToScanChunks.push(ipsToScan.slice(i, i + SIMULTANEOUS_REQUESTS))
	}
	const successfulIPs: Array<DiscoveredDevice> = []
	for (const chunk of ipsToScanChunks) {
		await Promise.allSettled(
			chunk.map(ip =>
				axios
					.get(`http://${ip}/about/`, { timeout: TIMEOUT_TIME, responseType: 'json' })
					.then(response =>
						response.data && response.data.version && response.data.type == 'cueb'
							? successfulIPs.push({ ip, version: response.data.version, type: response.data.type })
							: null
					)
			)
		)
	}
	return successfulIPs
}
