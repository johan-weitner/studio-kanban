import styles from "./BoardHeader.module.css";
import { Term } from "../../ui/Term/Term";
import { Button } from "../../ui/Button/Button";
import { useProject } from "../../../hooks/useProjects";
import { useUIStore } from "../../../stores/useUIStore";

interface BoardHeaderProps {
	projectId: string;
}

export function BoardHeader({ projectId }: BoardHeaderProps) {
	const { data: project } = useProject(projectId);
	const openSongManager = useUIStore((s) => s.openSongManager);
	const openColumnManager = useUIStore((s) => s.openColumnManager);
	const openEditProject = useUIStore((s) => s.openEditProject);

	return (
		<header className={styles.header}>
			<div className={styles.left}>
				<Term as="h1" variant="heading">
					{project?.name ?? "…"}
				</Term>
				{project?.description && (
					<Term variant="muted">{project.description}</Term>
				)}
			</div>
			<div className={styles.actions}>
				<Button variant="ghost" size="sm" onClick={openSongManager}>
					<Term>Manage Songs</Term>
				</Button>
				<Button variant="ghost" size="sm" onClick={openColumnManager}>
					<Term>Manage Columns</Term>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => openEditProject(projectId)}
				>
					<Term>Edit Project</Term>
				</Button>
			</div>
		</header>
	);
}
