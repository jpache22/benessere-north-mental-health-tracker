<script>
	// Sample data - replace with your actual data from API
	let selectedGroup = 'Group 1';
	let groups = ['Group 1', 'Group 2', 'Group 3'];
	
	let participants = [
		{ id: 1, name: 'Name 1' },
		{ id: 2, name: 'Name 2' },
		{ id: 3, name: 'Name 3' },
		{ id: 4, name: 'Name 4' },
		{ id: 5, name: 'Name 5' },
		{ id: 6, name: 'Name 6' },
		{ id: 7, name: 'Name 7' }
	];
	
	let sessions = [
		{ id: 1, label: 'Section 1' },
		{ id: 2, label: 'Section 2' },
		{ id: 3, label: 'Section 3' },
		{ id: 4, label: 'Section 4' },
		{ id: 5, label: 'Section 5' },
		{ id: 6, label: 'Section 6' },
		{ id: 7, label: 'Section 7' }
	];
	
	// Store attendance: { participantId: { sessionId: 'present'|'late'|'absent'|null } }
	let attendance = {};
	
	// Initialize attendance as null (white cells)
	participants.forEach(p => {
		attendance[p.id] = {};
		sessions.forEach(s => {
			attendance[p.id][s.id] = null;
		});
	});
	
	function setAttendance(participantId, sessionId, status) {
		attendance[participantId][sessionId] = status;
		// TODO: Add your API call here to save to backend
	}
	
	function getCellClass(participantId, sessionId) {
		const status = attendance[participantId][sessionId];
		if (!status) return 'bg-white';
		
		switch(status) {
			case 'present':
				return 'bg-green-500';
			case 'late':
				return 'bg-orange-400';
			case 'absent':
				return 'bg-red-500';
			default:
				return 'bg-white';
		}
	}
	
	function getButtonOpacity(participantId, sessionId, buttonType) {
		const status = attendance[participantId][sessionId];
		if (!status) return 'opacity-100';
		return status === buttonType ? 'opacity-100' : 'opacity-40';
	}
</script>

<div class="attendance-page">
	<h1 class="page-title">Attendance Overview</h1>
	
	<!-- Group selector and legend -->
	<div class="controls">
		<div class="group-selector">
			<label for="group-select">Group:</label>
			<select id="group-select" bind:value={selectedGroup}>
				{#each groups as group}
					<option value={group}>{group}</option>
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
	</div>
	
	<!-- Attendance table -->
	<div class="table-wrapper">
		<table class="attendance-table">
			<thead>
				<tr>
					<th class="name-header"></th>
					{#each sessions as session}
						<th class="session-header">{session.label}</th>
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
										title="Present"
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
										</svg>
									</button>
									
									<button
										on:click={() => setAttendance(participant.id, session.id, 'late')}
										class="btn btn-late {getButtonOpacity(participant.id, session.id, 'late')}"
										title="Late"
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path>
										</svg>
									</button>
									
									<button
										on:click={() => setAttendance(participant.id, session.id, 'absent')}
										class="btn btn-absent {getButtonOpacity(participant.id, session.id, 'absent')}"
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
</div>

<style>
	.attendance-page {
		padding: 0;
	}
	
	.page-title {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
		color: #0f172a;
	}
	
	.controls {
		display: flex;
		align-items: center;
		gap: 2rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	
	.group-selector {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.group-selector label {
		font-weight: 500;
		font-size: 1rem;
	}
	
	.group-selector select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: white;
		min-width: 140px;
		font-size: 0.875rem;
	}
	
	.legend {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		font-size: 0.875rem;
	}
	
	.legend-label {
		font-weight: 500;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.icon {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}
	
	.icon svg {
		width: 1rem;
		height: 1rem;
	}
	
	.icon-present {
		background: #22c55e;
	}
	
	.icon-late {
		background: #fb923c;
	}
	
	.icon-absent {
		background: #ef4444;
	}
	
	.table-wrapper {
		background: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}
	
	.attendance-table {
		width: 100%;
		border-collapse: collapse;
	}
	
	.attendance-table thead tr {
		background: #e5e7eb;
	}
	
	.attendance-table th,
	.attendance-table td {
		border: 1px solid #d1d5db;
		padding: 1rem;
	}
	
	.name-header,
	.session-header {
		font-weight: 500;
		text-align: center;
	}
	
	.name-header {
		min-width: 120px;
		text-align: left;
	}
	
	.session-header {
		min-width: 140px;
	}
	
	.name-cell {
		font-weight: 500;
		background: #f9fafb;
	}
	
	.attendance-cell {
		padding: 0.5rem;
	}
	
	.cell-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background-color 150ms;
	}
	
	.bg-white {
		background: white;
	}
	
	.bg-green-500 {
		background: #22c55e;
	}
	
	.bg-orange-400 {
		background: #fb923c;
	}
	
	.bg-red-500 {
		background: #ef4444;
	}
	
	.btn {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		transition: all 150ms;
		color: white;
	}
	
	.btn svg {
		width: 1.25rem;
		height: 1.25rem;
	}
	
	.btn-present {
		background: #22c55e;
	}
	
	.btn-present:hover {
		background: #16a34a;
	}
	
	.btn-late {
		background: #fb923c;
	}
	
	.btn-late:hover {
		background: #f97316;
	}
	
	.btn-absent {
		background: #ef4444;
	}
	
	.btn-absent:hover {
		background: #dc2626;
	}
	
	.opacity-100 {
		opacity: 1;
	}
	
	.opacity-40 {
		opacity: 0.4;
	}
</style>