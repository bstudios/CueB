
import { ScrollArea, Avatar, AppShell } from '@mantine/core'
import { Link, useParams } from 'react-router-dom'
import classes from './CueList.module.css'
const cues = [
	{ id: 1, label: 'Cue 1' },
	{ id: 2, label: 'Cue 2' },
	{ id: 3, label: 'Cue 3' },
	{ id: 4, label: 'Cue 4' },
	{ id: 5, label: 'Cue 5' },
	{ id: 6, label: 'Cue 6' },
	{ id: 7, label: 'Cue 7' },
	{ id: 8, label: 'Cue 8' },
	{ id: 9, label: 'Cue 9' },
	{ id: 10, label: 'Cue 10' },
	{ id: 11, label: 'Cue 11' },
	{ id: 12, label: 'Cue 12' },
	{ id: 13, label: 'Cue 13' },
	{ id: 14, label: 'Cue 14' },
	{ id: 15, label: 'Cue 15' },
	{ id: 16, label: 'Cue 16' },
	{ id: 17, label: 'Cue 17' },
	{ id: 18, label: 'Cue 18' },
	{ id: 19, label: 'Cue 19' },
	{ id: 20, label: 'Cue 20' },
	{ id: 21, label: 'Cue 21' },
	{ id: 22, label: 'Cue 22' },
	{ id: 23, label: 'Cue 23' },
	{ id: 24, label: 'Cue 24' },
	{ id: 25, label: 'Cue 25' },
	{ id: 26, label: 'Cue 26' },
	{ id: 27, label: 'Cue 27' },
	{ id: 28, label: 'Cue 28' },
	{ id: 29, label: 'Cue 29' },
	{ id: 30, label: 'Cue 30' },
	{ id: 31, label: 'Cue 31' },
	{ id: 32, label: 'Cue 32' },
	{ id: 33, label: 'Cue 33' },
	{ id: 34, label: 'Cue 34' },
	{ id: 35, label: 'Cue 35' },
	{ id: 36, label: 'Cue 36' },
	{ id: 37, label: 'Cue 37' },
	{ id: 38, label: 'Cue 38' },
	{ id: 39, label: 'Cue 39' },
	{ id: 40, label: 'Cue 40' },
	{ id: 41, label: 'Cue 41' },
	{ id: 42, label: 'Cue 42' },
	{ id: 43, label: 'Cue 43' },
	{ id: 44, label: 'Cue 44' },
	{ id: 45, label: 'Cue 45' },
	{ id: 46, label: 'Cue 46' },
	{ id: 47, label: 'Cue 47' },
	{ id: 48, label: 'Cue 48' },
	{ id: 49, label: 'Cue 49' },
	{ id: 50, label: 'Cue 50' },
	{ id: 51, label: 'Cue 51' },
]

export function CueList() {
	const { cueId } = useParams()

	const Cues = cues.map(cue => (
		<Link
			to={`/cues/${cue.id}`}
			key={cue.id}
			className={classes.link}
			data-active={cueId && cue.id === parseInt(cueId) || undefined}
		>
			<Avatar size="md" variant="filled" radius="xl" mr={'sm'}>
				{cue.id}
			</Avatar>
			<span>{cue.label}</span>
		</Link>
	))
	return (
		<>
			<AppShell.Section>Navbar header</AppShell.Section>
			<AppShell.Section grow component={ScrollArea}>
				{Cues}
			</AppShell.Section>
		</>
	)
}
