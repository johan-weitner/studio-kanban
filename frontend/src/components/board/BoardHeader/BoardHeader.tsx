import { useState } from "react";
import styles from "./BoardHeader.module.css";
import { Term } from "../../ui/Term/Term";
import { Button } from "../../ui/Button/Button";
import { useProject } from "../../../hooks/useProjects";
import { useUIStore } from "../../../stores/useUIStore";
import { apiFetch } from "../../../api/client";
import { authClient } from "../../../auth";

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
	const { data: session } = authClient.useSession();
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
				{/* User info — rightmost, after a divider */}
				{session?.user && (
					<>
						<div className={styles.divider} />
						<div className={styles.userInfo}>
							{session.user.image ? (
								<img src={session.user.image} alt={session.user.name ?? ''} className={styles.avatar} />
							) : (
								<div className={styles.avatarFallback}>
									<Term>{(session.user.name ?? '?')[0].toUpperCase()}</Term>
								</div>
							)}
							<Term className={styles.userName} variant="muted">{session.user.name}</Term>
							<button
								className={styles.signOutBtn}
								onClick={() => authClient.signOut()}
								aria-label="Sign out"
								title="Sign out"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
									<polyline points="16 17 21 12 16 7"/>
									<line x1="21" y1="12" x2="9" y2="12"/>
								</svg>
							</button>
						</div>
					</>
				)}
			</div>
		</header>
	);
}
