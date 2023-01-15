import axios from 'axios'
/*
 * This function is used to identify a device, by asking it to flash its lights
 */
export const identifyDevice = (ip: string): Promise<boolean> => {
	return axios
		.get(`http://${ip}/blink/`, { responseType: 'json' })
		.then(response => {
			return true
		})
		.catch(error => {
			return false
		})
}
