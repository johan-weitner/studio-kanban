import { useState } from "react";
import styles from "./BoardHeader.module.css";
import { Term } from "../../ui/Term/Term";
import { Button } from "../../ui/Button/Button";
import { useProject } from "../../../hooks/useProjects";
import { useUIStore } from "../../../stores/useUIStore";
import { apiFetch } from "../../../api/client";

interface BoardHeaderProps {
	projectId: string;
}

export function BoardHeader({ projectId }: BoardHeaderProps) {
	const { data: project } = useProject(projectId);
	const openSongManager = useUIStore((s) => s.openSongManager);
	const openColumnManager = useUIStore((s) => s.openColumnManager);
	const openEditProject = useUIStore((s) => s.openEditProject);
	const activeView = useUIStore((s) => s.activeView);
	const setActiveView = useUIStore((s) => s.setActiveView);
	const [inviteURL, setInviteURL] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const handleInvite = async () => {
		const result = await apiFetch<{ inviteURL: string }>(`/projects/${projectId}/invite`, { method: 'POST' });
		setInviteURL(result.inviteURL);
		setCopied(false);
	};

	const handleCopy = () => {
		if (!inviteURL) return;
		navigator.clipboard.writeText(inviteURL);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<header className={styles.header}>
			<div className={styles.left}>
				<Term as="h1" variant="heading">
					{project?.name ?? "…"}
				</Term>
				{project?.description && (
					<Term variant="muted">{project.description}</Term>
				)}
				{/* View toggle — visually distinct from the action buttons */}
				<div className={styles.viewToggle}>
					<button
						className={[styles.viewBtn, activeView === 'board' ? styles.viewBtnActive : ''].filter(Boolean).join(' ')}
						onClick={() => setActiveView('board')}
					>
						<Term>Board</Term>
					</button>
					<button
						className={[styles.viewBtn, activeView === 'sequence' ? styles.viewBtnActive : ''].filter(Boolean).join(' ')}
						onClick={() => setActiveView('sequence')}
					>
						<Term>Sequence</Term>
					</button>
				</div>
			</div>
			<div className={styles.actions}>
				{inviteURL ? (
					<div className={styles.inviteRow}>
						<input
							readOnly
							value={inviteURL}
							className={styles.inviteInput}
							onFocus={(e) => e.target.select()}
						/>
						<Button variant="ghost" size="sm" onClick={handleCopy}>
							<Term>{copied ? '✓ Copied' : 'Copy'}</Term>
						</Button>
						<Button variant="ghost" size="sm" onClick={() => setInviteURL(null)}>
							<Term>×</Term>
						</Button>
					</div>
				) : (
					<Button variant="ghost" size="sm" onClick={handleInvite}>
						<Term>Invite</Term>
					</Button>
				)}
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
