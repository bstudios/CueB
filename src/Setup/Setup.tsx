import React from 'react'
import { Button } from '@mantine/core'
export const Setup = () => {
	return (
		<>
			<div>Setup</div>
			<Button onClick={() => localStorage.clear()}>Reset</Button>
		</>
	)
}
