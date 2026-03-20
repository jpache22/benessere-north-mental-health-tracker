<script>
	import { onMount } from 'svelte';
	
	const BACKEND_URL = 'https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev';
	
	let selectedGroup = '';
	let groups = [];
	let participants = [];
	let sessions = [];
	let attendance = {};
	let loading = true;
	let error = null;
	let saving = false;
	
	function getToken() {
		return localStorage.getItem('token');
	}
	
	function getUserId() {
		return localStorage.getItem('userId');
	}
	
	function getUserRole() {
		return localStorage.getItem('role');
	}
	
	onMount(async () => {
		await loadGroupData();
	});
	
	async function loadGroupData() {
		try {
			loading = true;
			error = null;
			
			const role = getUserRole();
			const userId = getUserId();
			let url;
			
			if (role === 'admin') {
				url = `${BACKEND_URL}/patientData/admin`;
			} else {
				url = `${BACKEND_URL}/patientData/therapist/${userId}`;
			}
			
			const response = await fetch(url, {
				headers: { 'Authorization': `Bearer ${getToken()}` }
			});
			
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const data = await response.json();
			if (!data.success) throw new Error(data.error || 'Failed to load group data');
			
			const allGroups = data.patientData?.groups || [];
			groups = allGroups.map(g => ({
				group_id: g.group_id,
				label: g.grouplabel,
				session_dates: g.session_dates || [],
				patients: g.patients || [],
				project_forms: g.project_forms || {}
			}));
			
			if (groups.length > 0) {
				selectedGroup = groups[0].group_id;
				buildAttendanceView();
				if (participants.length === 0) {
					await loadParticipantsFallback();
				}
				await loadExistingAttendance();
			}
		} catch (err) {
			error = `Failed to load groups: ${err.message}`;
			console.error('Error:', err);
		} finally {
			loading = false;
		}
	}
	
	function parseDates(raw) {
		if (!raw) return [];
		if (Array.isArray(raw)) return raw;
		if (typeof raw === 'string') {
			try { return JSON.parse(raw); }
			catch (e) { return raw.split(',').map(d => d.trim()); }
		}
		return [];
	}
	
	function buildAttendanceView() {
		const group = groups.find(g => g.group_id === selectedGroup);
		if (!group) {
			participants = [];
			sessions = [];
			attendance = {};
			return;
		}
		
		participants = group.patients.map(p => ({ id: p.patient_id, name: p.username }));
		
		let dates = parseDates(group.session_dates);
		sessions = dates.map((date, index) => ({
			id: index + 1,
			label: `Session ${index + 1}`,
			date: date
		}));
		
		let att = {};
		participants.forEach(p => {
			att[p.id] = {};
			sessions.forEach(s => { att[p.id][s.id] = null; });
		});
		attendance = att;
	}
	
	async function loadParticipantsFallback() {
		if (!selectedGroup) return;
		try {
			const response = await fetch(`${BACKEND_URL}/getAttendance/group/${selectedGroup}`, {
				headers: { 'Authorization': `Bearer ${getToken()}` }
			});
			if (!response.ok) return;
			const data = await response.json();
			
			if (data.success && data.payload?.data?.length > 0) {
				const rows = data.payload.data;
				const seen = new Set();
				participants = [];
				for (const row of rows) {
					const id = row.user_id || row.username;
					if (!seen.has(id)) {
						seen.add(id);
						participants.push({ id, name: row.username });
					}
				}
				
				if (sessions.length === 0 && rows[0].session_dates) {
					let dates = parseDates(rows[0].session_dates);
					sessions = dates.map((date, index) => ({
						id: index + 1,
						label: `Session ${index + 1}`,
						date: date
					}));
				}
				
				let att = {};
				participants.forEach(p => {
					att[p.id] = {};
					sessions.forEach(s => { att[p.id][s.id] = null; });
				});
				attendance = att;
			}
		} catch (err) {
			console.warn('Fallback participant load failed:', err.message);
		}
	}
	
	async function loadExistingAttendance() {
		if (!selectedGroup) return;
		try {
			const response = await fetch(`${BACKEND_URL}/attendance/group/${selectedGroup}`, {
				headers: { 'Authorization': `Bearer ${getToken()}` }
			});
			if (!response.ok) return;
			const data = await response.json();
			
			if (data.success && data.payload?.data) {
				let updated = {};
				// Deep copy current attendance
				for (const pId in attendance) {
					updated[pId] = { ...attendance[pId] };
				}
				// Merge saved records
				for (const record of data.payload.data) {
					const pId = record.participant_id;
					const sId = record.session_id;
					if (updated[pId] && sId in updated[pId]) {
						updated[pId][sId] = record.status;
					}
				}
				attendance = updated;
			}
		} catch (err) {
			console.warn('Could not load existing attendance:', err.message);
		}
	}
	
	async function setAttendance(participantId, sessionId, status) {
		const previousStatus = attendance[participantId]?.[sessionId];
		
		// Optimistic update — build new object so Svelte detects the change
		let updated = {};
		for (const pId in attendance) {
			updated[pId] = { ...attendance[pId] };
		}
		updated[participantId][sessionId] = status;
		attendance = updated;
		
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
			// Revert
			let reverted = {};
			for (const pId in attendance) {
				reverted[pId] = { ...attendance[pId] };
			}
			reverted[participantId][sessionId] = previousStatus;
			attendance = reverted;
			error = `Failed to save: ${err.message}`;
			setTimeout(() => { error = null; }, 3000);
		} finally {
			saving = false;
		}
	}
	
	async function handleGroupChange() {
		if (selectedGroup) {
			buildAttendanceView();
			if (participants.length === 0) {
				await loadParticipantsFallback();
			}
			await loadExistingAttendance();
		}
	}
	
	function formatDate(dateString) {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		} catch { return dateString; }
	}
</script>

<div class="attendance-page">
	<h1 class="page-title">Attendance Overview</h1>
	
	{#if error}
		<div class="alert-error">{error}</div>
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
				<select id="group-select" bind:value={selectedGroup} on:change={handleGroupChange}>
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
										<div class="cell-content">
											<button
												on:click={() => setAttendance(participant.id, session.id, 'present')}
												class="btn btn-present"
												class:selected={attendance[participant.id]?.[session.id] === 'present'}
												class:faded={attendance[participant.id]?.[session.id] && attendance[participant.id]?.[session.id] !== 'present'}
												class:unset={!attendance[participant.id]?.[session.id]}
												disabled={saving}
												title="Present"
											>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
												</svg>
											</button>
											
											<button
												on:click={() => setAttendance(participant.id, session.id, 'late')}
												class="btn btn-late"
												class:selected={attendance[participant.id]?.[session.id] === 'late'}
												class:faded={attendance[participant.id]?.[session.id] && attendance[participant.id]?.[session.id] !== 'late'}
												class:unset={!attendance[participant.id]?.[session.id]}
												disabled={saving}
												title="Late"
											>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path>
												</svg>
											</button>
											
											<button
												on:click={() => setAttendance(participant.id, session.id, 'absent')}
												class="btn btn-absent"
												class:selected={attendance[participant.id]?.[session.id] === 'absent'}
												class:faded={attendance[participant.id]?.[session.id] && attendance[participant.id]?.[session.id] !== 'absent'}
												class:unset={!attendance[participant.id]?.[session.id]}
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
	
	.cell-content { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.5rem; }
	
	.btn {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		transition: opacity 150ms;
		color: white;
	}
	.btn:disabled { cursor: not-allowed; }
	.btn svg { width: 1.25rem; height: 1.25rem; }
	
	.btn-present { background: #22c55e; }
	.btn-present:hover:not(:disabled) { background: #16a34a; }
	.btn-late { background: #fb923c; }
	.btn-late:hover:not(:disabled) { background: #f97316; }
	.btn-absent { background: #ef4444; }
	.btn-absent:hover:not(:disabled) { background: #dc2626; }
	
	/* No selection yet — all buttons semi-visible */
	.btn.unset { opacity: 0.4; }
	
	/* This button IS the selected status — full bright */
	.btn.selected { opacity: 1; }
	
	/* A status is selected but it's NOT this button — very faded */
	.btn.faded { opacity: 0.2; }
</style>
