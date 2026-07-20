import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import styles from "./TaskDetail.module.css";
import { Term } from "../../ui/Term/Term";
import { Button } from "../../ui/Button/Button";
import { Input } from "../../ui/Input/Input";
import { Textarea } from "../../ui/Textarea/Textarea";
import { useUIStore } from "../../../stores/useUIStore";
import { useTask, useUpdateTask, useDeleteTask } from "../../../hooks/useTasks";
import {
	useSubtasks,
	useCreateSubtask,
	useUpdateSubtask,
	useDeleteSubtask,
} from "../../../hooks/useSubtasks";
import { useColumns } from "../../../hooks/useColumns";

export function TaskDetail() {
	const taskDetailId = useUIStore((s) => s.taskDetailId);
	const closeTaskDetail = useUIStore((s) => s.closeTaskDetail);
	const activeProjectId = useUIStore((s) => s.activeProjectId);

	const { data: task } = useTask(taskDetailId);
	const { data: subtasks } = useSubtasks(taskDetailId ?? "");
	const { data: columns } = useColumns(activeProjectId ?? "");

	const updateTask = useUpdateTask();
	const deleteTask = useDeleteTask();
	const createSubtask = useCreateSubtask();
	const updateSubtask = useUpdateSubtask();
	const deleteSubtask = useDeleteSubtask();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [assignee, setAssignee] = useState("");
	const [columnId, setColumnId] = useState("");
	const [newSubtask, setNewSubtask] = useState("");

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDescription(task.description ?? "");
			setAssignee(task.assignee ?? "");
			setColumnId(task.columnId);
		}
	}, [task]);

	if (!taskDetailId || !task) return null;

	const handleSave = () => {
		updateTask.mutate({
			id: task.id,
			songId: task.songId,
			title,
			description: description || undefined,
			assignee: assignee || undefined,
			columnId,
		});
	};

	const handleDelete = async () => {
		if (window.confirm("Delete this task?")) {
			deleteTask.mutate({ id: task.id, songId: task.songId });
			closeTaskDetail();
		}
	};

	const handleAddSubtask = () => {
		if (newSubtask.trim()) {
			createSubtask.mutate({ taskId: task.id, title: newSubtask.trim() });
			setNewSubtask("");
		}
	};

	const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
		updateSubtask.mutate({ id: subtaskId, taskId: task.id, completed });
	};

	const handleDeleteSubtask = (subtaskId: string) => {
		deleteSubtask.mutate({ id: subtaskId, taskId: task.id });
	};

	return (
		<Dialog.Root
			open={!!taskDetailId}
			onOpenChange={(open) => {
				if (!open) closeTaskDetail();
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className={styles.overlay} />
				<Dialog.Content className={styles.content}>
					<Dialog.Title asChild>
						<div className={styles.titleRow}>
							<input
								className={styles.titleInput}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								onBlur={handleSave}
							/>
						</div>
					</Dialog.Title>

					<div className={styles.body}>
						<div className={styles.field}>
							<Term as="label" variant="label">
								Column
							</Term>
							<select
								className={styles.select}
								value={columnId}
								onChange={(e) => {
									setColumnId(e.target.value);
									updateTask.mutate({
										id: task.id,
										songId: task.songId,
										columnId: e.target.value,
										title,
										description: description || undefined,
										assignee: assignee || undefined,
									});
								}}
							>
								{columns?.map((col) => (
									<option key={col.id} value={col.id}>
										{col.name}
									</option>
								))}
							</select>
						</div>

						<div className={styles.field}>
							<Term as="label" variant="label">
								Assignee
							</Term>
							<Input
								value={assignee}
								onChange={(e) => setAssignee(e.target.value)}
								onBlur={handleSave}
								placeholder="Unassigned"
							/>
						</div>

						<div className={styles.field}>
							<Term as="label" variant="label">Subtasks</Term>
							<div className={styles.subtaskList}>
								{subtasks?.map((subtask) => (
									<div key={subtask.id} className={styles.subtaskRow}>
										<Checkbox.Root
											className={styles.checkbox}
											checked={subtask.completed}
											onCheckedChange={(checked) =>
												handleToggleSubtask(subtask.id, checked === true)
											}
										>
											<Checkbox.Indicator className={styles.checkIndicator}>
												✓
											</Checkbox.Indicator>
										</Checkbox.Root>
										<Term
											className={[
												styles.subtaskTitle,
												subtask.completed ? styles.completed : '',
											].filter(Boolean).join(' ')}
										>
											{subtask.title}
										</Term>
										<button
											type="button"
											className={styles.deleteSubtask}
											onClick={() => handleDeleteSubtask(subtask.id)}
											aria-label="Delete subtask"
										>
											×
										</button>
									</div>
								))}
							</div>
							<div className={styles.addSubtask}>
								<Input
									value={newSubtask}
									onChange={(e) => setNewSubtask(e.target.value)}
									placeholder="Add subtask…"
									onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask() }}
								/>
								<Button variant="ghost" size="sm" onClick={handleAddSubtask}>
									<Term>Add</Term>
								</Button>
							</div>
						</div>

						<div className={styles.field}>
							<Term as="label" variant="label">Description</Term>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								onBlur={handleSave}
								placeholder="Add a description…"
								rows={4}
							/>
						</div>
					</div>

					<div className={styles.footer}>
						<Button variant="danger" size="sm" onClick={handleDelete}>
							<Term>Delete Task</Term>
						</Button>
						<Button variant="ghost" size="sm" onClick={closeTaskDetail}>
							<Term>Close</Term>
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
