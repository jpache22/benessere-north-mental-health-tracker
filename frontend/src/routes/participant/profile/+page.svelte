<!-- src/routes/participant/profile/+page.svelte -->
<script>
  let participant = {
    name: 'Participant Name',
    email: 'example@email.com',
    memberSince: 'Oct 2024',
    group: 'Group 1',
    session: 8,
    totalSessions: 15,
    nextSession: 'Jan 22'
  };

  let stats = {
    formsCompleted: 45,
    attendanceRate: '95%',
    sessionsRemaining: 8,
    progress: '68%'
  };

  let recentActivity = [
    { action: 'Completed PHQ-9 form', date: 'Oct 8, 2025 3:45 PM' },
    { action: 'Attended Session 8', date: 'Oct 8, 2024 10:00 AM' }
  ];

  let upcoming = {
    nextSession: 'Oct 15, 2024 at 10:00 AM',
    formsDue: '3 forms due by Oct 22, 2024'
  };

  // Sidebar active state
  let activeMenu = 'overview';
</script>

<div class="profile-shell" style="display:grid;grid-template-columns:280px 1fr;gap:20px">
  <!-- Left Sidebar -->
  <aside class="profile-sidebar" style="background:linear-gradient(180deg,#f5f5f5,#fafafa);border:1px solid var(--border);border-radius:14px;padding:20px">
    <div style="text-align:center;margin-bottom:20px">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);margin:0 auto 12px;display:grid;place-items:center;color:#fff;font-size:2rem;font-weight:700">
        {participant.name.split(' ').map(n => n[0]).join('')}
      </div>
      <h2 style="margin:0 0 4px;font-size:1.1rem">{participant.name}</h2>
      <p style="color:var(--muted);margin:0;font-size:.9rem">{participant.email}</p>
      <p style="color:var(--muted);margin:4px 0 0;font-size:.85rem">Member since: {participant.memberSince}</p>
    </div>

    <nav style="display:grid;gap:8px">
      <button on:click={() => activeMenu = 'overview'} class="menu-item" class:active={activeMenu === 'overview'} style="padding:10px 12px;border-radius:10px;text-align:left;border:none;background:{activeMenu === 'overview' ? '#fff' : 'transparent'};cursor:pointer;border:1px solid {activeMenu === 'overview' ? 'var(--border)' : 'transparent'}">
        • Overview
      </button>
      <button on:click={() => activeMenu = 'personal'} class="menu-item" class:active={activeMenu === 'personal'} style="padding:10px 12px;border-radius:10px;text-align:left;border:none;background:{activeMenu === 'personal' ? '#fff' : 'transparent'};cursor:pointer;border:1px solid {activeMenu === 'personal' ? 'var(--border)' : 'transparent'}">
        • Personal Info
      </button>
      <button on:click={() => activeMenu = 'group'} class="menu-item" class:active={activeMenu === 'group'} style="padding:10px 12px;border-radius:10px;text-align:left;border:none;background:{activeMenu === 'group' ? '#fff' : 'transparent'};cursor:pointer;border:1px solid {activeMenu === 'group' ? 'var(--border)' : 'transparent'}">
        • Group Info
      </button>
      <button on:click={() => activeMenu = 'settings'} class="menu-item" class:active={activeMenu === 'settings'} style="padding:10px 12px;border-radius:10px;text-align:left;border:none;background:{activeMenu === 'settings' ? '#fff' : 'transparent'};cursor:pointer;border:1px solid {activeMenu === 'settings' ? 'var(--border)' : 'transparent'}">
        • Settings
      </button>
      <button on:click={() => activeMenu = 'privacy'} class="menu-item" class:active={activeMenu === 'privacy'} style="padding:10px 12px;border-radius:10px;text-align:left;border:none;background:{activeMenu === 'privacy' ? '#fff' : 'transparent'};cursor:pointer;border:1px solid {activeMenu === 'privacy' ? 'var(--border)' : 'transparent'}">
        • Privacy
      </button>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="profile-content">
    {#if activeMenu === 'overview'}
      <div class="overview-section">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#dbeafe,#e0e7ff);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px">
          <h2 style="margin:0 0 10px">Overview</h2>
          <p style="color:var(--muted);margin:0">
            Group: {participant.group} • Session {participant.session} of {participant.totalSessions} • Next session: {participant.nextSession}
          </p>
        </div>

        <!-- Stats Grid -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
          <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
            <div style="color:var(--muted);font-size:.9rem;margin-bottom:6px">Form Completed</div>
            <div style="font-size:1.8rem;font-weight:700">{stats.formsCompleted}</div>
          </div>
          <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
            <div style="color:var(--muted);font-size:.9rem;margin-bottom:6px">Attendance Rate</div>
            <div style="font-size:1.8rem;font-weight:700">{stats.attendanceRate}</div>
          </div>
          <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
            <div style="color:var(--muted);font-size:.9rem;margin-bottom:6px">Sessions Remaining</div>
            <div style="font-size:1.8rem;font-weight:700">{stats.sessionsRemaining}</div>
          </div>
          <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center">
            <div style="color:var(--muted);font-size:.9rem;margin-bottom:6px">Progress</div>
            <div style="font-size:1.8rem;font-weight:700">{stats.progress}</div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px">
          <h3 style="margin:0 0 16px">Recent Activity</h3>
          {#each recentActivity as activity}
            <div style="display:flex;justify-content:space-between;padding:12px;background:#f8fafc;border-radius:10px;margin-bottom:10px">
              <span>✓ {activity.action}</span>
              <span style="color:var(--muted)">{activity.date}</span>
            </div>
          {/each}
        </div>

        <!-- Upcoming -->
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px">
          <h3 style="margin:0 0 16px">Upcoming</h3>
          <div style="padding:12px;background:#f0f9ff;border-radius:10px;margin-bottom:10px">
            Next session: {upcoming.nextSession}
          </div>
          <div style="padding:12px;background:#fef3c7;border-radius:10px">
            {upcoming.formsDue}
          </div>
        </div>
      </div>

    {:else if activeMenu === 'personal'}
      <div class="personal-info-section">
        <h2 style="margin:0 0 20px">Personal Information</h2>
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px">
          <form style="display:grid;gap:16px">
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Full Name</label>
              <input type="text" value={participant.name} class="input" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px" />
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Email Address</label>
              <input type="email" value={participant.email} class="input" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px" />
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Phone Number</label>
              <input type="tel" placeholder="(555) 123-4567" class="input" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px" />
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Date of Birth</label>
              <input type="date" class="input" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px" />
            </div>
            <div style="margin-top:10px">
              <button type="submit" class="btn" style="padding:10px 20px;background:var(--brand);color:#fff;border:none;border-radius:10px;cursor:pointer">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

    {:else if activeMenu === 'group'}
      <div class="group-info-section">
        <h2 style="margin:0 0 20px">Group Information</h2>
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px">
          <div style="display:grid;gap:16px">
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Group Name</label>
              <div style="padding:10px;background:#f8fafc;border:1px solid var(--border);border-radius:10px">
                {participant.group}
              </div>
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Current Session</label>
              <div style="padding:10px;background:#f8fafc;border:1px solid var(--border);border-radius:10px">
                Session {participant.session} of {participant.totalSessions}
              </div>
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Next Session</label>
              <div style="padding:10px;background:#f8fafc;border:1px solid var(--border);border-radius:10px">
                {upcoming.nextSession}
              </div>
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Therapist</label>
              <div style="padding:10px;background:#f8fafc;border:1px solid var(--border);border-radius:10px">
                Dr. Smith
              </div>
            </div>
            <div>
              <label style="display:block;color:var(--muted);font-size:.9rem;margin-bottom:6px">Group Coordinator</label>
              <div style="padding:10px;background:#f8fafc;border:1px solid var(--border);border-radius:10px">
                Jane Coordinator
              </div>
            </div>
          </div>
        </div>
      </div>

    {:else if activeMenu === 'settings'}
      <div class="settings-section">
        <h2 style="margin:0 0 20px">Settings</h2>
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px">
          <div style="display:grid;gap:20px">
            <div>
              <h3 style="margin:0 0 10px;font-size:1rem">Notifications</h3>
              <label style="display:flex;align-items:center;gap:10px;margin-bottom:8px;cursor:pointer">
                <input type="checkbox" checked />
                <span>Email notifications for new form assignments</span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;margin-bottom:8px;cursor:pointer">
                <input type="checkbox" checked />
                <span>Reminder emails for upcoming sessions</span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
                <input type="checkbox" />
                <span>SMS reminders (if phone provided)</span>
              </label>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:20px">
              <h3 style="margin:0 0 10px;font-size:1rem">Password</h3>
              <button class="btn outline" style="padding:8px 16px;border-radius:10px;cursor:pointer">
                Change Password
              </button>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:20px">
              <h3 style="margin:0 0 10px;font-size:1rem">Language</h3>
              <select class="input" style="padding:10px;border:1px solid var(--border);border-radius:10px;background:#fff">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    {:else if activeMenu === 'privacy'}
      <div class="privacy-section">
        <h2 style="margin:0 0 20px">Privacy & Data</h2>
        <div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px">
          <div style="display:grid;gap:20px">
            <div>
              <h3 style="margin:0 0 10px;font-size:1rem">Data Sharing</h3>
              <p style="color:var(--muted);margin:0 0 12px;font-size:.9rem">
                Your form responses are shared with your therapist and group coordinator. All data is encrypted and stored securely.
              </p>
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
                <input type="checkbox" checked />
                <span>Share my progress data with my therapist</span>
              </label>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:20px">
              <h3 style="margin:0 0 10px;font-size:1rem">Data Export</h3>
              <p style="color:var(--muted);margin:0 0 12px;font-size:.9rem">
                You can request a copy of all your data at any time.
              </p>
              <button class="btn outline" style="padding:8px 16px;border-radius:10px;cursor:pointer">
                Request Data Export
              </button>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:20px">
              <h3 style="margin:0 0 10px;font-size:1rem;color:#ef4444">Account Deletion</h3>
              <p style="color:var(--muted);margin:0 0 12px;font-size:.9rem">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button class="btn" style="padding:8px 16px;border-radius:10px;cursor:pointer;background:#ef4444;color:#fff;border:none">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  .menu-item:hover {
    background: #fff !important;
    border: 1px solid var(--border) !important;
  }
  .btn.outline {
    background: #fff;
    border: 1px solid var(--border);
    color: inherit;
  }
  .btn.outline:hover {
    background: #f8fafc;
  }
</style>