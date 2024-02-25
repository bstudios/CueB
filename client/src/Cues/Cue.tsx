import { useParams } from "react-router-dom"


export const Cue = () => {
	const cueId = useParams()
	return <div>Cue {cueId.cueId}</div>
}
