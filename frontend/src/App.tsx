import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import styles from "./App.module.css";
import { apiFetch } from "./api/client";
import { authClient } from "./auth";
import { LoginPage } from "./components/auth/LoginPage/LoginPage";
import { Board } from "./components/board/Board/Board";
import { BoardHeader } from "./components/board/BoardHeader/BoardHeader";
import { ColumnManager } from "./components/column/ColumnManager/ColumnManager";
import { CommentDrawer } from "./components/comments/CommentDrawer/CommentDrawer";
import { AppShell } from "./components/layout/AppShell/AppShell";
import { Sidebar } from "./components/layout/Sidebar/Sidebar";
import { ProjectModal } from "./components/project/ProjectModal/ProjectModal";
import { SequencingView } from "./components/sequencing/SequencingView/SequencingView";
import { SongManager } from "./components/song/SongManager/SongManager";
import { TaskDetail } from "./components/task/TaskDetail/TaskDetail";
import { Term } from "./components/ui/Term/Term";
import { isDemoMode } from "./config/runtime";
import { useUIStore } from "./stores/useUIStore";
function AppShellContent() {
	const activeProjectId = useUIStore((s) => s.activeProjectId);
	const activeView = useUIStore((s) => s.activeView);

	return (
		<AppShell sidebar={<Sidebar />}>
			{activeProjectId ? (
				<div className={styles.boardContainer}>
					<BoardHeader projectId={activeProjectId} />
					{/* Both views stay mounted so the SoundCloud iframe is never destroyed.
              CSS visibility toggling keeps the inactive view out of sight. */}
					<div
						style={{ display: activeView === "board" ? "contents" : "none" }}
					>
						<Board projectId={activeProjectId} />
					</div>
					<div
						style={{ display: activeView === "sequence" ? "contents" : "none" }}
					>
						<SequencingView projectId={activeProjectId} />
					</div>
				</div>
			) : (
				<div className={styles.emptyState}>
					<Term as="h2" variant="heading">
						Select or create a project
					</Term>
					<Term variant="muted">
						Choose a project from the sidebar to get started.
					</Term>
				</div>
			)}
			<TaskDetail />
			<CommentDrawer />
			<ProjectModal />
			<SongManager />
			<ColumnManager />
		</AppShell>
	);
}

function AuthenticatedApp() {
	const { data: session, isPending } = authClient.useSession();
	const setActiveProjectId = useUIStore((s) => s.setActiveProjectId);
	const qc = useQueryClient();

	// Handle ?join=<token> invite links after the session is established
	useEffect(() => {
		if (!session) return;
		const params = new URLSearchParams(window.location.search);
		const token = params.get("join");
		if (!token) return;
		// Remove the param from the URL without a reload
		window.history.replaceState({}, "", window.location.pathname);
		apiFetch<{ projectId: string }>(`/join/${token}`, { method: "POST" })
			.then(({ projectId }) => {
				qc.invalidateQueries({ queryKey: ["projects"] });
				setActiveProjectId(projectId);
			})
			.catch(() => alert("This invite link is invalid or has expired."));
	}, [qc, session, setActiveProjectId]);

	if (isPending) {
		return (
			<div className={styles.loading}>
				<Term variant="muted">…</Term>
			</div>
		);
	}

	if (!session) {
		return <LoginPage />;
	}
	return <AppShellContent />;
}

export default function App() {
	return isDemoMode ? <AppShellContent /> : <AuthenticatedApp />;
}
