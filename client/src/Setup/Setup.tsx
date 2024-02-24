
import { Button } from '@mantine/core'
export const Setup = () => {
	return (
		<>
			<Button onClick={() => localStorage.clear()}>Clear local storage</Button>
		</>
	)
}
