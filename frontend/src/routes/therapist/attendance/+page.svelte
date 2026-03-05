<script>
	import { onMount } from 'svelte';
	
	// Backend URL - update if needed
	const BACKEND_URL = 'https://benessere-north-mental-health-tracker.jmaser22.workers.dev';
	
	// State
	let selectedGroup = '';
	let groups = [];
	let participants = [];
	let sessions = [];
	let attendance = {};
	let loading = true;
	let error = null;
	let saving = false;
	
	// Get auth token from localStorage
	function getToken() {
		return localStorage.getItem('token');
	}
	
	onMount(async () => {
		await loadGroups();
	});
	
	// Load available groups
	async function loadGroups() {
		try {
			loading = true;
			error = null;
			
			const response = await fetch(`${BACKEND_URL}/groups`, {
				headers: {
					'Authorization': `Bearer ${getToken()}`
				}
			});
			
			if (!response.ok) throw new Error('Failed to fetch groups');
			
			const data = await response.json();
			
			if (data.success && data.payload) {
				groups = data.payload.data || [];
			}
			
			// Select first group
			if (groups.length > 0) {
				selectedGroup = groups[0].group_id;
				await loadGroupAttendance();
			}
			
		} catch (err) {
			error = `Failed to load groups: ${err.message}`;
			console.error('Error:', err);
		} finally {
			loading = false;
		}
	}
	
	// Load attendance for selected group
	async function loadGroupAttendance() {
		if (!selectedGroup) return;
		
		try {
			loading = true;
			error = null;
			
			const response = await fetch(`${BACKEND_URL}/getAttendance/group/${selectedGroup}`, {
				headers: {
					'Authorization': `Bearer ${getToken()}`
				}
			});
			
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			
			const data = await response.json();
			
			if (!data.success) {
				throw new Error(data.error || 'Failed to load attendance');
			}
			
			parseAttendanceData(data.payload);
			
		} catch (err) {
			error = `Failed to load attendance: ${err.message}`;
			console.error('Error:', err);
		} finally {
			loading = false;
		}
	}
	
	// Parse backend response
	function parseAttendanceData(payload) {
		if (!payload || !payload.data || payload.data.length === 0) {
			participants = [];
			sessions = [];
			attendance = {};
			return;
		}
		
		const data = payload.data;
		
		// Build participants list from usernames
		participants = data.map((row, index) => ({
			id: index + 1,
			name: row.username
		}));
		
		// Parse session_dates (assuming it's a JSON array string)
		if (data[0].session_dates) {
			let dates = [];
			try {
				dates = typeof data[0].session_dates === 'string'
					? JSON.parse(data[0].session_dates)
					: data[0].session_dates;
			} catch (e) {
				// If not JSON, try splitting by comma
				dates = String(data[0].session_dates).split(',').map(d => d.trim());
			}
			
			sessions = dates.map((date, index) => ({
				id: index + 1,
				label: `Section ${index + 1}`,
				date: date
			}));
		}
		
		// Initialize attendance (all null = white cells)
		attendance = {};
		participants.forEach(p => {
			attendance[p.id] = {};
			sessions.forEach(s => {
				attendance[p.id][s.id] = null;
			});
		});
	}
	
	// Save attendance
	async function setAttendance(participantId, sessionId, status) {
		// Optimistic UI update
		const previousStatus = attendance[participantId]?.[sessionId];
		attendance = {
			...attendance,
			[participantId]: {
				...attendance[participantId],
				[sessionId]: status
			}
		};
		
		try {
			saving = true;
			
			const response = await fetch(`${BACKEND_URL}/attendance`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${getToken()}`
				},
				body: JSON.stringify({
					participant_id: participantId,
					session_id: sessionId,
					status: status,
					group_id: selectedGroup
				})
			});
			
			if (!response.ok) throw new Error('Save failed');
			
			const data = await response.json();
			if (!data.success) throw new Error(data.error || 'Save failed');
			
		} catch (err) {
			// Revert on error
			attendance = {
				...attendance,
				[participantId]: {
					...attendance[participantId],
					[sessionId]: previousStatus
				}
			};
			error = `Failed to save: ${err.message}`;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			saving = false;
		}
	}
	
	async function handleGroupChange() {
		if (selectedGroup) {
			await loadGroupAttendance();
		}
	}
	
	function getCellClass(participantId, sessionId) {
		const status = attendance[participantId]?.[sessionId];
		if (!status) return 'bg-white';
		
		switch(status) {
			case 'present': return 'bg-green-500';
			case 'late': return 'bg-orange-400';
			case 'absent': return 'bg-red-500';
			default: return 'bg-white';
		}
	}
	
	function getButtonOpacity(participantId, sessionId, buttonType) {
		const status = attendance[participantId]?.[sessionId];
		return status === buttonType ? 'opacity-100' : 'opacity-40';
	}
	
	function formatDate(dateString) {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		} catch {
			return dateString;
		}
	}
</script>

<div class="attendance-page">
	<h1 class="page-title">Attendance Overview</h1>
	
	{#if error}
		<div class="alert-error"> {error}</div>
	{/if}
	
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading...</p>
		</div>
	{:else}
		<div class="controls">
			<div class="group-selector">
				<label for="group-select">Group:</label>
				<select 
					id="group-select" 
					bind:value={selectedGroup}
					on:change={handleGroupChange}
				>
					{#each groups as group}
						<option value={group.group_id}>{group.label || group.group_id}</option>
					{/each}
				</select>
			</div>
			
			<div class="legend">
				<span class="legend-label">For attendance, the choices are:</span>
				<div class="legend-item">
					<span class="icon icon-present">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
						</svg>
					</span>
					<span>Present</span>
				</div>
				<div class="legend-item">
					<span class="icon icon-late">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path>
						</svg>
					</span>
					<span>Late</span>
				</div>
				<div class="legend-item">
					<span class="icon icon-absent">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</span>
					<span>Absent</span>
				</div>
			</div>
			
			{#if saving}
				<span class="saving">Saving...</span>
			{/if}
		</div>
		
		{#if participants.length === 0}
			<div class="empty">No participants found for this group.</div>
		{:else}
			<div class="table-wrapper">
				<table class="attendance-table">
					<thead>
						<tr>
							<th class="name-header"></th>
							{#each sessions as session}
								<th class="session-header">
									<div>{session.label}</div>
									{#if session.date}
										<div class="session-date">{formatDate(session.date)}</div>
									{/if}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each participants as participant}
							<tr>
								<td class="name-cell">{participant.name}</td>
								{#each sessions as session}
									<td class="attendance-cell">
										<div class="cell-content {getCellClass(participant.id, session.id)}">
											<button
												on:click={() => setAttendance(participant.id, session.id, 'present')}
												class="btn btn-present {getButtonOpacity(participant.id, session.id, 'present')}"
												disabled={saving}
												title="Present"
											>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
												</svg>
											</button>
											
											<button
												on:click={() => setAttendance(participant.id, session.id, 'late')}
												class="btn btn-late {getButtonOpacity(participant.id, session.id, 'late')}"
												disabled={saving}
												title="Late"
											>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path>
												</svg>
											</button>
											
											<button
												on:click={() => setAttendance(participant.id, session.id, 'absent')}
												class="btn btn-absent {getButtonOpacity(participant.id, session.id, 'absent')}"
												disabled={saving}
												title="Absent"
											>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
												</svg>
											</button>
										</div>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>

<style>
	.attendance-page { padding: 0; }
	.page-title { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #0f172a; }
	
	.alert-error { padding: 1rem; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 0.5rem; margin-bottom: 1rem; }
	
	.loading { text-align: center; padding: 4rem 0; }
	.spinner { border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
	@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
	
	.controls { display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
	.group-selector { display: flex; align-items: center; gap: 0.75rem; }
	.group-selector label { font-weight: 500; font-size: 1rem; }
	.group-selector select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; min-width: 140px; font-size: 0.875rem; }
	
	.legend { display: flex; align-items: center; gap: 1.5rem; font-size: 0.875rem; }
	.legend-label { font-weight: 500; }
	.legend-item { display: flex; align-items: center; gap: 0.5rem; }
	
	.icon { width: 1.5rem; height: 1.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
	.icon svg { width: 1rem; height: 1rem; }
	.icon-present { background: #22c55e; }
	.icon-late { background: #fb923c; }
	.icon-absent { background: #ef4444; }
	
	.saving { color: #6b7280; font-size: 0.875rem; font-style: italic; }
	.empty { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 3rem; text-align: center; color: #6b7280; }
	
	.table-wrapper { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow-x: auto; }
	.attendance-table { width: 100%; border-collapse: collapse; }
	.attendance-table thead tr { background: #e5e7eb; }
	.attendance-table th, .attendance-table td { border: 1px solid #d1d5db; padding: 1rem; }
	
	.name-header, .session-header { font-weight: 500; text-align: center; }
	.name-header { min-width: 120px; text-align: left; }
	.session-header { min-width: 140px; }
	.session-date { font-size: 0.75rem; color: #6b7280; font-weight: 400; margin-top: 0.25rem; }
	
	.name-cell { font-weight: 500; background: #f9fafb; }
	.attendance-cell { padding: 0.5rem; }
	
	.cell-content { display: flex; align-items: center; justify-content: center; gap: 0.25rem; padding: 0.5rem; border-radius: 0.5rem; transition: background-color 150ms; }
	.bg-white { background: white; }
	.bg-green-500 { background: #22c55e; }
	.bg-orange-400 { background: #fb923c; }
	.bg-red-500 { background: #ef4444; }
	
	.btn { width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 150ms; color: white; }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn svg { width: 1.25rem; height: 1.25rem; }
	
	.btn-present { background: #22c55e; }
	.btn-present:hover:not(:disabled) { background: #16a34a; }
	.btn-late { background: #fb923c; }
	.btn-late:hover:not(:disabled) { background: #f97316; }
	.btn-absent { background: #ef4444; }
	.btn-absent:hover:not(:disabled) { background: #dc2626; }
	
	.opacity-100 { opacity: 1; }
	.opacity-40 { opacity: 0.4; }
</style>